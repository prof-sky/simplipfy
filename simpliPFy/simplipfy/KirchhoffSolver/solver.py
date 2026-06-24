from operator import truediv
from typing import Union

import matplotlib.pyplot as plt
import networkx
import networkx as nx
from generalizeNetlistDrawing.circuitToGraph import CircuitToGraph
from networkx import cycle_basis, simple_cycles

from lcapyInskale import Circuit
from lcapyInskale.mnacpts import V, I
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.netlistLine import NetlistLine
from .direction import Direction
import collections
import random


def createDispNames(cptNames: list[str], language: LangSymbols, ms: bool) -> dict[str, str]:
    """
    :param cptNames: list of component names
    :param language: defines some language-specific symbols used in text, equations and labels
    :param ms: multiple sources, true if there are multiple sources in the circuit, false otherwise
    :returns: a dictionary with the cptNames as keys and the names that shall be displayed in the equations in the frontend as values.
    """

    dispNames = {}

    for name in cptNames:
        if name[0] in ["V", "I"]:
            if not ms:
                dispNames[name] = language.total
            else:
                dispNames[name] = name[1]
        else:
            dispNames[name] = name

    return dispNames

def loopsOfCircuit(cct: Circuit, eqNodeMap: Union[None, dict[str,str]]) -> tuple[list, int]:
    """
    :returns: a list of list. Each list contains nodes that make up a loop. Wires are removed from the loops. The
     nodes are not adjusted and therefore not connected, because the wires are removed. See makeNodeMap() to find connected
     nodes/ components.

    """

    if not eqNodeMap:
        eqNodeMap = makeNodeMap(cct)
    graph = CircuitToGraph(cct, networkx.MultiGraph, eqNodeMap=eqNodeMap).Graph
    loops = list(simple_cycles(graph))


    return loops, len(cycle_basis(cct.circuit_graph().G))

def basicLoopsOfCircuit(cct: Circuit, eqNodeMap: Union[None, dict[str,str]]) -> list:
    if not eqNodeMap:
        eqNodeMap = makeNodeMap(cct)
    #graph = CircuitToGraph(cct, networkx.MultiGraph, eqNodeMap=eqNodeMap).Graph
    G = cct.circuit_graph().G
    #draw_graph(G)

    h = nx.Graph() # Graph erstellen
    for line in cct.netlist().splitlines():
        l = NetlistLine(line)
        h.add_edge(l.posNode, l.negNode, key=l.label)
    #draw_graph(h)

    basicLoops = nx.cycle_basis(h)
    return basicLoops

def getEqNode(name:str, cct: Circuit, eqNodeMap: dict[str, str])-> tuple[str, str]:
    name1, name2 = cct[name].node_names
    return eqNodeMap[name1], eqNodeMap[name2]

def makeLoopFromElmList(cptNames: list, cct: Circuit, eqNodeMap: dict[str, str]) -> list:
    """
    :param cptNames: list of component names
    :param cct: circuit in witch cptNames are included
    :param eqNodeMap: dictionary with node names as keys and master node names as values, see makeNodeMap()
    :returns: a list of nodes that make up the loop or an empty list if there is no loop

    Creates a loop from the given cptNames. The set of nodes in the loop is the same as the set nodes from all
    components. Asserts that there are no nodes from wires in the loop and the loop has the correct order of nodes.
    """

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
    """
    :param loop: list of nodes
    :returns: a list of tuples. Each tuple contains two nodes that make up a pair. The last pair is (loop[-1], loop[0]).
    """

    loop = [str(node) for node in loop]
    return list(zip(loop, loop[1:] + loop[:1]))

