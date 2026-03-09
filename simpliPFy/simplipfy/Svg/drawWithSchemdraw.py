import os
from typing import Any
from warnings import warn

from generalizeNetlistDrawing.backends.positions import Positions
from generalizeNetlistDrawing.vector2D import Vector2D

import schemdrawInskale
import schemdrawInskale.elements as elm
from lcapyInskale import Circuit
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.impedanceConverter import getOmegaFromCircuit
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.netlistLine import NetlistLine
from simplipfy.Helpers.unitPrefixer import SIUnitPrefixer
from simplipfy.Helpers.unitWorkAround import UnitWorkAround as uwa
from simplipfy.Svg.Elements.components import ConnectionDot
from simplipfy.Svg.drawingConfig import drawing_config_instance as dc
from simplipfy.Svg.drawingElement import DrawingElement
from simplipfy.Svg.drawingElementFaktory import DrawingElementFaktory


class DrawWithSchemdraw:
    """
    Use the schemdrawInskale package to draw a netlist generated with lcapy
    """
    def __init__(self, circuit: Circuit, langSymbols: LangSymbols(), fileName: str = "circuit",
                 removeDangling: bool = True):
        """
        Use the schemdraw package to draw a netlist generated with lcapy. Only supports svg-files as output
        :param circuit: circuit to draw
        :param fileName: name for the generated file, standard is circuit.svg
        created pictures will be named by step e.g.: circuit_step0.svg
        """
        self.circuit = circuit
        self.nodePos: dict[int, Vector2D] = {}
        self.cirDraw = schemdrawInskale.Drawing()
        self.ls = langSymbols

        self.source = circuit.elements[self.circuit.sources[0]]
        self.omega_0 = getOmegaFromCircuit(circuit)

        if removeDangling:
            self.netlist = (circuit.remove_dangling()).netlist()
        else:
            self.netlist = circuit.netlist()

        self.fileName = os.path.splitext(fileName)[0]
        self.invertDrawParam = {"up": "down", "down": "up", "left": "right", "right": "left"}
        self.labelPos = {"up": False, "down": True, "left": True, "right": False}
        self.multipleSources = True if len(self.circuit.sources) > 1 else False

        # elm.style(elm.STYLE_IEC)
        # print("Enforce svg backend")
        schemdrawInskale.use(backend='svg')

        self.prefixer = SIUnitPrefixer()
        self.jsonExportBase = DictExportBase(precision=3, langSymbol=langSymbols)

        self.defkty = DrawingElementFaktory(langSymbols, self.omega_0, self.jsonExportBase, self.multipleSources)

    def getNetlistLines(self) -> list[NetlistLine]:
        """
        retriev the netlist lines from the circut
        """
        netLines: list[NetlistLine] = []
        for line in self.netlist.splitlines():
            netLines.append(NetlistLine(line))

        return netLines

    def latexStr(self, line: NetlistLine):
        """
        convert value of the NetlistLine to a latex string
        """
        if line.value is None or line.type is None:
            return None
        else:
            return self.jsonExportBase.latexWithPrefix(uwa.addUnit(line.value, line.type))

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

    def getElementPositionsFromNetlist(self, maxDrawingIterations: int = 100) -> list[DrawingElement]:
        """
        get the positions required to draw a circuit from the netlist
        """
        netLines = self.getNetlistLines()
        # start with the source than add where one node is known, avoids drawing nodes at a place it should not be
        sourceLabel = NetlistLine(str(self.source)).label
        source = next(line for line in netLines if line.label == sourceLabel)
        netLines = netLines.copy()
        netLines.remove(source)

        drawingElems: list[DrawingElement] = [self.defkty.makeFromNetline(str(source), Vector2D(0, 0))]
        self.nodePos = {source.posNode: drawingElems[0].startPos, source.negNode: drawingElems[0].endPos}

        #  reverse list to be able to delete objects while iterating from the back of the list and keep original order
        #  of list
        netLines.reverse()

        iteration = 0
        while len(netLines):
            for line in netLines:
                if line.posNode in self.nodePos.keys():
                    start = self.nodePos[line.posNode]
                    newElm = self.defkty.makeFromNetline(str(line), start)
                    self.nodePos[line.negNode] = newElm.endPos
                    drawingElems.append(newElm)
                    netLines.remove(line)
                elif line.negNode in self.nodePos.keys():
                    start = self.nodePos[line.negNode] - DrawingElement.textToDirectionVector(line.drawParam).scale(3)
                    newElm = self.defkty.makeFromNetline(str(line), start)
                    self.nodePos[line.posNode] = newElm.startPos
                    drawingElems.append(newElm)
                    netLines.remove(line)

            iteration += 1
            if iteration > maxDrawingIterations:
                warn("Maximum drawing iterations exceeded")
                break

        return drawingElems

    @staticmethod
    def _posCount(pos: Vector2D, posCount: dict[Vector2D, int], dotPoss: set[Vector2D]):
        """
        helper function to count the number of occurrences of a position
        """
        newPosCount = posCount.get(pos, 0) + 1
        if newPosCount > 2:
            dotPoss.add(pos)
        else:
            posCount[pos] = newPosCount

    def add_connection_dots(self, drawingElements: list[DrawingElement], addToList = True) -> list[DrawingElement]:
        """
        finds positions that occur more than 2 times and adds a dot at this position
        :param drawingElements: the start and end positions of those elements are checked
        :param addToList: if True the dots extend the drawingElements list, if False a new list with the dots is returned
        :returns: None if addToList is True, else a list with the dots
        Is used to indicate that two overlapping wires are connected
        """
        posCount = {}
        dotPoss = set()
        dots: list[DrawingElement] = []
        for drawElm in drawingElements:
            self._posCount(drawElm.startPos, posCount, dotPoss)
            self._posCount(drawElm.endPos, posCount, dotPoss)

        for dot in dotPoss:
            dots.append(self.defkty.makeDot(dot))

        if addToList:
            drawingElements.extend(dots)

        return dots


    def getElementPositionsFromObjects(self) -> tuple[list[DrawingElement], dict[Any, list[Vector2D]]]:
        """
        get the positions required to draw a cricuti from generalizeNetlistDrawing.elements.element
        """
        drawingElements: list[DrawingElement] = []
        positionoing = Positions(self.netlist, optimize=dc.optimize)
        elmPosistions = positionoing.placedElems.elements

        for elm in elmPosistions:
            drawingElements.append(self.defkty.makeFromElement(elm))
        return drawingElements, positionoing.placedElems.nodePos

    def getImageData(self, maxDrawingIterations: int = 100) -> str:
        """
        :returns: svg image data as utf-8 string
        """
        dots: list[ConnectionDot] = []


        if dc.generalize:
            np: dict[Any, list[Vector2D]]
            drawingElements, np = self.getElementPositionsFromObjects()
            for node in np.keys():
                for vec in np[node]:
                    # ToDo get elment length from somewhere save
                    vec.scaleSelf(3)
                    dots.append(self.defkty.makeDot(vec, node))
        else:
            drawingElements = self.getElementPositionsFromNetlist(maxDrawingIterations)
            for node in self.nodePos.keys():
                dots.append(self.defkty.makeDot(self.nodePos[node], node))


        if dc.showNodes:
            drawingElements.extend(dots)
        else:
            self.add_connection_dots(drawingElements)

        for elm in drawingElements:
            elmPos = self.cirDraw.add(elm.schemdrawElement())
            elm.voltLabel(self.cirDraw, elmPos)
            elm.curLabel(self.cirDraw, elmPos)

        return self.cirDraw.get_imagedata().decode('utf-8')

    def legacy_add_connection_dots(self):
        """
        adds the dots that are on connections between two lines e.g. when a line splits up in two lines a dot is created
        at the split point
        :returns: does not return anything
        """
        # count the occurrences of each node and if it is greater than 2 set a dot
        counts = {}
        netLines = self.getNetlistLines()

        for line in netLines:
            counts[line.posNode] = counts.get(line.posNode, 0) + 1
            counts[line.negNode] = counts.get(line.negNode, 0) + 1
        for node in counts.keys():
            if counts[node] > 2:
                self.cirDraw.add(elm.Dot().at(self.nodePos[node].asTuple))
