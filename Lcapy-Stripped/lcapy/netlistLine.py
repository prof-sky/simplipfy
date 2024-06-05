from warnings import warn

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

    def label(self):
        if not self.type == "W":
            return self.type + self.typeSuffix
        else:
            return ""

    def reconstruct(self) -> str:
        """
        reconstructs self.line from the parsed elements self.type, self.typeSuffix, self.startNode, self.endNode,
        self.ac_dc, self.value, self.omega, self.drawParam
        :return: reconstructed string
        """
        if self.type == "W":
            reconstructed =\
                f"{self.type+self.typeSuffix} {self.startNode} {self.endNode}; {self.drawParam}"
        elif self.type in ["R", "L", "C", "Z", "ZR", "ZL", "ZC"]:
            reconstructed =\
                f"{self.type+self.typeSuffix} {self.startNode} {self.endNode} {self.value}; {self.drawParam}"
        elif self.type == "V" and not self.omega:
            reconstructed =\
                (f"{self.type+self.typeSuffix} {self.startNode} {self.endNode} {self.ac_dc} {self.value};"
                 f" {self.drawParam}")
        else:
            reconstructed =\
                (f"{self.type+self.typeSuffix} {self.startNode} {self.endNode} {self.ac_dc} {self.value} {self.omega};"
                 f" {self.drawParam}")

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

