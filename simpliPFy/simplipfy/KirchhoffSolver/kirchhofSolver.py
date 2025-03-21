import os

from lcapy import Circuit
import simplipfy.KirchhoffSolver.solver as khf
from simplipfy.langSymbols import LangSymbols
from .kirchhoffStates import KirchhoffStates

class KirchhoffSolver:
    def __init__(self, circuitFileName: str, path: str, langSymbols: dict = {}):
        self.elementSetsOfEquations: list[set] = []
        self.language = LangSymbols(langSymbols)
        self.fileName = circuitFileName
        self.path = path
        self.circuit = Circuit(os.path.join(path, circuitFileName))
        self.foundEq = 0
        elementNames = self.circuit.branch_list
        self.numUnknownElements = len([elm for elm in elementNames if elm[0] != "V"]) # voltages of sources are known
        self._equations: list[str] = []
        for addPlaceholder in range(self.numUnknownElements):
            self._equations.append("-")
        self.missingElmInVoltEq = set(elementNames)

    def foundAllEquations(self) -> bool:
        return self.numUnknownElements == self.foundEq

    def foundAllVoltEquations(self) -> bool:
        return not self.missingElmInVoltEq

    def equations(self):
        return self._equations

    def setEquation(self, value, cptNames) -> int:
        nameSet = set(cptNames)
        if nameSet in self.elementSetsOfEquations:
            return KirchhoffStates.duplicateEquation.value
        self._equations[self.foundEq] = value
        self.foundEq += 1
        self.elementSetsOfEquations.append(nameSet)
        return KirchhoffStates.isNewEquation.value

    def checkVoltageLoopRule(self, cptNames: list[str]) -> tuple[int, str]:
        eq = ""
        if self.foundAllVoltEquations():
            return KirchhoffStates.duplicateEquation.value, eq
        state = KirchhoffStates.notAValidEquation.value
        loop = khf.isValidVoltageLoop(self.circuit, cptNames)

        if loop:
            eq = khf.makeVoltageEquations(self.circuit, cptNames, loop, self.language)
            state = self.setEquation(eq, cptNames)
            self.missingElmInVoltEq -= set(cptNames)

        return  state, eq

    def checkJunctionRule(self, cptNames: list[str]) -> tuple[int, tuple[str, str, str]]:
        implicitCommonNode = khf.isImplicitCurrentEquation(self.circuit, cptNames)
        commonNode = khf.isCurrentEquation(self.circuit, cptNames)
        if implicitCommonNode:
            eq = khf.makeCurrentEquation(self.circuit, cptNames, implicitCommonNode, self.language)
            state = self.setEquation(eq, cptNames)
            return state, (eq, eq, eq)
        elif commonNode:
            eq = khf.makeCurrentEquation(self.circuit, cptNames, commonNode, self.language)
            state = self.setEquation(eq, cptNames)
            return state, (eq, eq, eq)
        else:
            return KirchhoffStates.notAValidEquation.value, ("", "", "")

    @staticmethod
    def makeDummy() -> 'KirchhoffSolver':
        circuit = '''V1 2 0 dc {10}; up
                                W 2 3; up
                                W 3 4; right
                                R1 4 5 {1000}; down
                                R2 5 6 {2000}; down
                                R3 6 7 {200}; down
                                R4 7 8 {400}; down
                                W 7 11; right
                                R5 11 12 {200}; down
                                W 12 8; left
                                W 8 9; left
                                W 9 10; up
                                W 10 0; up
                                '''
        f = open("tmp.txt", "w")
        f.write(circuit)
        f.close()
        dummy = KirchhoffSolver("tmp.txt", "", {"volt": "U", "total": "ges"})
        dummy._equations = {0: "0 = Uges - U1 - U2 - U3 - U4", 1: "0 = U3 - U4", 2: "0 = I3 - I4 - I5", 3: "0 = I1 - I2", 4: "0 = I2 - I3"}
        dummy.language = LangSymbols()
        dummy.fileName = "##DummyHasNoName##"
        dummy.path = "##DummyHasNoPath##"
        os.remove("tmp.txt")
        return dummy