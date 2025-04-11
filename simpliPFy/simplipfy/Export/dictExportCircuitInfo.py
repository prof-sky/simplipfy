from sympy import Mul, parse_expr, pi
from sympy.physics.units import Hz

from lcapyInskale import omega0
from simplipfy.Export.dictExport import DictExportBase, DictExportElement, ExportDict
from simplipfy.langSymbols import LangSymbols


class DictExportCircuitInfo(DictExportBase):
    def __init__(self, langSymbols: LangSymbols(), cirType="RLC", isSymbolic=False, precision=3):
        super().__init__(precision, langSymbols, cirType, isSymbolic)
        self.omega_0 = 0
        self.cirType = cirType

    def getDictForStep(self, step, solution: 'lcapyInskale.Solution') -> ExportDict:
        sources = solution[step].circuit.sources
        if not len(sources) == 1:
            raise AssertionError(f"Number of sources has to be one, sources: {sources}")

        source = solution[step].circuit[sources[0]]

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

        source = DictExportElement(
            step, solution[step].circuit, cirOmega_0, source.name, self.ls, self.isHomCir,
            prefAndUnit=(not self.isSymbolic)
        ).toSourceDict()

        allCpts: list[ExportDict] = []
        for name in solution[step].circuit.reactances:
            vcElm = DictExportElement(step, solution[step].circuit, self.omega_0, name, self.ls, self.isHomCir,
                                      prefAndUnit=(not self.isSymbolic))
            allCpts.append(vcElm.toCptDict())

        return self.step0ExportDict(step, source, allCpts, self.cirType, solution[step].getImageData(self.ls))
