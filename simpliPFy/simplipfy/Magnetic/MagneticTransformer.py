from collections import Counter
import networkx as nx
import os

from . import magneticStates
from .magneticCircuit import MCircuit
from .magneticStates import MagneticStates
from simplipfy.Svg.magneticDrawWithSchemdraw import MagneticDrawWithSchemdraw as mdws
from simplipfy.Helpers.langSymbols import LangSymbols


class MagneticTransformer:
    def __init__(self, magneticFilename: str, path: str) -> None:
        """Initialize the magnetic transformer.
        Loads a magnetic netlist file, constructs a graph representation of magnetic circuit"""
        self.filename = magneticFilename
        self.path = path
        self.node_map = {}
        self.mCircuit = MCircuit.parse(open(self.filename,"r").read())
        self.mDrawer = mdws(self.mCircuit, LangSymbols())
        self.node_positions = self.mDrawer.get_node_positions()
        self.graph = self.mCircuit.graph
        self.transformed = []
        self.el_netlist = []
        self.source_coord = {}
        self.opposite = {"up": "down", "down": "up","left": "right","right": "left"}


    def transformed_all_elements(self) -> bool:
        """ Checks if all magnetic components have been transformed.
        Returns: True if all elements of magnetic circuit are transformed to electric elements"""
        flattened_transformed = [cpt for sublist in self.transformed for cpt in sublist]
        assert len(flattened_transformed) <= len(self.mCircuit.cpts), "More components found than possible"
        return len(flattened_transformed) == len(self.mCircuit.cpts)

    def in_series(self,cptNames: list[str]) -> bool:
        """checks if components of magnetic-circuit graph are all in series
        A set of components is considered to be in series if:
        - Only two nodes occur once (e.g. we have a connected graph component).
        - All internal nodes have degree 2 in the graph."""
        nodes = []
        for cpt in cptNames:
            cpt_line = self.mCircuit[cpt]
            n1 = cpt_line.positiveNode
            n2 = cpt_line.negativeNode
            nodes.extend([n1,n2])
        node_counts = Counter(nodes)
        single_nodes = [n for n, count in node_counts.items() if count == 1]
        double_nodes = [n for n, count in node_counts.items() if count >= 2]
        if len(single_nodes) > 2:
            return False
        elif any(self.graph.degree(node) !=2 for node in double_nodes): #degree of inner edges not 2
            return False
        else:
            return True

    def write_new_lines(self, cptNames: list[str]) -> list[str]:
        """Generate electric netlist lines for a transformed component group.
        If the first component is a magnetic source (type 'V'), the function
        creates an MMF source and series resistance.
        Otherwise, resistance of all components in the group (in series) are summed.
            cptNames: List of magnetic component identifiers.
        Returns: List[str]: Lines representing the equivalent electric netlist."""
        new_lines = []
        cpt_0 = cptNames[0]
        cpt0_line = self.mCircuit[cpt_0]
        direction = cpt0_line.drawingDirection
        n1 = cpt0_line.positiveNode
        n2 = cpt0_line.negativeNode
        index = len(self.transformed)
        if cpt0_line.type == "V":
            n_btw = "N" + n1 + n2
            mr = cpt0_line.mr
            mmfSource = cpt0_line.mmfSource
            new_lines.append(cpt_0 + " " + n1 + " "+n_btw + f" {{{mmfSource}}}; " + cpt0_line.drawingDirection)
            new_lines.append(f"R{index} {n2} {n_btw} {{{mr}}}; {self.opposite[direction]}")

        else: # not a source
            mr = sum(self.mCircuit[cpt].mr for cpt in cptNames)
            print(self.node_positions)
            if self.is_parallel_to_source(self.mCircuit[cpt_0]):
                n_btw = "N" + n1 +n2
                new_lines.append(f"R{index} {n1} {n_btw} {{{mr}}}; {direction}")
                new_lines.append(f"W {n_btw} {n2};  {direction}")
            else: new_lines.append(f"R{index} {n1} {n2} {{{mr}}}; {direction}")

        for cpt in cptNames[1:]:
            n1 = self.mCircuit[cpt].positiveNode
            n2 = self.mCircuit[cpt].negativeNode

            if self.is_parallel_to_source(self.mCircuit[cpt]):
                n_btw = "N" + n1 +n2
                new_lines.append(f"W {n1} {n_btw};  {self.mCircuit[cpt].drawingDirection}")
                new_lines.append(f"W {n_btw} {n2};  {self.mCircuit[cpt].drawingDirection}")
            else: new_lines.append(f"W {n1} {n2};  {self.mCircuit[cpt].drawingDirection}")
        return new_lines

    def is_parallel_to_source(self, cpt) -> bool:
        node_pos = self.node_positions
        if not self.source_coord:
            for cpt in self.mCircuit.cpts:
                if cpt.type == "V":
                    self.source_coord[cpt] = (node_pos[cpt.positiveNode],
                                              node_pos[cpt.negativeNode])
        cx1, cy1 = node_pos[cpt.positiveNode]
        cx2, cy2 = node_pos[cpt.negativeNode]
        for src_start, src_end in self.source_coord.values():
            sx1, sy1 = src_start
            sx2, sy2 = src_end

            if cpt.drawingDirection in ("up", "down"):
                if (cy1 == sy1 and cy2 == sy2) or (cy1 == sy2 and cy2 == sy1):
                    return True

            elif cpt.drawingDirection in ("left", "right"):
                # compare X axis
                if (cx1 == sx1 and cx2 == sx2) or (cx1 == sx2 and cx2 == sx1):
                    return True

        return False

    def check_transformation(self, cptNames: list[str]) -> MagneticStates:
        """Check whether a group of magnetic components can be transformed.
        Args:
            cptNames: List of magnetic component identifiers.
        Returns:
            MagneticStates | bool"""

        if len(cptNames) == 0: # oder fangen wir das schon früher ab?
            return MagneticStates.chooseOneElement
        if len(cptNames) == 1:
            transformed_line = self.write_new_lines(cptNames)
            self.el_netlist.extend(transformed_line)
            self.transformed.append(cptNames)
            return MagneticStates.isTransformable # single elements can always be transformed
        elif any(self.mCircuit[cpt].type == "V" for cpt in cptNames):
            return MagneticStates.notSingleSource
        elif self.in_series(cptNames):
            transformed_line = self.write_new_lines(cptNames)
            self.el_netlist.extend(transformed_line)
            self.transformed.append(cptNames)
            return MagneticStates.isTransformable
        else:
            return MagneticStates.notSingleSource