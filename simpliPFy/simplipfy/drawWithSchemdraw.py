import schemdraw
import schemdraw.elements as elm
import os
from warnings import warn
from lcapy import Circuit
from simplipfy.netlistLine import NetlistLine
from typing import List
from simplipfy.impedanceConverter import ImpedanceToComponent
from simplipfy.impedanceConverter import getSourcesFromCircuit, getOmegaFromCircuit
from simplipfy.unitWorkAround import UnitWorkAround as uwa
from simplipfy.unitPrefixer import SIUnitPrefixer
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.langSymbols import LangSymbols


class DrawWithSchemdraw:
    """
    Use the schemdraw package to draw a netlist generated with lcapy
    """
    def __init__(self, circuit: Circuit, langSymbols: LangSymbols(), fileName: str = "circuit",
                 removeDangling: bool = True):
        """
        Use the schemdraw package to draw a netlist generated with lcapy. Only supports svg-files as output
        :param circuit: lcapy.Circuit object
        :param fileName: name for the generated file, standard is circuit.svg
        created pictures will be named by step e.g.: circuit_step0.svg
        """
        self.circuit = circuit
        self.nodePos = {}
        self.cirDraw = schemdraw.Drawing()
        self.ls = langSymbols

        self.source = circuit.elements[getSourcesFromCircuit(circuit)[0]]
        self.omega_0 = getOmegaFromCircuit(circuit, getSourcesFromCircuit(circuit))

        if removeDangling:
            self.netlist = (circuit.remove_dangling()).netlist()
        else:
            self.netlist = circuit.netlist()

        self.netLines: List[NetlistLine] = []
        self.fileName = os.path.splitext(fileName)[0]
        self.invertDrawParam = {"up": "down", "down": "up", "left": "right", "right": "left"}
        self.labelPos = {"up": False, "down": True, "left": True, "right": False}

        # elm.style(elm.STYLE_IEC)
        # TODO would be nice to dont need this
        # print("Enforce svg backend")
        schemdraw.use(backend='svg')

        for line in self.netlist.splitlines():
            self.netLines.append(NetlistLine(line))

        self.prefixer = SIUnitPrefixer()
        self.jsonExportBase = DictExportBase(precision=3, langSymbol=langSymbols)

    def latexStr(self, line: NetlistLine):
        if line.value is None or line.type is None:
            return None
        else:
            return self.jsonExportBase.latexWithPrefix(uwa.addUnit(line.value, line.type))

    def addNodePositions(self, startNode, endNode):
        if startNode not in self.nodePos.keys():
            self.nodePos[startNode] = self.cirDraw.elements[-1].start
        if endNode not in self.nodePos.keys():
            self.nodePos[endNode] = self.cirDraw.elements[-1].end

    def addElement(self, element: schemdraw.elements, netLine: NetlistLine):

        # if no node position is known this is the first element it is used as the start points
        if netLine.startNode not in self.nodePos.keys() and netLine.endNode not in self.nodePos.keys():
            self.cirDraw.add(element)
        # if both node positions are known draw the element between them
        elif netLine.startNode in self.nodePos and netLine.endNode in self.nodePos.keys():
            self.cirDraw.add(
                element.endpoints(
                    self.nodePos[netLine.startNode],
                    self.nodePos[netLine.endNode]
                )
            )
        # if only the start node is known draw from there
        elif netLine.startNode in self.nodePos.keys():
            self.cirDraw.add(element.at(self.nodePos[netLine.startNode]))
        # if only the end node is known invert the direction information and start at the end node
        else:
            try:
                element._userparams['d'] = self.invertDrawParam[netLine.drawParam]
                self.cirDraw.add(element.at(self.nodePos[netLine.endNode]))
                self.addNodePositions(netLine.endNode, netLine.startNode)
                return
            except KeyError:
                raise RuntimeError(f"unknown drawParam {netLine.drawParam}")

        self.addNodePositions(netLine.startNode, netLine.endNode)

    @staticmethod
    def orderNetlistLines(netLines: list[NetlistLine]):
        """
        order the netlist so that the nodes are in a drawable sequence. The drawing process relies on defined node
        positions that are only known if it already has drawn to this node.
        E.g. 1:
        R1 2 3; left
        R2 3 4; left
        R3 4 5; left -> works
        E.g. 2:
        R1 2 3; left
        R3 4 5; left
        R2 3 4; left -> does not work
        this function reorders E.g. 2 into E.g 1
        :return: void, list is reordered in place
        """
        netLines.sort(key=lambda x: x.startNode)

    def draw(self, path=""):
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

    def getImageData(self, maxDrawingIterations: int = 100) -> str:
        DrawWithSchemdraw.orderNetlistLines(self.netLines)

        # start with the source than add where one node is known, avoids drawing node at a place it should not be
        sourceLabel = NetlistLine(str(self.source)).label
        source = next(line for line in self.netLines if line.label == sourceLabel)
        self.draw_element(source)
        self.netLines.remove(source)

        netLines = self.netLines.copy()
        #  reverse list to be able to delete objects while iterating from the back of the list and keep original order
        #  of list
        netLines.reverse()

        iteration = 0
        while len(netLines):
            for line in netLines[::-1]:
                if line.startNode in self.nodePos.keys() or line.endNode in self.nodePos.keys():
                    self.draw_element(line)
                    netLines.remove(line)

            iteration += 1
            if iteration > maxDrawingIterations:
                warn("Maximum drawing iterations exceeded")
                break

        self.add_connection_dots()

        return self.cirDraw.get_imagedata().decode('utf-8')

    def draw_element(self, line: NetlistLine):
        value = None
        sdElement = None

        # labels get the value "###.### ##" to set the viewport to max width frontend relies on correct viewport witdth
        # to change labels to its representative value
        id_ = line.label
        label = "###.### ##"
        if line.type == "W":
            label = ""
        elif line.type == 'V' or line.type == 'I':
            value = line.value
        else:
            line = NetlistLine(ImpedanceToComponent(netlistLine=line, omega_0=self.omega_0))
            value = self.latexStr(line)
            id_ = line.label

        if line.type == "R" or line.type == "Z":
            sdElement = elm.Resistor(id_=id_, class_=value, d=line.drawParam, fill="transparent")
        elif line.type == "L":
            sdElement = elm.Resistor(id_=id_, class_=value, d=line.drawParam, fill=True)
        elif line.type == "C":
            sdElement = elm.Capacitor(id_=id_, class_=value, d=line.drawParam, fill="transparent")
        elif line.type == "W":
            sdElement = elm.Line(d=line.drawParam)
        elif line.type == "V":
            # this is necessary because lcapy and schemdraw have a different convention for sources
            line.swapNodes()

            if line.ac_dc == "ac":
                sdElement = elm.sources.SourceSin(id_=id_, class_=value, d=line.drawParam)
            elif line.ac_dc == "dc":
                sdElement = elm.sources.StabilizedSource(id_=id_, class_=value, d=line.drawParam)
        elif line.type == "I":
            # this is necessary because lcapy and schemdraw have a different convention for sources
            line.swapNodes()
            sdElement = elm.sources.SourceI(id_=id_, class_=value, d=line.drawParam)

        else:
            raise RuntimeError(f"unknown element type {line.type}")

        if line.drawParam == "left" or line.drawParam == "right":
            self.addElement(sdElement.label(label, ofst=0.2, class_='element-label ' + id_), line)
        else:
            self.addElement(sdElement.label(label, ofst=(-0.4, -0.1), class_='element-label ' + id_), line)

        curLabel = elm.CurrentLabelInline(direction='in', class_="current-label arrow I" + line.typeSuffix).at(sdElement)
        volLabel = elm.CurrentLabel(top=self.labelPos[line.drawParam], length=1.5, class_="voltage-label arrow " + self.ls.volt + line.typeSuffix, ofst=0.15).at(sdElement)

        if line.type == "V" or line.type == "I":
            self.cirDraw.add(curLabel.label('###.### ##', class_='current-label arrow ' + "I"+self.ls.total, ofst=(0.1, 0)))
            self.cirDraw.add(volLabel.reverse().label('###.### ##', class_='voltage-label arrow ' + self.ls.volt+self.ls.total, ofst=(-0.2, 0.1)))
        elif not line.type == "W":
            self.cirDraw.add(curLabel.label('###.### ##', class_='current-label arrow ' + "I" + id_[1:], ofst=(-0.1, 0)))
            self.cirDraw.add(volLabel.label('###.### ##', loc='bottom', class_='voltage-label arrow ' + self.ls.volt + id_[1:], ofst=(0.2, -0.1)))

    def add_connection_dots(self):
        """
        adds the dots that are on connections between two lines e.g. when a line splits up in two lines a dot is created
        at the split point
        :return: does not return anything
        """
        # count the occurrences of each node and if it is greater than 2 set a dot
        counts = {}
        for line in self.netLines:
            counts[line.startNode] = counts.get(line.startNode, 0) + 1
            counts[line.endNode] = counts.get(line.endNode, 0) + 1
        for node in counts.keys():
            if counts[node] > 2:
                self.cirDraw.add(elm.Dot().at(self.nodePos[node]))