def makeVoltageEquations(cct: Circuit, cptNames: list[str], language: LangSymbols, eqNodeMap: dict[str, str], ms: bool) -> tuple[str, list[int]]:
    """
    :param cct: circuit in witch cptNames are included
    :param cptNames: list of component names
    :param language: defines some language-specific symbols used in text, equations and labels
    :param eqNodeMap: dictionary with node names as keys and master node names as values, see makeNodeMap()
    :param ms: multiple sources, true if there are multiple sources in the circuit, false otherwise
    :returns: a string with the voltage equation in latex format

    Creates a voltage equation from the given cptNames. The equation is in the form of 0 = ... . The signs are defined
    by the direction of the loop. If the order of the nodes in the loop, is the same as pos to neg node from the component,
    the voltage is positive. If the order is reversed the voltage is negative. The loop is interpreted as pairs from
    left to right. A pair is (loop[n], loop[n+1]), with the last pair being (loop[-1] and loop[0]).

    Saves equation in a list indexed by component names (to check for linear dependence)

    ::

        V1 0 1 dc {10}; down
        R1 0 2; right
        R2 2 3; down
        R3 3 1; left

        loop = [0, 2, 3, 1]
        cptNames = [V1, R1, R2, R3]
        eqNodeMap = {0: 0, 1: 1, 2: 2, 3: 3}

        R1 from 0 to 2, loop pair is (0, 2), therefore VR1 is positive
        R2 from 2 to 3, loop pair is (2, 3), therefore V2 is positive
        R3 from 3 to 1, loop pair is (3, 1), therefore V3 is positive
        V1 from 0 to 1, loop pair is (1, 0), therefore V1 is negative

        eq: 0 = VR1 + V2 + V3 - V1
        eqVect: [-1, 1, 1, 1]
    """

    dispNames = createDispNames(cptNames, language, ms)

    eq = "0 ="
    u = language.volt
    loop = makeLoopFromElmList(cptNames, cct, eqNodeMap)
    if not loop:
        return "", [0]

    # this has to be true if the elements are in a valid loop because the voltage in the loop has to be 0
    if len(loop) == 2:
        eq += " - " + u +"_{" + dispNames[cptNames[0]] + "}" + " + " + u +"_{" + dispNames[cptNames[1]] + "}"
        eqVect = [1 if cpt == cptNames[0] else -1 if cpt ==cptNames[1] else 0 for cpt in cct.branch_list]
        return eq, eqVect

    nodePairs = makePairsFromList(loop)
    sign = {}
    for name in cptNames:
        dispName = dispNames[name]
        node1, node2 = getEqNode(name, cct, eqNodeMap)

        if (node1, node2) in nodePairs:
            eq += " + " + u +"_{" + dispName + "}"
            sign[name] = 1
            continue
        if (node2, node1) in nodePairs:
            eq += " - " + u +"_{" + dispName + "}"
            sign[name] = -1
    eqVect = [sign.get(name,0) for name in cct.branch_list]
    return eq,eqVect



def isValidVoltageLoop(cct: Circuit, cptNames: list[str], loops: list, eqNodeMap: dict[str, str]) -> bool:
    """
    :param cct: circuit in witch cptNames are included
    :param cptNames: list of component names
    :param loops: list of loops in the circuit, extracted from the graph with networkx.simple_cycles()
    :param eqNodeMap: dictionary with node names as keys and master node names as values, see makeNodeMap()
    :returns: a list of nodes that make up the loop or an empty list if there is no loop

    Check if the nodes of cptNames are part of a valid MESH in the graph.
    1. meshes = minimal loops -> no node is passed more than once - check: node appears exactly twice
    2. meshes/loops are connected components - check: are all nodes reachable from one starting node (with DFS)
    """

    adj = collections.defaultdict(list)
    for element in cptNames:
        n0, n1 = cct[element].node_names
        adj[eqNodeMap[n0]].append(eqNodeMap[n1])
        adj[eqNodeMap[n1]].append(eqNodeMap[n0])

    if not all(len(neighbors) == 2 for neighbors in adj.values()):
        return False

    nodes = list(adj.keys())

    visited = set()
    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in adj[node]:
            dfs(neighbor)
    dfs(nodes[0])

    return visited == set(nodes)



def draw_graph(graph):
    """
    Draws a graph using matplotlib and networkx.
    """

    # Visualize the graph
    pos = nx.spring_layout(graph)
    nx.draw_networkx_nodes(graph, pos)
    nx.draw_networkx_edges(graph, pos)
    nx.draw_networkx_labels(graph, pos)

    # Add edge labels with keys

    if isinstance(graph, nx.MultiGraph):
        edge_labels = {(u, v, k): k for u, v, k in graph.edges(keys=True)}
    else:
        edge_labels = {(u, v): k['key'] for u, v, k in graph.edges(data=True)}


    nx.draw_networkx_edge_labels(graph, pos, edge_labels=edge_labels)

    plt.show()

