from typing import Union

from lcapyInskale import grammar, mnacpts
from lcapyInskale.parser import Parser


class NetlistLine:
    """
    Wrapper for lcapy Objects to access frequently used attributes
    """
    electricalComponent = ["R", "L", "C", "Z", "ZR", "ZL", "ZC"]
    realComponent = ["R", "L", "C"]
    complexComponent = ["Z", "ZR", "ZL", "ZC"]
    sources = ["V", "I"]
    meters = ["VM", "AM"]

    def __init__(self, line: str):
        """
        :param line: a line of a lcapy.Circuit.netlist()
        """

        self.parser: Parser = NetlistLineParser()
        self.cpt = self.parser.parse(line)
        self.line = line.replace('{', '').replace('}', '')

        optKeys = list(self.cpt.opts.keys())
        if optKeys and optKeys[0] in ["down", "up", "left", "right"]:
            self.drawParam = optKeys[0]
        elif optKeys:
            from simplipfy.Tools.printColored import cPrint
            cPrint("no drawing hint found at optKey[0], searching all option")
            for key in optKeys:
                if key in ["down", "up", "left", "right"]:
                    self.drawParam = key
                    break
            cPrint("no drawing hint found, using empty string")
            self.drawParam = ""
        else:
            self.drawParam = ""

        self.cpt = self.parser.parse(line)
        self.type = self.cpt.type
        self.typeSuffix = self.cpt.name.replace(self.type, "", 1)

        self.posNode: str = self.cpt.node_names[0]
        self.negNode: str = self.cpt.node_names[1]


        if self.type in self.electricalComponent:
            self.ac_dc, self.value, self.phase, self.omega = self._parseRLCZ()
        elif self.type == "W":
            self.ac_dc, self.value, self.phase, self.omega, self.typeSuffix = self._parseW()
        elif self.type in self.sources:
            self.ac_dc, self.value, self.phase, self.omega = self._parseSource()
        elif self.type in self.meters:
            self.ac_dc, self.value, self.phase, self.omega = self._parseMeter()


    def _is_AC_or_DC(self) -> Union[str, None]:
        """
        determine if the source is AC or DC
        """
        if not (self.type == "V" or self.type == "I"):
            return None
        if self.cpt.has_ac and not self.cpt.has_dc:
            return "ac"
        elif self.cpt.has_dc and not self.cpt.has_ac:
            return "dc"
        else:
            raise RuntimeError(f" if type is V or I (is: {self.type}) should be ac or dc not both")

    @staticmethod
    def _parseW() -> (None, None, None, None, str):
        """
        parse type W (wires)
        """
        # self.typeSuffix for wires has to be "", that in drawWithSchemdraw the id-tag in the svg-file is empty
        return None, None, None, None, ""

    def _parseRLCZ(self) -> (None, any, None, None):
        """
        :returns: (None, value, None, None)

        parse types R, L, C, Z, ZR, ZL, ZC (resistor, inductor, capacitor, impedance)
        """
        ac_dc = None
        value = self.cpt.args[0]
        phase = None
        omega = None

        return ac_dc, value, phase, omega

    def _parseSource(self) -> (str, str, str, str):
        """
        :returns: (ac_dc, value, phase, omega)

        parse a voltage or current source with type V or I
        """
        value = self.cpt.args[0]
        if self.cpt.has_ac:
            if len(self.cpt.args) > 1:
                phase = self.cpt.args[1]
            else:
                phase = None
            if len(self.cpt.args) > 2:
                omega = self.cpt.args[2]
            else:
                omega = None
        else:
            phase = None
            omega = None

        ac_dc = self._is_AC_or_DC()

        return ac_dc, value, phase, omega

    @staticmethod
    def _parseMeter() -> (None, None, None, None):
        """
        :returns: (None, None, None, None)

        parse a voltage or current meter with type VM or AM
        """
        return None, None, None, None

    @property
    def label(self) -> str:
        if not self.type == "W":
            return self.type + self.typeSuffix
        else:
            return ""

    def swapNodes(self):
        """
        swaps the nodes of the netlist line, result:

        ::

            self.posNode = self.negNode
            self.negNode = self.posNode
        """
        endNode = self.negNode
        self.negNode = self.posNode
        self.posNode = endNode

    def reconstruct(self) -> str:
        """
        :returns: reconstructed string

        reconstructs self.line from the parsed elements self.type, self.typeSuffix, self.startNode, self.endNode,
        self.ac_dc, self.value, self.phase, self.omega, self.drawParam
        """
        reconstructFrom = [self.type + self.typeSuffix, " " + self.posNode, " " + self.negNode]

        if self.ac_dc is not None:
            reconstructFrom.append(" " + self.ac_dc)
        if self.value is not None:
            value = str(self.value)
            if not (value.startswith("{") and value.endswith("}")):
                value = "{" + value + "}"
            reconstructFrom.append(" " + value)
        if self.phase is not None:
            reconstructFrom.append(" " + self.phase)
        if self.omega is not None:
            reconstructFrom.append(" " +  self.omega)

        reconstructFrom.append("; " + self.drawParam)

        return "".join(reconstructFrom)

    def __str__(self):
        """
        reconstructs the netlist line from the class properties, can be used to get the original line or get a new
        line after changing properties
        """
        return self.reconstruct()


class NetlistLineParser:
    _instance = None

    def __new__(cls, *args, **kwargs) -> Parser:
        if cls._instance is None:
            cls._instance = Parser(mnacpts, grammar, False)
        return cls._instance

    def __init__(self, value=None):
        if not hasattr(self, '_initialized'):  # Ensure `__init__` runs only once
            self.value = value
            self._initialized = True
