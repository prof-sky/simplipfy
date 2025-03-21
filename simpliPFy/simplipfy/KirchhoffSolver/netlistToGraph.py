from lcapy import Circuit
from simplipfy.netlistLine import NetlistLine
from networkx import MultiGraph

class NetlistToGraph:
    def __init__(self, lcapyCircuit: Circuit):
        self.cct = lcapyCircuit

    def toMultiGraph(self) -> MultiGraph:
        graph = MultiGraph()
        for line in self.cct.netlist().splitlines():
            netLine = NetlistLine(line)
            graph.add_edge(netLine.startNode, netLine.endNode, key=netLine.label)

        return graph