def isImplicitCurrentEquation(cct: Circuit, cptNames: list[str]) -> Union[any, bool]:
    """
    :param cct: circuit in witch cptNames are included
    :param cptNames: list of component names
    :returns: the common node where all components, of cptNames, are connected to or False if there is no common node

    Checks if the components in cptNames are connected to the same node/ potential. A current equation is considered
    implicit if there are only two components involved because it always results in I1 = I2.
    """

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
    """
    :returns: a dictionary where key is node and value is master node.

    Maps equipotential nodes to one master node.

    .. note ::
        ::

            E.g.:
            Let there be a simple circuit with 2 components and 2 nodes:
            V1 0 1 dc {10}; down
            W 0 2; right
            R1 2 3; down
            W 3 1; left

            The equipotential nodes are: potential1 {0, 2}, potential2 {1, 3}
            therefore the node map is:
            {0: 0, 2: 0, 1: 1, 3: 1}

            remove the wires from the circuit and replace the nodes with the value of the nodeMap:

            V1 0 1 dc {10}; down
            R1 0 1; down
    """

    eqNodeMap = {}
    for masterNode in cct.equipotential_nodes.keys():
        for node in cct.equipotential_nodes[masterNode]:
            eqNodeMap[node] = masterNode

    return eqNodeMap

def isCurrentEquation(cct: Circuit, cptNames: list[str], eqNodeMap: dict) -> Union[any, bool]:
    """
    :param cct: circuit in witch cptNames are included
    :param cptNames: list of component names
    :param eqNodeMap: dictionary with node names as keys and master node names as values, see makeNodeMap()
    :returns: the common node where all components, of cptNames, are connected to or False if there is no common node

    Checks if the components in cptNames are connected to the same node/ potential.
    And if no other component is connected to the same node.
    """

    noCptNames = [x for x in cct.branch_list if x not in cptNames]

    nodeSets = [{eqNodeMap[n1], eqNodeMap[n2]} for name in cptNames for n1, n2 in [cct[name].node_names]]
    commonNode = set.intersection(*nodeSets)

    if commonNode:
        for name in noCptNames:
            node1, node2 = cct[name].node_names
            if commonNode.intersection({eqNodeMap[node1], eqNodeMap[node2]}):
                return False
        return commonNode.pop()
    return False


def two_random_samples(CptNames: list) -> tuple[list[str], list[str]]:
    n = len(CptNames)
    if n < 2:
        raise ValueError("List must have at least 2 elements")

    k1 = random.randint(1, n - 1)
    k2 = random.randint(1, n - 1)

    sample1 = random.sample(CptNames, k1)

    # draw until different
    while True:
        sample2 = random.sample(CptNames, k2)
        if set(sample2) != set(sample1):
            break

    return sample1, sample2

def makeCurrentEquation(cct: Circuit, cptNames: list[str], commonNode, direction: Direction, language: LangSymbols, ms: bool) -> tuple[tuple[str,list],tuple[str, str, str]]:
    """
    :param cptNames: list of component names
    :param commonNode: node where all components, of cptNames, are connected to (a key (master node) of the eqNodeMap dict)
    :param direction: can be used to invert the signs of the equation
    :param language: defines some language-specific symbols used in text, equations and labels
    :parm ms: changes the source name to ges if only one source is in the circuit
    :returns: a tuple [eq, decoy1, decoy2]

     * eq: the equation in latex format
     * decoy1: the equation in latex format with all signs negative, positive if direction is counterClockwise
     * decoy2: the equation in latex format with all signs positive, negative if direction is counterClockwise

    Creates a current equation form the given cptNames and the common node. If the component is connected to the common
    node with its negative terminal the current is positive, if the component is connected to the common node with its
    positive terminal the current is negative.
    """
    dispNames = createDispNames(cptNames, language, ms)

    sign1 = " + " if direction.value else " - "
    sign2 = " - " if direction.value else " + "
    sign = {}

    eqNodeMap = makeNodeMap(cct)
    eq = "0 ="
    decoy1 = "0 ="
    decoy2 ="0 ="
    sample1, sample2 = two_random_samples(cptNames)
    for name in cptNames:
        dispName = dispNames[name]
        if isinstance(cct[name], (V,I)):
            node2, node1 = cct[name].node_names
        else:
            node1, node2 = cct[name].node_names
        if eqNodeMap[node2] == commonNode:
            eq += sign1 + "I_{" + dispName + "}"
            if name in sample1:
                decoy1 += sign2 + "I_{" + dispName + "}"
            else:
                decoy1 += sign1 + "I_{" + dispName + "}"
            if name in sample2:
                decoy2 += sign2 + "I_{" + dispName + "}"
            else:
                decoy2 += sign1 + "I_{" + dispName + "}"
            sign[name] = 1
        if eqNodeMap[node1] == commonNode:
            eq += sign2 + "I_{" + dispName + "}"
            if name in sample1:
                decoy1 += sign1 + "I_{" + dispName + "}"
            else:
                decoy1 += sign2 + "I_{" + dispName + "}"
            if name in sample2:
                decoy2 += sign1 + "I_{" + dispName + "}"
            else:
                decoy2 += sign2 + "I_{" + dispName + "}"
            sign[name] = -1
    eqVect = [sign.get(name,0) for name in cct.branch_list]
    return (eq,eqVect), (eq, decoy1, decoy2)

