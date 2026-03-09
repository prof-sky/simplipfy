from typing import TYPE_CHECKING

from sympy import Mul, parse_expr, pi
from sympy.physics.units import Hz

from lcapyInskale import omega0
from simplipfy.Export.DataStructures.exportDict import Step0ExportDict
from simplipfy.Export.dictExportSimpStep import DictExportBase, ExportElement
from simplipfy.Helpers.langSymbols import LangSymbols

if TYPE_CHECKING:
    from simplipfy.Helpers.solution import Solution
    from simplipfy.Export.DataStructures.exportDict import Step0ExportDictSource

class DictExportCircuitInfo(DictExportBase):
    """
    Export for step 0 of <simplipfy.Solution>
    Steps 1 - n are handled in <simplipfy.Export.dictExport>
    """
    def __init__(self, langSymbols: LangSymbols(), cirType="RLC", isSymbolic=False, precision=3):
        """
        :param langSymbols: define some language-specific symbols used in text, equations and labels (e.g., voltage
         across R1 in German U1 in English V1)
        :param cirType: string with the type of circuit (e.g., R, L, C, RLC, RC, etc.) is used to determine how calculations
         are displayed in the frontend. RLC is calculated using complex numbers and is displayed as such.
        :param isSymbolic: bool, True if the circuit is calculated with symbolic values instead of numeric values
        :param precision: int with the number of decimal places to round to
        """
        super().__init__(precision, langSymbols, isSymbolic)
        self.omega_0 = 0
        self.cirType = cirType

    def getDictForStep(self, step, solution: 'Solution') -> Step0ExportDict:
        """
        :returns: Step0ExportDict with the circuit information for step 0
        """
        sources = [solution[step].circuit[src] for src in solution[step].circuit.sources]
        ms = len(solution[step].circuit.sources) > 1

        sourcesDictList: list['Step0ExportDictSource'] = []
        for source in sources:
            if source.has_ac:
                if source.args[2] is not None:
                    cirOmega_0 = parse_expr(str(source.args[2]), local_dict={"pi": pi}) * Hz
                    try:
                        self.omega_0 = float(source.args[2])
                    except ValueError:
                        self.omega_0 = str(source.args[2])
                else:
                    cirOmega_0 = omega0
                    self.omega_0 = "omega_0"
            elif source.has_dc:
                cirOmega_0 = Mul(0) * Hz
            else:
                raise AssertionError("Voltage Source is not ac or dc")

            source = ExportElement(
                solution[step].circuit, cirOmega_0, source.name, self.ls, ms,
                prefAndUnit=(not self.isSymbolic)
            ).toSourceDict()
            sourcesDictList.append(source)

        allCpts: list[ExportElement] = []
        for name in solution[step].circuit.reactances:
            vcElm = ExportElement(solution[step].circuit, self.omega_0, name, self.ls, ms,
                                      prefAndUnit=(not self.isSymbolic))
            allCpts.append(vcElm.toCptDict())

        return Step0ExportDict(step, sourcesDictList, allCpts, self.cirType, solution[step].getImageData(self.ls),
        solution[step].generalizedImageData(self.ls), solution.isGeneralized)
