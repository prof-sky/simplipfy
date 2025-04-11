from itertools import cycle, islice
from typing import Union

import matplotlib.pyplot as plt
import networkx as nx
from networkx import simple_cycles, cycle_basis

from lcapyInskale import Circuit
from simplipfy.langSymbols import LangSymbols
from .direction import Direction
from .netlistToGraph import NetlistToGraph


def loopsOfCircuit(cct: Circuit, eqNodeMap: Union[None, dict[str,str]]) -> tuple[list, int]:
    """
    returns: a list of list. Each list contains nodes that make up a loop. Wires are removed from the loops. The
    nodes are not adjusted and therefore not connected to be able to find the nodes in the circuit.
    """
    if not eqNodeMap:
        eqNodeMap = makeNodeMap(cct)
    transformer = NetlistToGraph(cct, eqNodeMap)
    graph = transformer.toMultiGraph()
    diGraph = transformer.toGraph()
    loops = list(simple_cycles(graph))


    return loops, len(cycle_basis(cct.circuit_graph().G))

def getEqNode(name:str, cct: Circuit, eqNodeMap: dict[str, str])-> tuple[str, str]:
    name1, name2 = cct[name].node_names
    return eqNodeMap[name1], eqNodeMap[name2]

def makeLoopFromElmList(cptNames: list, cct: Circuit, eqNodeMap: dict[str, str]) -> list:
    loop = []

    namePairs = makePairsFromList(cptNames)
    for nameA, nameB in namePairs:
        nodeA1, nodeA2 = getEqNode(nameA, cct, eqNodeMap)
        nodeB1, nodeB2 = getEqNode(nameB, cct, eqNodeMap)

        #find node the elements have in common
        setA = {nodeA1, nodeA2}
        setB = {nodeB1, nodeB2}
        commonNode = setA.intersection(setB)

        if not commonNode:
            return []

        if nodeA1 == commonNode.pop():
            loop.append(nodeA2)
        else:
            loop.append(nodeA1)

    return loop

def makePairsFromList(loop: list) -> list[tuple[str, str]]:
    loop = [str(node) for node in loop]
    loopP1 = islice(cycle(loop), 1, None)
    return list(zip(loop, loopP1))

def makeVoltageEquations(cct: Circuit, cptNames: list[str], language: LangSymbols, eqNodeMap: dict[str, str]) -> str:
    eq = "0 ="
    u = language.volt
    loop = makeLoopFromElmList(cptNames, cct, eqNodeMap)
    if not loop:
        return ""

    if len(loop) == 2:
        return eq + " - " + u +"_{" + cptNames[0] + "}" + " + " + u +"_{" + cptNames[1] + "}"

    nodePairs = makePairsFromList(loop)
    for name in cptNames:
        node1, node2 = getEqNode(name, cct, eqNodeMap)

        if (node1, node2) in nodePairs:
            eq += " + " + u +"_{" + name + "}"
            continue
        if (node2, node1) in nodePairs:
            eq += " - " + u +"_{" + name + "}"

    return eq

def isValidVoltageLoop(cct: Circuit, cptNames: list[str], loops: list, eqNodeMap: dict[str, str]) -> list:
    elmNodeList = []
    for element in cptNames:
        node0, node1 = cct[element].node_names
        elmNodeList.append(eqNodeMap[node0])
        elmNodeList.append(eqNodeMap[node1])

    elmNodeSet = set(elmNodeList)
    for uniqueVal in elmNodeSet:
        if elmNodeList.count(uniqueVal) != 2:
            return []

    loopSet = lambda loop : set([str(node) for node in loop])

    for loop in loops:
        if loopSet(loop) == elmNodeSet:
            return loop
    return []

def draw_graph(graph):
    # Visualize the graph
    pos = nx.spring_layout(graph)
    nx.draw_networkx_nodes(graph, pos)
    nx.draw_networkx_edges(graph, pos)
    nx.draw_networkx_labels(graph, pos)

    # Add edge labels with keys
    edge_labels = {(u, v): k for u, v, k in graph.edges(keys=True)}
    nx.draw_networkx_edge_labels(graph, pos, edge_labels=edge_labels)

    plt.show()

def isImplicitCurrentEquation(cct: Circuit, cptNames: list[str]) -> Union[any, bool]:
    if len(cptNames) == 2:
        cptN1, cptN2 = cptNames
        if cptN2 in cct.in_series(cptN1):
            cNodeSet = set(cct[cptN1].node_names).intersection(set(cct[cptN2].node_names))
            if cNodeSet:
                return cNodeSet.pop()
            else:
                return False
    return False

def makeNodeMap(cct: Circuit) -> dict[str, str]:
    eqNodeMap = {}
    for masterNode in cct.equipotential_nodes.keys():
        for node in cct.equipotential_nodes[masterNode]:
            eqNodeMap[node] = masterNode

    return eqNodeMap

def isCurrentEquation(cct: Circuit, cptNames: list[str], eqNodeMap: dict) -> Union[any, bool]:

    nodeSets = []
    for name in cptNames:
        node1, node2 = cct[name].node_names
        nodeSets.append({eqNodeMap[node1], eqNodeMap[node2]})

    commonNode = nodeSets[0].intersection(nodeSets[1])
    for nodeSet in nodeSets[2:]:
        commonNode = commonNode.intersection(nodeSet)

    if commonNode:
        return commonNode.pop()

    return False

def makeCurrentEquation(cct: Circuit, cptNames: list[str], commonNode, direction: Direction, language: LangSymbols) -> tuple[str, str, str]:
    sign1 = " + " if direction.value else " - "
    sign2 = " - " if direction.value else " + "

    eqNodeMap = makeNodeMap(cct)
    eq = "0 ="
    decoy1 = "0 ="
    decoy2 ="0 ="
    for name in cptNames:
        node1, node2 = cct[name].node_names
        if eqNodeMap[node2] == commonNode:
            eq += sign1 + "I_{" + name + "}"
            decoy1 += sign2 + "I_{" + name + "}"
            decoy2 += sign1 + "I_{" + name + "}"
        if eqNodeMap[node1] == commonNode:
            eq += sign2 + "I_{" + name + "}"
            decoy1 += sign2 + "I_{" + name + "}"
            decoy2 += sign1 + "I_{" + name + "}"
    return eq, decoy1, decoy2