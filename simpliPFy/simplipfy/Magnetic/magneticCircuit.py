from xml.etree.ElementPath import prepare_parent

from simplipfy.Magnetic.elements import MagneticElementFkt, MagneticElement
from simplipfy.Magnetic.elements import MagneticCore, Gap, MagnetomotiveForceSource
from typing import TypeVar, Type
import networkx as nx

T = TypeVar('T', bound=MagneticElement)

class MCircuit:
    def __init__(self):
        self.cpts: list[MagneticElement] = []
        self.index: dict[str, MagneticElement] = {}


    def append(self, element: MagneticElement):
        self.cpts.append(element)
        self.index[element.componentType + element.identifier] = element

    def filterElems(self, type: Type[T]) -> list[T]:
        return [cpt for cpt in self if isinstance(cpt, type)]

    def __getitem__(self,name:str) -> MagneticElement:
        return self.index[name]

    @property
    def netlist(self) -> str:
        netlist = ""
        for cpt in self.cpts:
            netlist += str(cpt) + "\n"
        return netlist

    @property
    def graph(self) -> nx.Graph:
        """Build a graph representation of the magnetic circuit.
            Each component in the netlist becomes an edge in an undirected graph.
            netlist: Parsed magnetic netlist containing circuit components."""
        G = nx.Graph()
        for cpt in self.cpts:
            n1 = cpt.positiveNode
            n2 = cpt.negativeNode
            G.add_edge(n1, n2, name=cpt.type + cpt.identifier)
        return G

    def __iter__(self):
        return iter(self.cpts)

    @staticmethod
    def parse(netlist: str) -> 'MCircuit':
        fkt = lambda line: MagneticElementFkt.getElement(line)
        lines = netlist.splitlines()
        mCircuit = MCircuit()

        for line in lines:
            if line.startswith('#'):
                continue
            line=line.replace('{', '').replace('}', '')
            mCircuit.append(fkt(line))

        return mCircuit
