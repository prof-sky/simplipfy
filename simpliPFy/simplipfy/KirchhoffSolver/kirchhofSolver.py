import os
from typing import Union

import networkx as nx

import simplipfy.KirchhoffSolver.solver as khf
from lcapyInskale import Circuit
from simplipfy.langSymbols import LangSymbols
from .direction import Direction
from .kirchhoffStates import KirchhoffStates


class KirchhoffSolver:
    def __init__(self, circuitFileName: str, path: str, langSymbols: dict = {}):
        # two sets are needed so that the same set can occur for voltage and current equations
        self.elementSetsOfVoltEqs: list[set] = []
        self.elementSetsOfCurrEqs: list[set] = []
        self.language = LangSymbols(langSymbols)
        self.fileName = circuitFileName
        self.path = path
        self.circuit = Circuit(os.path.join(path, circuitFileName))
        elementNames = self.circuit.branch_list
        self.numUnknownElements = len([elm for elm in elementNames if elm[0] != "V"]) # voltages of sources are known
        self._voltEquations: list[str] = []
        self._currEquations: list[str] = []
        self.eqNodeMap = khf.makeNodeMap(self.circuit)
        self.loops, self.numVoltEq = khf.loopsOfCircuit(self.circuit, self.eqNodeMap)

    @property
    def foundEq(self):
        return len(self._voltEquations) + len(self._currEquations)

    def foundAllEquations(self) -> bool:
        #assert(self.foundEq <= self.numUnknownElements)
        #assert(self.numUnknownElements > 0)
        #assert(self.numUnknownElements <= (len(self._voltEquations) + len(self._currEquations)))

        return self.numUnknownElements == self.foundEq

    def foundAllVoltEquations(self) -> bool:
        return len(self._voltEquations) == self.numVoltEq

    def equations(self):
        eqs = self._voltEquations.copy()
        eqs.extend(self._currEquations)
        while len(eqs) < self.numUnknownElements:
            eqs.append("-")

        return eqs

    @staticmethod
    def setEquation(value, cptNames, eqList, foundSets) -> int:
        nameSet = set(cptNames)
        if nameSet in foundSets:
            return KirchhoffStates.duplicateEquation.value
        eqList.append(value)
        foundSets.append(nameSet)
        return KirchhoffStates.isNewEquation.value

    def setVoltEq(self, eq: str, cptNames: list[str]) -> int:
        return self.setEquation(eq, cptNames, self._voltEquations, self.elementSetsOfVoltEqs)

    def setCurrEq(self, eq: str, cptNames: list[str]) -> int:
        return self.setEquation(eq, cptNames, self._currEquations, self.elementSetsOfCurrEqs)

    def checkVoltageLoopRule(self, cptNames: list[str], direction: Union[int,None] = None) -> tuple[int, str]:
        #ToDo remove direction argument
        if direction:
            print("\033[91mdirection argument is deprecated and will be removed in the future\033[0m", "at KirchhoffSolver.checkVoltageLoopRule")

        loop = khf.isValidVoltageLoop(self.circuit, cptNames, self.loops, self.eqNodeMap)
        if loop:
            eq = khf.makeVoltageEquations(self.circuit, cptNames, self.language, self.eqNodeMap)
            if eq == "":
                return KirchhoffStates.notAValidLoopOrder.value, eq

            if self.foundAllVoltEquations():
                return KirchhoffStates.duplicateEquation.value, eq

            return self.setVoltEq(eq, cptNames), eq

        return  KirchhoffStates.notAValidEquation.value, ""

    def checkJunctionRule(self, cptNames: list[str], direction: int = 1) -> tuple[int, tuple[str, str, str]]:
        direction = Direction(direction)
        implicitCommonNode = khf.isImplicitCurrentEquation(self.circuit, cptNames)
        commonNode = khf.isCurrentEquation(self.circuit, cptNames, self.eqNodeMap)
        if implicitCommonNode:
            eq = khf.makeCurrentEquation(self.circuit, cptNames, implicitCommonNode,direction, self.language)
            state = self.setCurrEq(eq[0], cptNames)
            return state, eq
        elif all(cptName in self.circuit.in_series(cptNames[0]) for cptName in cptNames[1:]):
            eq = "", "", ""
            state = KirchhoffStates.toManyJunctions.value
            return state, eq
        elif commonNode and len(cptNames) > 2:
            eq = khf.makeCurrentEquation(self.circuit, cptNames, commonNode,direction, self.language)
            state = self.setCurrEq(eq[0], cptNames)
            return state, eq
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