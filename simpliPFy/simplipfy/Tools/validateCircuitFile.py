from enum import Enum
from os.path import join

from simplipfy.Helpers.netlistLine import NetlistLine
from simplipfy.Tools.printColored import CPrintColors as cpc, cPrint


class ValueType(Enum):
    any = "any"
    string = "string"
    float = "float"


class ValidateCircuitFile:
    """
    Class to validate a circuit file.
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
                NetlistLine(line)
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
            netLine = NetlistLine(line)
            if not netLine.type == "W" and not self.valueType == ValueType.any:
                try:
                    if self.valueType == ValueType.string:
                        str(netLine.value)
                    if self.valueType == ValueType.float:
                        float(netLine.value)
                except:
                    self._errMsg += f"Wrong Type of value on line: {idx} " \
                          f"value: {netLine.value} " \
                          f"expected: {self.valueType}"


    def _checkNodeCount(self):
        nodeCount = {}
        for line in self.fileData.splitlines():
            if line.startswith('#'):
                continue
            netLine = NetlistLine(line)
            nodeCount[netLine.posNode] = nodeCount.get(netLine.posNode, 0) + 1
            nodeCount[netLine.negNode] = nodeCount.get(netLine.negNode, 0) + 1

        for key in nodeCount.keys():
            if nodeCount[key] < 2:
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
    a = ValidateCircuitFile(fileName="00_Resistor_Hetznecker.txt", filePath="..\\Circuits\\resistor")
    a.validate()