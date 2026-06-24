from enum import Enum
from imaplib import MapCRLF
from os.path import join
from simplipfy.Magnetic.magneticCircuit import MCircuit
from simplipfy.Tools.printColored import CPrintColors as cpc, cPrint

class ValueType(Enum):
    any = "any"
    string = "string"
    float = "float"


class ValidateMagneticFile:
    """
    Class to validate a magnetic circuit file.
    Use:
    init the class with the file name and path or the file content as string
    ::

        1:
            isValid() -> bool, valid if True
            in self.errMsg and self.warnMsg are the error and warning messages
            a call to isValid() or validate() will reset the error and warning messages
        2:
            validate() -> tuple[bool, str, str], bool True if valid, str error str error messages, str warning messages
    """
    def __init__(self, fileName: str = None, filePath: str = "", fileStr: str = None, valueType: ValueType = ValueType.any):
        """
        :param fileName: name of the file to be validated, without extension
        :param filePath: path to the file
        :fileSte: content of a circuit file as string
        :param valueType: if set checks if the parsed value in the netlist is the specified type, default is ValueType.any
         set (fileName and filePath) or (fileStr) if both are set fileStr is dominant
        """
        self.valueType: ValueType = valueType
        self.fileData: str = ""
        self.fileInfo = join(filePath, fileName) if fileName else ""


        if not fileName and not fileStr:
            raise ValueError("Either fileName or fileStr must be provided")

        if fileName:
            self.fileData = open(self.fileInfo, "r").read()

        if fileStr:
            self.fileData = fileStr

        self.magneticCircuit = MCircuit.parse(self.fileData)
        self.validSyntax = True
        self.validSemantic = True

        self._errMsg = ""
        self._warnMsg = ""

    def resetErrAndWarnMsg(self):
        self._errMsg = ""
        self._warnMsg = ""

    def validateSyntax(self):

        for idx, line in enumerate(self.fileData.split("\n"), start=1):
            try:
                if line.startswith("#"):
                    continue
                MCircuit.parse(line)
            except:
                if line == "":
                    # lcapy behaves strangely with empty lines where additional empty lines are put into the netlist
                    # of the parsed circuit which breaks internal processing this is the easiest way to handle this
                    self._errMsg += f"Syntax error on line {idx}: empty line\n"
                else:
                    self._errMsg += f"Syntax error on line {idx}: {line}\n"
                self.validSyntax = False

        return self

    def _checkDrawingHint(self):
        for idx, line in enumerate(self.fileData.split("\n"), start=1):
            if line.startswith("#"):
                continue

            if line.find(";") != -1:
                _, drawingHint = line.split(";")
                if drawingHint.strip(" ").lower() in ["up", "down", "left", "right"]:
                    continue
                else:
                    self._warnMsg += f"warning, drawing hint missing on line {idx}: {line}\n"
            else:
                self._warnMsg += f"warning, drawing hint missing on line {idx}: {line}\n"

        return self

    def validateSemantic(self):
        if self.validSyntax:
            self._checkNodeCount()
            self._checkValues()
            self._checkDrawingHint()

        else:
            self.validSemantic = False

        return self

    def _checkValues(self):
        for idx, line in enumerate(self.fileData.split("\n"), start=1):
            if line.startswith('#'):
                continue
            netline = MCircuit.parse(line).cpts[0]
            # source specific checks
            if netline.type == "V":
                self._check_source(netline)

            # core
            core = getattr(netline, "core", netline)
            self._check_core(core)

            # optional gap
            gap = getattr(netline, "gap", None)
            if gap:
                self._check_gap(gap)

    def _require_positive(self, value, name):
        if not value.is_positive:
            raise ValueError(f"{name} must be positive")

    def _require_positive_int(self,value, name):
        if not (value.is_positive and value.is_integer):
            raise ValueError(f"{name} must be a positive integer")

    def _check_source(self, netline):
        self._require_positive_int(netline.numberOfWindings, "numberOfWindings")
        self._require_positive(netline.currentOfSource, "currentOfSource")

    def _check_gap(self, gap):
        self._require_positive(gap.length, "gap length")
        self._require_positive(gap.area, "gap area")

    def _check_core(self, core):
        self._require_positive(core.length, "length")
        self._require_positive(core.area, "area")
        self._require_positive(core.relativePermeability, "relative permeability")



    def _checkNodeCount(self):
        degree = dict(self.magneticCircuit.graph.degree())
        for key in degree:
            try:
                int(key)
            except:
                self._errMsg += f"Node name on line {key} " f"must be an integer\n"
                self.validSemantic = False
            if degree[key] < 2:
                self._errMsg += f"Semantic error, node {key} only appears once\n"
                self.validSemantic = False

    def isValid(self, warnings=True) -> bool:
        """
        :param warnings: bool, if True print warnings
        :retuns: bool, True if the circuit file is valid, False otherwise

        Check if the circuit file is valid and return a boolean value.
        """
        self.resetErrAndWarnMsg()

        self.validateSyntax()
        self.validateSemantic()

        if self.errMsgs:
            cPrint(self.errMsgs)
        if self._warnMsg and warnings:
            cPrint(self.warnMsgs, color=cpc.YELLOW)

        return self.validSemantic and self.validSyntax


    def isMagnetic(self, warnings=True) -> bool:
        """
                :param warnings: bool, if True print warnings
                :retuns: bool, True if the magnetic circuit file is valid, False otherwise
                Check if the circuit file is valid and return a boolean value.
                """
        self.resetErrAndWarnMsg()
        self.validateMagneticSyntax()
        self.validateMagneticSemantic()

        if self.errMsgs:
            cPrint(self.errMsgs)
        if self._warnMsg and warnings:
            cPrint(self.warnMsgs, color=cpc.YELLOW)

        return self.validSyntax #and self.validSemantic


    @property
    def errMsgs(self) -> str:
        """
        :returns: a string with all error messages found while running self.validate() or self.isValid()
        """
        if self._errMsg.endswith("\n"):
            return self._errMsg[:-1]
        else:
            return self._errMsg

    @property
    def warnMsgs(self) -> str:
        """
        returns a string with all warning messages found while running self.validate() or self.isValid()
        """
        if self._warnMsg.endswith("\n"):
            return self._warnMsg[:-1]
        else:
            return self._warnMsg

    def validate(self, warnings=True) -> tuple[bool, str, str]:
        """
        :param warnings: bool, True if warnings should be returned, if false [bool, str, ""]
        :returns: [bool, str, str]

        * Ture if the circuit file is valid, False otherwise
        * str error messages
        * str warning messages

        Validate the circuit file and return error and warn messages.
        """
        isValid: bool = self.isValid(warnings)
        errMsg = self.errMsgs
        warnMsg = ""

        if self._warnMsg and warnings:
                warnMsg = self.warnMsgs

        return isValid, errMsg, warnMsg

if __name__ == "__main__":
    a = ValidateMagneticFile(fileName="00_Magnetic.txt", filePath="..\\Circuits\\magnetic")
    a.validate()