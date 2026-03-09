from typing import TYPE_CHECKING

from lcapyInskale.componentRelation import ComponentRelation
from simplipfy.Export.DataStructures.exportDict import CptExportDict, EmptyExportDict, ExportDict
from simplipfy.Export.DataStructures.exportElement import ExportElement
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.impedanceConverter import getOmegaFromCircuit
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.SimplifyInUserOrder.simplifierStates import SimplifierStates

if TYPE_CHECKING:
    from simplipfy.Helpers.solution import Solution
    from lcapyInskale import Circuit

    from lcapyInskale.solutionStep import SolutionStep


class SimpStepElements:
    """
    Data class that provides a clear structure for the simplified elements and the result
    """
    def __init__(self, elems: list[ExportElement], resElm: ExportElement=None):
        """
        :param elems: list of ExportElement objects that result in the new simplified element
        :param resElm: ExportElement object that is the result of the simplification, if this is None the last elm
         of elems is used as the result element
        """
        if not resElm:
            self.resElem: ExportElement = elems[-1]
            self.elems: list[ExportElement] = elems[:-1]
        else:
            self.resElem: ExportElement = resElm
            self.elems: list[ExportElement] = elems

    def __bool__(self):
        return bool(self.elems) and bool(self.resElem)

    def makeCptExportDictLists(self) -> tuple[list[CptExportDict], list[CptExportDict]]:
        """
        :return: tuple of two lists, the first list contains the CptExportDicts of the simplified elements,
         the second list contains the CptExportDicts of all elements. The first list ist a subset of the second list.
        """
        cpts: list[CptExportDict] = []
        for elm in self.elems:
            cpts.append(elm.toCptDict())

        allCpts: list[CptExportDict] = []
        for elm in self.elems + [self.resElem]:
            allCpts.append(elm.toCptDict())

        return cpts, allCpts


class DictExportSimpStep(DictExportBase):
    """
    Export for steps 1 - n of <simplipfy.Solution> is handled in this class.
    Export for step 0 is handled in <simplipfy.Export.dictExportCircuitInfo>.
    """

    def __init__(self, langSymbol: LangSymbols(), isSymbolic=False, precision=3):
        """
        :param langSymbol: define some language-specific symbols used in text, equations and labels (e.g., voltage
         across R1 in German U1 in English V1)
        :param isSymbolic: bool, True if the circuit is calculated with symbolic values instead of numeric values
        """
        super().__init__(precision, langSymbol, isSymbolic)
        # this class automatically prefixes every field that includes val or Val in the name and transforms it to
        # a latex string before exporting the dictionary
        self.circuit: Circuit = None
        self.simpCircuit: Circuit = None
        self.omega_0 = 0
        self.imageData = None
        self.gImageData = None

        self.simpElements: SimpStepElements = None
        self.allVcElements: list[ExportElement] = []
        self.relation: ComponentRelation = ComponentRelation.none

    def _updateObjectValues(self, step: str, solution: 'Solution'):
        self.solStep: SolutionStep = solution[step]
        self.simpCircuit: Circuit  = solution[step].circuit  # circuit with less elements (n elements)
        self.omega_0 = getOmegaFromCircuit(self.simpCircuit)
        self.imageData = solution[step].getImageData(langSymbols=self.ls)
        self.gImageData = solution[step].generalizedImageData(langSymbols=self.ls)

        if not self._isInitialStep():
            self.circuit: Circuit = solution[step].lastStep.circuit  # circuit with more elements (n+m elements)
            ms = len(self.circuit.sources) > 1

            elms: list[ExportElement] = []
            for name in solution[step].cpts:
                elms.append(ExportElement(self.circuit, self.omega_0, name, self.ls, ms,
                                                       prefAndUnit=(not self.isSymbolic)))

            res: ExportElement = ExportElement(self.simpCircuit, self.omega_0, solution[step].newCptName, self.ls, ms,
                                  prefAndUnit=(not self.isSymbolic))
            self._updateCompRel()
            self.simpElements = SimpStepElements(elms, res)

            for name in solution[step].circuit.reactances:
                self.allVcElements.append(ExportElement(solution[step].circuit, self.omega_0, name,
                                                            self.ls, ms, prefAndUnit=(not self.isSymbolic)))

            #ToDo finish implemenation of for replacement of Uges, Iges, Rges in symbolic calc
            if self.isSymbolic and len(self.allVcElements) == 1:
                # try to substitute Iges, Uges and Rges in symbolic calculations
                self.substituteSymbols(solution)

        else:
            self.simpElements = None
            self.allVcElements = []

    def _updateCompRel(self):
        if self.solStep.relation == ComponentRelation.parallel:
            self.relation = ComponentRelation.parallel
        elif self.solStep.relation == ComponentRelation.series:
            self.relation = ComponentRelation.series
        else:
            self.relation = ComponentRelation.none

    def _isInitialStep(self) -> bool:
        return not (self.solStep.cpts and self.solStep.newCptName and self.solStep.lastStep) and self.solStep

    def substituteSymbols(self, solution: 'Solution'):
        from lcapyInskale import LaplaceDomainImpedance
        from lcapyInskale import t
        from sympy import Symbol
        a = Symbol("bla")
        b = LaplaceDomainImpedance(45)
        lastStep = solution[solution.available_steps[-1]]
        lastCptName = lastStep.newCptName
        Rges = lastStep.circuit[lastCptName].Z
        Iges = lastStep.circuit[lastCptName].I(t)
        Uges = lastStep.circuit[lastCptName].V(t)
        pass

    def getDictForStep(self, step: str, solution: 'Solution', ) -> ExportDict:
        """
        :param step: step to export
        :param solution: solution object to get the data from
        :returns: an Step0ExportDict or an ExportDict object with the data of the step
        """
        self._updateObjectValues(step, solution)

        if self.simpElements:

            cpts, allCpts = self.simpElements.makeCptExportDictLists()
            stepData = ExportDict(
                step, True,
                self.simpElements.resElem.toCptDict(),
                self.relation, SimplifierStates.fromCptRelation(self.relation), self.imageData, self.gImageData,
                cpts, allCpts
            )

            return stepData

        else:
            return EmptyExportDict(SimplifierStates.undefined)
