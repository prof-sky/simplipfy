from networkx import MultiGraph
from networkx.classes import Graph

from lcapyInskale import Circuit
from simplipfy.netlistLine import NetlistLine


class NetlistToGraph:
    def __init__(self, lcapyCircuit: Circuit, eqNodeMap: dict[str, str]):
        self.cct = lcapyCircuit
        self.eqNodeMap = eqNodeMap

    def toMultiGraph(self) -> MultiGraph:
        nodeMap = self.eqNodeMap
        graph = MultiGraph()
        for line in self.cct.netlist().splitlines():
            netLine = NetlistLine(line)
            if netLine.type == "W":
                continue
            graph.add_edge(nodeMap[str(netLine.startNode)], nodeMap[str(netLine.endNode)], key=netLine.label)

        return graph

    def toGraph(self):
        nodeMap = self.eqNodeMap
        graph = Graph()
        for line in self.cct.netlist().splitlines():
            netLine = NetlistLine(line)
            if netLine.type == "W":
                continue
            graph.add_edge(nodeMap[str(netLine.startNode)], nodeMap[str(netLine.endNode)], key=netLine.label)

        return graph