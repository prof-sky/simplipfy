from networkx.classes import MultiGraph

from lcapy import Circuit
from .netlistToGraph import NetlistToGraph
import networkx as nx
from networkx import simple_cycles
import matplotlib.pyplot as plt
from itertools import cycle, islice
from simplipfy.langSymbols import LangSymbols
from typing import Union

def makeVoltageEquations(cct: Circuit, cptNames: list[str], loop: list, language: LangSymbols) -> str:
    eq = "0 = "
    u = language.volt
    loop = [str(node) for node in loop]
    nodePairs = list(zip(loop[:-1], loop[1:]))
    for name in cptNames:
        node1, node2 = cct[name].node_names
        if (node1, node2) in nodePairs:
            eq += " + "+ u +"_{" + name + "}"
            continue
        if (node2, node1) in nodePairs:
            eq += " - "+ u +"_{" + name + "}"

    return eq

def isValidVoltageLoop(cct: Circuit, cptNames: list[str]) -> list:

    graph = NetlistToGraph(cct).toMultiGraph()
    loops = list(simple_cycles(graph))
    newLoops = removeWiresFromLoopList(loops, graph)

    elmNodeSet = set()
    for element in cptNames:
        nodes = cct[element].node_names
        elmNodeSet.add(nodes[0])
        elmNodeSet.add(nodes[1])

    for loop in newLoops:
        if set([str(node) for node in loop]) == elmNodeSet:
            return loop
    return []

def removeWiresFromLoop(loop, graph: MultiGraph) -> list:
    loopCopy = loop.copy()
    loopCopyP1 = islice(cycle(loopCopy), 1, None)
    loopCopyP2 = islice(cycle(loopCopy), 2, None)
    pathSlices = list(zip(loopCopy, loopCopyP1, loopCopyP2))

    for pathSlice in pathSlices:
        u, v, x = pathSlice
        if all(key == "" for key in graph[u][v]) and all(key == "" for key in graph[v][x]):
            loopCopy.remove(v)

    return loopCopy

def removeWiresFromLoopList(loops: list, graph) -> list[list]:
    newLoops: list[list] = []

    for loop in loops:
        newLoops.append(removeWiresFromLoop(loop, graph))

    return newLoops

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

def canBeCurrentEquation(cct: Circuit, cptNames: list[str]) -> bool:
    pass

def isImplicitCurrentEquation(cct: Circuit, cptNames: list[str]) -> Union[any, bool]:
    if len(cptNames) == 2:
        cptN1, cptN2 = cptNames
        if cptN2 in cct.in_series(cptN1):
            return (set(cct[cptN1].node_names).intersection(set(cct[cptN2].node_names))).pop()
    return False

def makeNodeMap(cct: Circuit) -> dict:
    eqNodeMap = {}
    for masterNode in cct.equipotential_nodes.keys():
        for node in cct.equipotential_nodes[masterNode]:
            eqNodeMap[node] = masterNode

    return eqNodeMap

def isCurrentEquation(cct: Circuit, cptNames: list[str]) -> Union[any, bool]:
    #this should only be done once for each circuit
    eqNodeMap = makeNodeMap(cct)

    nodeSets = []
    for name in cptNames:
        node1, node2 = cct[name].node_names
        nodeSets.append({eqNodeMap[node1], eqNodeMap[node2]})

    commonNode = nodeSets[0].intersection(nodeSets[1])
    for nodeSet in nodeSets[2:]:
        commonNode.intersection(nodeSet)

    if commonNode:
        return commonNode.pop()

    return False

def makeCurrentEquation(cct: Circuit, cptNames: list[str], commonNode, language: LangSymbols) -> str:
    eqNodeMap = makeNodeMap(cct)
    eq = "0 = "
    for name in cptNames:
        node1, node2 = cct[name].node_names
        if eqNodeMap[node1] == commonNode:
            eq += " - I_{" + name + "}"
        if eqNodeMap[node2] == commonNode:
            eq += " + I_{" + name + "}"
    return eq