import schemdraw
import schemdraw.elements as elm
from warnings import warn
from lcapy import Circuit


class NetlistLine:
    def __init__(self, line: str, validate: bool = True):
        self.line = line.replace('{', '').replace('}', '')

        # parse line
        elementParam, drawParam = self.line.split(';')
        self.drawParam = drawParam.replace(' ', '')
        values = elementParam.split(' ')
        values = [value for value in values if not value == '']

        for i in range(len(values)):
            values[i] = values[i].replace('{', '').replace('}', '')

        if len(values) < 3:
            raise RuntimeError("Cant parse netlist line: %s"
                               "make sure each line has a name startNode endNode; drawing annotation "
                               "e.g. looks like: "
                               "V1 0 1 dc {10]; up --- "
                               "W 2 3; left --- "
                               "C3 6 7 {100}; down", self.line)

        self.type = values[0][0]

        self.typeSuffix, self.startNode, self.endNode, self.ac_dc = NetlistLine.parseLabelAndNodes(values)

        if self.type == "R" or self.type == "L" or self.type == "C" or self.type == "Z":
            self.ac_dc, self.value, self.omega = self.parseZ(values)
        elif self.type == "W":
            self.ac_dc, self.value, self.omega, self.typeSuffix = self.parseW()
        elif self.type == "Z":
            self.ac_dc, self.value, self.omega = self.parseZ(values)
        elif self.type == "V":
            self.ac_dc, self.value, self.omega = self.parseV(values)

        self.reconstructed = self.reconstruct()

        if validate:
            self.validate_parsing()

    @staticmethod
    def parseLabelAndNodes(values) -> (str, int, int, str):
        typeSuffix = values[0][1::]
        try:
            startNode = int(values[1])
            endNode = int(values[2])
        except ValueError:
            raise ValueError(f"can't convert {values[1]} or {values[2]} to int. start- and endNode have to be integers")
        ac_dc = None
        return typeSuffix, startNode, endNode, ac_dc

    @staticmethod
    def parseValue(values) -> str:
        return values[3]

    def parseRLC(self, values) -> str:
        return self.parseValue(values)

    @staticmethod
    def parseW() -> (None, None, None, str):
        return None, None, None, ""

    @staticmethod
    def parseZ(values) -> (None, str, None):
        if len(values) > 4:
            for i in range(4, len(values)):
                values[3] += " " + values[i]

        params = f"{values[0]} {values[1]} {values[2]} {values[3]}"
        labelAndNodes = f"{values[0]} {values[1]} {values[2]} "
        value = params.replace(labelAndNodes, '')
        return None, value, None

    @staticmethod
    def parseV(values) -> (str, str, str):
        # with ac or dc but without value for source and omega
        if len(values) == 4:
            ac_dc = values[3]
            return ac_dc, None, None

        # with ac dc statement and with value for source
        elif len(values) == 5:
            ac_dc = values[3]
            value = values[4]
            return ac_dc, value, None

        # with ac dc statement, value and omega for source
        elif len(values) == 6:
            ac_dc = values[3]
            value = values[4]
            omega = values[5]

            return ac_dc, value, omega
        """
        reconstructs self.line from the parsed elements self.label, self.startNode, self.endNode, self.ac_dc, self.value
        self.omega, self.drawParam
        :param lenValues:
        :return:
        """
        if lenValues == 3:
            reconstructed = f"{self.label} {self.startNode} {self.endNode}; {self.drawParam}"
        elif lenValues == 4:
            reconstructed = f"{self.label} {self.startNode} {self.endNode} {self.value}; {self.drawParam}"
        elif not self.omega:
            reconstructed = f"{self.label} {self.startNode} {self.endNode} {self.ac_dc} {self.value}; {self.drawParam}"
        else:
            reconstructed = f"{self.label} {self.startNode} {self.endNode} {self.ac_dc} {self.value} {self.omega}; {self.drawParam}"

        return reconstructed

    def validate_parsing(self):
        """
        raises an error if parsing fails and warns if it may fail. May fail if the parsed line cant be reconstructed but
        the reconstructed and parsed line without white spaces match.
        :return: void
        """
        # check if the parsing was successful if the line can be reconstructed it should be parsed correctly
        # white space sensitive but without "{"; "}"
        ref = self.line
        # white space insensitive
        ref2 = ref.replace(' ', '')

        if not self.reconstructed == ref and not self.reconstructed == ref2:
            raise RuntimeError(f"Error while parsing {self.line}: reconstructed -> {self.reconstructed}")
        if not ref == self.reconstructed and ref2 == self.reconstructed:
            warn(f"potential error while parsing {self.line}: reconstructed -> {self.reconstructed}")

    def __str__(self):
        return self.reconstructed


