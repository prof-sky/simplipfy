import os
from json import dump as jdump

from lcapyInskale import Circuit
from lcapyInskale.componentRelation import ComponentRelation
from lcapyInskale.solutionStep import SolutionStep
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Export.dictExportBase import ExportDict
from simplipfy.impedanceConverter import FileToImpedance
from simplipfy.langSymbols import LangSymbols
from simplipfy.solution import Solution


class SolveInUserOrder:
    def __init__(self, filename: str, filePath="", savePath="", langSymbols: dict = {}):
        """
        :param filename: str with filename of circuit to simplify
        :param filePath: str with path to circuit file if not in current directory
        :param savePath: str with path to save the result svg and jason files to
        """

        self.filename = os.path.splitext(filename)[0]
        self.filePath = filePath
        self.savePath = savePath
        self.langSymbols = LangSymbols(langSymbols)
        self.circuit = Circuit(FileToImpedance(os.path.join(filePath, filename)))
        self.steps: list[SolutionStep] = [
            SolutionStep(self.circuit, [], None, None, None, None)
        ]
        self.circuit.namer.reset()

        return

    def dictToFiles(self, stepData: dict) -> tuple[bool, str, str]:
        step = stepData["step"]
        jsonFilePath = os.path.join(self.savePath, self.filename) + "_" + step + ".json"
        with open(jsonFilePath, "w", encoding="utf-8") as f:
            jdump(stepData, f, ensure_ascii=False, indent=4)

        svgFilePath = os.path.join(self.savePath, self.filename) + "_" + step + ".svg"
        svgFile = open(svgFilePath, "w", encoding="utf8")
        svgFile.write(stepData["svgData"])
        svgFile.close()

        return True, jsonFilePath, svgFilePath

    def simplifyNCpts(self, cpts: list) -> ExportDict:
        """
        :param cpts: list with two component name strings to simplify ["R1", "R2"]
        :return tuple with bool if simplification is possible, str with json filename, str with svg filename
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
            return DictExportBase.emptyExportDict()

        sol = Solution(self.steps, langSymbols=self.langSymbols)
        newestStep = sol.available_steps[-1]
        self.circuit = newNet

        return sol.exportStepAsDict(newestStep)

    def createInitialStep(self) -> ExportDict:
        """
        create the initial step or step0 of the circuit
        :return tuple with bool if simplification is possible, str with json filename, str with svg filename
        """

        sol = Solution(self.steps, langSymbols=self.langSymbols)
        stepData = sol.exportStepAsDict("step0")

        return stepData

    def createCircuitInfo(self) -> str:
        raise NotImplementedError("Use createStep0() or createInitialStep()")

    def createStep0(self) -> ExportDict:
        return self.createInitialStep()

    def getSolution(self):
        return Solution(self.steps, self.langSymbols)