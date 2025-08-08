import os

import simplipfy.KirchhoffSolver.solver as khf
from lcapyInskale import Circuit
from simplipfy.Helpers.langSymbols import LangSymbols
from .direction import Direction
from .kirchhoffStates import KirchhoffStates
from sympy import Matrix
from .solver import basicLoopsOfCircuit, makeCurrentEquation


class KirchhoffSolver:
    def __init__(self, circuitFileName: str, path: str, langSymbols: dict = {}):
        """
        :param circuitFileName: The name of the circuit file with extension
        :param path: The path to the circuit file
        :param langSymbols: dict, is used to initialize a LangSymbols object
        """
        # two sets are needed so that the same set can occur for voltage and current equations
        self.elementSetsOfVoltEqs: list[set] = []
        self.elementSetsOfCurrEqs: list[set] = []
        self.language = LangSymbols(langSymbols)
        self.fileName = circuitFileName
        self.path = path
        self.circuit = Circuit(os.path.join(path, circuitFileName))
        self.ms = True if len(self.circuit.sources) > 1 else False
        elementNames = self.circuit.branch_list
        self.numUnknownElements = len([elm for elm in elementNames if elm[0] != "V"]) # voltages of sources are known
        self.voltMatrix: list[list] = []
        self.currMatrix: list[list] = []
        self._voltEquations: list[str] = []
        self._currEquations: list[str] = []
        self.eqNodeMap = khf.makeNodeMap(self.circuit)
        self.loops, self.numVoltEq = khf.loopsOfCircuit(self.circuit, self.eqNodeMap)

    @property
    def foundEq(self) -> int:
        """
        :returns: The number of equations found
        """
        return len(self._voltEquations) + len(self._currEquations)

    def foundAllEquations(self) -> bool:
        """
        :returns: True if all equations are found, else False
        :raise AssertionError: if more equations are found than possible
        """
        assert len(self.equations()) <= self.numUnknownElements, "More equations found that shall be possible"
        return self.numUnknownElements == len(self.equations())

    def foundAllCurrEquations(self) -> bool:
        """
        :returns: True if all current equations are found, else False

        To validate that all equations where found use self.foundAllEquations()
        The design of this object assumes that first the voltage equations are found and then the current equations.
        Therefore, this function is equivalent to self.foundAllEquations()
        """
        return self.foundAllEquations()

    def foundAllVoltEquations(self) -> bool:
        """
        :returns: True if all voltage equations are found, else False

        To validate that all equations where found use self.foundAllEquations()
        """
        return len(self._voltEquations) == self.numVoltEq

    def equations(self):
        """
        :returns: The equations found in the circuit
        """
        eqs = self._voltEquations.copy()
        eqs.extend(self._currEquations)

        return eqs

    @staticmethod
    def setEquation(value, cptNames, eqList, foundSets, eqMatrix) -> KirchhoffStates:
        """
        value: tuple (equation, eqVector)
        :returns: KirchhoffStates

        Try to set/ save the equation.
        If new independent equation save coordinate vector in EqMatrix
        """
        nameSet = set(cptNames)
        extendedEqMatrix = eqMatrix + [value[1]]
        if nameSet in foundSets:
            return KirchhoffStates.duplicateEquation
        elif Matrix(extendedEqMatrix).rank() != len(extendedEqMatrix):
            return KirchhoffStates.dependentEquation
        eqMatrix.append(value[1])
        eqList.append(value[0])
        foundSets.append(nameSet)
        return KirchhoffStates.isNewEquation

    def setVoltEq(self, eq: tuple[str,list], cptNames: list[str]) -> KirchhoffStates:
        """
        :returns: KirchhoffStates

        Try to set/ save the current equation and coordinate Matrix
        """
        return self.setEquation(eq, cptNames, self._voltEquations, self.elementSetsOfVoltEqs, self.voltMatrix)

    def setCurrEq(self, eq: str, cptNames: list[str]) -> KirchhoffStates:
        """
        :returns: KirchhoffStates

        Try to set/ save the current equation and coordinate Matrix
        """
        return self.setEquation(eq, cptNames, self._currEquations, self.elementSetsOfCurrEqs, self.currMatrix)

    def checkVoltageLoopRule(self, cptNames: list[str]) -> tuple[int, str]:
        """
        :param cptNames: The component names to check
        :returns: KirchhoffStates.value, eq


        Check if the given component names are in a valid voltage loop and could potentially make a voltage equation.
        """

        loop = khf.isValidVoltageLoop(self.circuit, cptNames, self.loops, self.eqNodeMap)
        if loop:
            eq,vect = khf.makeVoltageEquations(self.circuit, cptNames, self.language, self.eqNodeMap, self.ms)
            if eq == "":
                return KirchhoffStates.notAValidLoopOrder.value, eq

            if self.foundAllVoltEquations():
                return KirchhoffStates.duplicateEquation.value, eq

            return self.setVoltEq((eq,vect), cptNames).value, eq

        return  KirchhoffStates.notAValidEquation.value, ""

    def checkJunctionRule(self, cptNames: list[str], direction: int = 1) -> tuple[int, tuple[str, str, str]]:
        """
        :param cptNames: The component names to check
        :param direction: Can be used to invert the signs of the equation

        Check if the given component names are at a junction and could potentially make a current equation.
        """
        direction = Direction(direction)
        implicitCommonNode = khf.isImplicitCurrentEquation(self.circuit, cptNames)
        commonNode = khf.isCurrentEquation(self.circuit, cptNames, self.eqNodeMap)
        if implicitCommonNode:
            eq = khf.makeCurrentEquation(self.circuit, cptNames, implicitCommonNode,direction, self.language, self.ms)
            state = self.setCurrEq(eq[0], cptNames)
            return state.value, eq[1]
        elif all(cptName in self.circuit.in_series(cptNames[0]) for cptName in cptNames[1:]):
            eq = "", "", ""
            state = KirchhoffStates.toManyJunctions
            return state.value, eq
        elif commonNode and len(cptNames) > 2:
            eq = khf.makeCurrentEquation(self.circuit, cptNames, commonNode,direction, self.language, self.ms)
            state = self.setCurrEq(eq[0], cptNames)
            return state.value, eq[1]
        else:
            return KirchhoffStates.notAValidEquation.value, ("", "", "")

    def checkJunctionByEq(self, cptWithSigns: list[tuple[str,int]], direction: int = 1) -> (int,str):
        """
        cptWithSigns: The component names with signs [["R1",1], ["R2",1], ["R4",-1], ["R5",-1]]
        Check if the given components together with signs make a valid junction equation.
        """
        CurrentEq = khf.checkCurrentEq(self.circuit, cptWithSigns, self.eqNodeMap)
        cptNames =  [cpt[0] for cpt in cptWithSigns]
        eqStr = "0 ="
        signs = {cpt: val for cpt, val in cptWithSigns}
        eqVect = [signs.get(cpt, 0) for cpt in self.circuit.branch_list]
        for cpt in cptWithSigns:
            sign = " + " if cpt[1] == 1 else " - "
            current = f"{sign}I_" + "{" + f"{cpt[0][1:]}" + "}"
            eqStr += current
        eq = [eqStr, eqVect]
        if CurrentEq:
            state = self.setCurrEq(eq, cptNames)
            return state.value, eq[0]
        else:
            return KirchhoffStates.notAValidEquation.value, ""

    @staticmethod
    def makeDummy() -> 'KirchhoffSolver':
        """
        Creates a fake KirchhoffSolver object for testing purposes.
        """
        circuit = '''V1 2 0 dc {10}; down
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