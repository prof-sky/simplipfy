from lcapyInskale.schematics.components import cpt
from simplipfy.Helpers.langSymbols import LangSymbols
import os
import schemdrawInskale
import schemdrawInskale.elements as elm
from simplipfy.Svg.magneticDrawingElement import MagneticDrawingElement

schemdrawInskale.use(backend='svg')
from simplipfy.Magnetic.magneticCircuit import MCircuit


class MagneticDrawWithSchemdraw:
    oppositeDir =  {"up":"down", "down":"up", "left":"right", "right":"left"}
    dirCoordinates = {
        "right": (3, 0),
        "left": (-3, 0),
        "up": (0, 3),
        "down": (0, -3),
    }
    def __init__(self, magnetic_circuit: MCircuit, langSymbols: LangSymbols(), fileName: str = "magnetic_cirucit"):
        self.magnetic_circuit = magnetic_circuit
        self.ls = langSymbols
        #self.source =
        self.fileName = fileName
        self.netlist = magnetic_circuit.netlist
        #self.multipleSources =
        self.graph = magnetic_circuit.graph
        self.node_positions = {}
        self.positioned = set()
        self.mCircuit = magnetic_circuit

    def get_node_positions(self):
        self.node_positions = {}
        self.positioned = set()
        self.NodePosRecursion(list(self.graph.nodes)[0])
        if len(self.positioned) != len(self.graph):
            raise ValueError("Circuit is not a single connected component")
        return self.node_positions

    def getNetlistLines(self) -> list:
        netLines = []
        for line in self.netlist.splitlines():
            netLines.append(line)
        return netLines

    def draw(self, path=""):
        """
        save the svg image as a svg-file
        name of the file will be self.fileName
        :param path: path to save the svg file
        """
        # save the created svg file
        if os.path.splitext(self.fileName)[1] == ".svg":
            saveName = self.fileName
        else:
            saveName = self.fileName + ".svg"

        savePath = os.path.join(path, saveName)
        svgFile = open(savePath, 'w')
        svgFile.write(self.getImageData())
        svgFile.close()

        return savePath


    def NodePosRecursion(self, node, prev=None, edge_name=None):
        # reverse if coming from endNode
        if prev is None:
            # No node positioned yet so start with first one
            self.node_positions[node] = (0,0)
        elif node in self.positioned:
            return
        else:
            px, py = self.node_positions[prev]
            edge_type = self.mCircuit[edge_name].type
            endNode = self.mCircuit[edge_name].negativeNode
            direction = self.mCircuit[edge_name].drawingDirection
            dx, dy = self.dirCoordinates[direction]
            if prev == endNode:
                dx, dy = -dx, -dy
            self.node_positions[node] = (px + dx, py + dy)
        self.positioned.add(node)
        for next, name in self.graph.adj[node].items():
            self.NodePosRecursion(next, node, name['name'])

    def drawElements(self):
        node_positions = self.get_node_positions()
        drawing = schemdrawInskale.Drawing()

        for cpt in self.magnetic_circuit.cpts:
            pos = node_positions[cpt.positiveNode]

            element = MagneticDrawingElement(
                cpt,
                pos
            ).build()

            drawing.add(element)

        return drawing

    def getImageData(self):
        drawing = self.drawElements()
        return drawing.get_imagedata().decode('utf-8')
