import os

from sympy.utilities.iterables import iterable

from lcapyInskale import Circuit
from lcapyInskale.componentRelation import ComponentRelation
from lcapyInskale.solutionStep import SolutionStep
from simplipfy.Export.DataStructures.exportDict import EmptyExportDict, ExportDict, ExportDictBase, Step0ExportDict
from simplipfy.Helpers.impedanceConverter import FileToImpedance
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.solution import Solution
from simplipfy.SimplifyInUserOrder.simplifierStates import SimplifierStates
from typing import Literal, Iterable
from warnings import warn
from simplipfy.Svg.drawingConfig import drawing_config_instance as dci


class SolveInUserOrder:
    def __init__(self, filename: str, filePath="", langSymbols: dict = {}):
        """
        :param filename: str with filename of circuit to simplify, with extension
        :param filePath: str with path to circuit file if not in current directory
        """

        self.filename = os.path.splitext(filename)[0]
        self.filePath = filePath
        self.langSymbols = LangSymbols(langSymbols)
        self.netlist, self.componentMap  = FileToImpedance(os.path.join(filePath, filename))
        self.circuit = Circuit(self.netlist)
        self.isGeneralized = dci.generalize
        self.steps: list[SolutionStep] = [
            SolutionStep(self.circuit, [], None, ComponentRelation.none, None, None)
        ]
        self.circuit.namer.reset()

        return

    @property
    def Solution(self) -> Solution:
        return Solution(self.steps, self.langSymbols, self.isGeneralized)

    def netlist(self, step: str) -> str:
        return Solution(self.steps, self.langSymbols, self.isGeneralized)[step].circuit.netlist()

    def getStep(self, step: str) -> ExportDictBase:
        sol = Solution(self.steps, self.langSymbols, self.isGeneralized)
        if step not in sol.available_steps:
            warn(f"{step} is not in the solution")
            return EmptyExportDict(SimplifierStates.undefined)
        return sol.exportStepAsDict(step)

    def isSimplified(self) -> bool:
        """
        Returns True if the last step in self.steps states that no more series or parallel simplifications are possible
        Use self.getStep("<step>").isSimplified, for information from a specific step
        """
        return self.steps[-1].isSimplified

    def simplifyNCpts(self, cpts: list, rel: ComponentRelation | Literal["auto"] = "auto") -> ExportDict:
        """
        :param:  cpts list with n component names to simplify e.g., ["R1", "R2", "R3" ...]
        :param:  rel relation in which the n components are supposed to be simplified, allowed strings defined in ComponentRelation
                 or auto for automatic where a simplification is done if it is possible.

        :returns: ExportDict with the circuit information for the step
        """
        if isinstance(rel, ComponentRelation):
            rel = rel.value

        auto = True if rel == "auto" else False

        # ToDo this only works as long as only simplifiable components are selected which are represented as a
        # impedance internally in the cirucuit
        for idx in range(0, len(cpts)):

            if cpts[idx] in self.componentMap:
                cpts[idx] = self.componentMap[cpts[idx]]

        if all(cpt in self.circuit.in_series(cpts[0]) for cpt in cpts[1::]):
            if rel != ComponentRelation.series.value and not auto:
                return EmptyExportDict(SimplifierStates.notParallel)

            newNet, newCptName = self.circuit.simplify_N_cpts(self.circuit, cpts)
            self.steps.append(SolutionStep(newNet, cpts=cpts, newCptName=newCptName,
                                           relation=ComponentRelation.series,
                                           lastStep=None, nextStep=None))

        elif all(cpt in self.circuit.in_parallel(cpts[0]) for cpt in cpts[1::]):
            if rel != ComponentRelation.parallel.value and not auto:
                return EmptyExportDict(SimplifierStates.notSeries)

            newNet, newCptName = self.circuit.simplify_N_cpts(self.circuit, cpts)
            self.steps.append(SolutionStep(newNet, cpts=cpts, newCptName=newCptName,
                                           relation=ComponentRelation.parallel,
                                           lastStep=None, nextStep=None))

        else:
            return EmptyExportDict(SimplifierStates.notInRelation)

        sol = Solution(self.steps, self.langSymbols, self.isGeneralized)
        newestStep = sol.available_steps[-1]
        self.circuit = newNet
        export_dict = sol.exportStepAsDict(newestStep)
        return export_dict


    def createInitialStep(self) -> Step0ExportDict:
        """
        create the initial step / step0 of the circuit
        :returns: Step0ExportDict with the circuit information of step0
        """

        sol = Solution(self.steps, self.langSymbols, self.isGeneralized)
        stepData = sol.exportStepAsDict("step0")

        return stepData

    def createStep0(self) -> Step0ExportDict:
        """
        create the initial step / step0 of the circuit
        :returns: Step0ExportDict with the circuit information of step0
        """
        return self.createInitialStep()

    def getSolution(self) -> Solution:
        """Get a copy of the solution object that is used in this class"""
        return Solution(self.steps, self.langSymbols, self.isGeneralized)