def makeIdenticalCurrentEq(cct: Circuit, cptNames: list[str], flipped, language: LangSymbols, ms: bool):
    dispNames = createDispNames(cptNames, language, ms)
    eq = "0 ="
    if len({cptNames[0], cptNames[1]} & set(flipped)) == 1: # exactly one is flipped
        eq += " -  I_{" + dispNames[cptNames[0]] + "}" + " - I_{" + dispNames[cptNames[1]] + "}"
        eqVect = [1 if cpt == cptNames[0] else 1 if cpt == cptNames[1] else 0 for cpt in cct.branch_list]
    else:
        eq += " -  I_{" + dispNames[cptNames[0]] + "}" + " + I_{" + dispNames[cptNames[1]] + "}"
        eqVect = [1 if cpt == cptNames[0] else -1 if cpt == cptNames[1] else 0 for cpt in cct.branch_list]
    return eq, eqVect

def makeAllIdenticalCurrentEq(cct: Circuit, cptNames: list[str], flipped, language: LangSymbols, ms: bool):
    dispNames = createDispNames(cptNames, language, ms)
    sample1, sample2 = two_random_samples(cptNames)

    sign = {name: "-" if name in flipped else "" for name in cptNames}
    decoy1_sign = {name: "-" if (name in flipped) ^ (name in sample1) else "" for name in cptNames}
    decoy2_sign = {name: "-" if (name in flipped) ^ (name in sample2) else "" for name in cptNames}

    dispNameList = [sign[name]+"I_{" + dispNames[name]+"}" for name in cptNames]
    decoyNameList1 = [decoy1_sign[name]+"I_{" + dispNames[name]+"}" for name in cptNames]
    decoyNameList2 = [decoy2_sign[name] + "I_{" + dispNames[name] + "}" for name in cptNames]

    eq = "=".join(dispNameList)
    decoy1 = "=".join(decoyNameList1)
    decoy2 = "=".join(decoyNameList2)

    return eq, decoy1, decoy2

def checkVoltageEq(cct: Circuit, CptWithSigns: list[tuple[str,int]], eqNodeMap: dict) -> bool:
    basicNodes = list(cct.equipotential_nodes.keys())
    isBalancedEq = [0]*len(basicNodes)
    for CptWithSign in CptWithSigns:
        n1,n2 = cct[CptWithSign[0]].node_names
        sgn = CptWithSign[1]
        for i,node in enumerate(basicNodes):
            if eqNodeMap[n1] == node:
                isBalancedEq[i] += sgn
            if eqNodeMap[n2] == node:
                isBalancedEq[i] -= sgn
    if all(x == 0 for x in isBalancedEq):
        return True
    else:
        return False


def checkCurrentEq(cct: Circuit, cptWithSigns: list[tuple[str,int]], eqNodeMap: dict) -> bool:
    basicLoops = basicLoopsOfCircuit(cct, eqNodeMap)
    isBalancedEq = [0]*(len(basicLoops)+1)
    for cptWithSign in cptWithSigns:
        if isinstance(cct[cptWithSign[0]], (V,I)):
            n2, n1 = cct[cptWithSign[0]].node_names
        else:
            n1, n2 = cct[cptWithSign[0]].node_names
        sgn = cptWithSign[1]
        cnt = 0
        for i,loop in enumerate(basicLoops):
            if [n1, n2] in [loop[j:j+2] for j in range(len(loop)-1)]:
                isBalancedEq[i] += sgn
                cnt += 1
            elif [n2, n1] in [loop[j:j+2] for j in range(len(loop)-1)]:
                isBalancedEq[i] -= sgn
                cnt += 1
            elif [n1, n2] == [loop[-1], loop[0]]:
                isBalancedEq[i] += sgn
                cnt += 1
            elif [n2, n1] == [loop[-1], loop[0]]:
                isBalancedEq[i] -= sgn
                cnt += 1
        if cnt == 1:
            isBalancedEq[-1] += -1*sgn
    if all(x == 0 for x in isBalancedEq):
        return True
    else:
        return False