class DrawWithSchemdraw:
    def __init__(self, circuit: Circuit, fileName: str = "circuit.svg"):
    """
    Use the schemdraw package to draw a netlist generated with lcapy
    """
    def __init__(self, circuit: Circuit, fileName: str = "circuit.svg", removeDangling: bool = True):
        """
        Use the schemdraw package to draw a netlist generated with lcapy. Only supports svg-files as output
        :param circuit: lcapy.Circuit object
        :param fileName: name for the generated file, standard is circuit.svg
        created pictures will be named by step e.g.: circuit_step0.svg
        """
        self.nodePos = {}
        self.cirDraw = schemdraw.Drawing()

        if removeDangling:
            self.netlist = (circuit.remove_dangling()).netlist()
        else:
            self.netlist = circuit.netlist()
        self.netLines = []
        self.fileName = fileName
        elm.style(elm.STYLE_IEC)

        for line in self.netlist.splitlines():
            self.netLines.append(NetlistLine(line))

    def addNodePos(self, start: int, end: int):
        if start not in self.nodePos.keys():
            self.nodePos[start] = self.cirDraw.elements[-1].start
        if end not in self.nodePos.keys():
            self.nodePos[end] = self.cirDraw.elements[-1].end

    def addElement(self, element: schemdraw.elements, netLine: NetlistLine, showLabel: bool = True):

        if showLabel:
            label = netLine.label
        else:
            label = ""

        # if no node position is known this is the first element it is used as the start points
        if netLine.startNode not in self.nodePos.keys() and netLine.endNode not in self.nodePos.keys():
            self.cirDraw.add(element.label(label))
        # if both node positions are known draw the element between them
        elif netLine.startNode in self.nodePos and netLine.endNode in self.nodePos.keys():
            self.cirDraw.add(
                element.label(label).endpoints(
                    self.nodePos[netLine.startNode],
                    self.nodePos[netLine.endNode]
                )
            )
        # if only the start node is known draw from there
        elif netLine.startNode in self.nodePos.keys():
            self.cirDraw.add(element.label(label).at(self.nodePos[netLine.startNode]))
        # if only the end node is known invert the direction information and start at the end node
        else:
            if netLine.drawParam == "up":
                self.cirDraw.add(element.label(label).down().at(self.nodePos[netLine.endNode]))
            elif netLine.drawParam == "down":
                self.cirDraw.add(element.label(label).up().at(self.nodePos[netLine.endNode]))
            elif netLine.drawParam == "left":
                self.cirDraw.add(element.label(label).right().at(self.nodePos[netLine.endNode]))
            elif netLine.drawParam == "right":
                self.cirDraw.add(element.label(label).left().at(self.nodePos[netLine.endNode]))
            else:
                raise RuntimeError(f"unknown drawParam {netLine.drawParam}")

        self.addNodePos(netLine.startNode, netLine.endNode)

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

    def draw(self):
        DrawWithSchemdraw.orderNetlistLines(self.netLines)
        for line in self.netLines:
            print(line)
        for line in self.netLines:
            if line.type == "R":
                self.addElement(elm.Resistor(d=line.drawParam), line)
            elif line.type == "L":
                self.addElement(elm.Inductor(d=line.drawParam), line)
            elif line.type == "C":
                self.addElement(elm.Capacitor(d=line.drawParam), line)
            elif line.type == "W":
                self.addElement(elm.Line(d=line.drawParam), line, False)
            elif line.type == "V":
                if line.ac_dc == "ac":
                    self.addElement(elm.sources.SourceV(d=line.drawParam), line)
                elif line.ac_dc == "dc":
                    self.addElement(elm.sources.SourceV(d=line.drawParam), line)

        self.cirDraw.save(self.fileName)
