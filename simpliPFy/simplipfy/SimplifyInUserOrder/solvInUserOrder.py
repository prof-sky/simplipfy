import os

from lcapyInskale import Circuit
from lcapyInskale.componentRelation import ComponentRelation
from lcapyInskale.solutionStep import SolutionStep
from simplipfy.Export.DataStructures.exportDict import EmptyExportDict, ExportDict, ExportDictBase, Step0ExportDict
from simplipfy.Helpers.impedanceConverter import FileToImpedance
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.solution import Solution


class SolveInUserOrder:
    def __init__(self, filename: str, filePath="", langSymbols: dict = {}):
        """
        :param filename: str with filename of circuit to simplify, with extension
        :param filePath: str with path to circuit file if not in current directory
        """

        self.filename = os.path.splitext(filename)[0]
        self.filePath = filePath
        self.langSymbols = LangSymbols(langSymbols)
        self.circuit = Circuit(FileToImpedance(os.path.join(filePath, filename)))
        self.steps: list[SolutionStep] = [
            SolutionStep(self.circuit, [], None, None, None, None)
        ]
        self.circuit.namer.reset()

        return

    @property
    def Solution(self) -> Solution:
        return Solution(self.steps, langSymbols=self.langSymbols)

    def simplifyNCpts(self, cpts: list) -> ExportDict:
        """
        :param cpts: list with n component names to simplify e.g., ["R1", "R2", "R3" ...]
        :returns: ExportDict with the circuit information for the step
        """
        # ToDo this only works as long as only simplifiable components are selected which are represented as a
        # impedance internally in the cirucuit
        for idx in range(0, len(cpts)):
            cpts[idx] = "Z" + cpts[idx][1::]

        if all(cpt in self.circuit.in_series(cpts[0]) for cpt in cpts[1::]):
            newNet, newCptName = self.circuit.simplify_N_cpts(self.circuit, cpts)
            self.steps.append(SolutionStep(newNet, cpts=cpts, newCptName=newCptName,
                                           relation=ComponentRelation.series.value,
                                           lastStep=None, nextStep=None))
        elif all(cpt in self.circuit.in_parallel(cpts[0]) for cpt in cpts[1::]):
            newNet, newCptName = self.circuit.simplify_N_cpts(self.circuit, cpts)
            self.steps.append(SolutionStep(newNet, cpts=cpts, newCptName=newCptName,
                                           relation=ComponentRelation.parallel.value,
                                           lastStep=None, nextStep=None))
        else:
            return EmptyExportDict()

        sol = Solution(self.steps, langSymbols=self.langSymbols)
        newestStep = sol.available_steps[-1]
        self.circuit = newNet

        return sol.exportStepAsDict(newestStep)

    def createInitialStep(self) -> Step0ExportDict:
        """
        create the initial step / step0 of the circuit
        :returns: Step0ExportDict with the circuit information of step0
        """

        sol = Solution(self.steps, langSymbols=self.langSymbols)
        stepData = sol.exportStepAsDict("step0")

        return stepData

    def createStep0(self) -> ExportDictBase:
        """
        create the initial step / step0 of the circuit
        :returns: Step0ExportDict with the circuit information of step0
        """
        return self.createInitialStep()

    def getSolution(self) -> Solution:
        """Get a copy of the solution object that is used in this class"""
        return Solution(self.steps, self.langSymbols)