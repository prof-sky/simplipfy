from typing import TYPE_CHECKING, Union

import sympy
from sympy.physics.units import deg

from lcapyInskale import current, resistance, voltage
from simplipfy.Export.DataStructures.exportDict import CptExportDict, Step0ExportDictSource
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.impedanceConverter import ValueToComponent
from simplipfy.Helpers.unitWorkAround import UnitWorkAround as uwa

if TYPE_CHECKING:
    from lcapyInskale.circuit import Circuit
    from simplipfy.Helpers.langSymbols import LangSymbols


class ExportElement(DictExportBase):
    """
    Collects the infromation needed in the frontend for a comoponent
    """
    def __init__(self, circuit: 'Circuit',
                 omega_0, compName: str, langSymbols: 'LangSymbols',
                 multipleSources: bool, prefAndUnit=True, precision=3):
        """
        :param circuit: lcapy.Circuit object with the component to collect component information from
        :param omega_0: angular frequency of the circuit
        :param compName: name of the component to collect information from
        :param langSymbols: define some language-specific symbols used in text, equations and labels
        :param multipleSources: bool, True if the circuit has multiple sources
        :param prefAndUnit: bool, True if the circuit is calculated with numeric and latex strings get unit and prefix
        """
        super().__init__(precision=precision, langSymbol=langSymbols, isSymbolic=(not prefAndUnit))
        self.circuit = circuit
        self.omega_0 = omega_0
        self.multipleSources: bool = multipleSources

        self._returnFkt = self.prefixer.getSIPrefixedExpr if prefAndUnit else self._returnExpr
        self.prefAndUnit = prefAndUnit

        self.toCptDict = self._toCptDictNoUnitNoPrefix if self.isSymbolic else self._toCptDict

        self.suffix = self.circuit[compName].id

        self._cpxValue, self._value, self.compType = self._convertValue(self.circuit[compName].Z)
        self.uName = self.ls.volt + self.suffix
        self.iName = 'I' + self.suffix

        if compName[0] in ["I", "V"]:
            self.compType = compName[0]
            if not self.multipleSources:
                self.uName = self.ls.volt + self.ls.total
                self.iName = 'I' + self.ls.total


        key = list(self.circuit[compName].V(omega_0).keys())[0]

        iCpx = self.circuit[compName].I(omega_0)[key]
        imI = sympy.im(iCpx.expr)
        reI = sympy.re(iCpx.expr)
        self._i = current(sympy.sqrt(imI ** 2 + reI ** 2))
        self.iPhase = sympy.atan2(imI, reI) * 180 / sympy.pi * deg

        uCpx = self.circuit[compName].V(omega_0)[key]
        imU = sympy.im(uCpx.expr)
        reU = sympy.re(uCpx.expr)
        self._u = voltage(sympy.sqrt( imU ** 2 + reU ** 2))
        self.uPhase = sympy.atan2(imU, reU) * 180 / sympy.pi * deg

        self.name = self.compType + self.suffix
        self.imZ = sympy.im(self._cpxValue.expr)
        self.reZ = sympy.re(self._cpxValue.expr)
        self.zPhase = sympy.atan2(imU, reU) * 180 / sympy.pi * deg
        self.zPhase = sympy.atan2(self.imZ, self.reZ) * 180 / sympy.pi * deg
        self._magnitude = resistance(sympy.sqrt( self.imZ ** 2 + self.reZ ** 2))

    @staticmethod
    def _removeSinCos(value: 'lcapyInskale.expr'):
        """
        legacy function could be removed in the future
        """
        for arg in value.sympy.args:
            if isinstance(arg, (sympy.sin, sympy.cos)):
                value = value / arg
        return value

    def _toCptDictNoUnitNoPrefix(self) -> CptExportDict:
        """
        :returns: CptExportDict, a dictionary with the values of the elements see exportDict.py
        For symbolic calculation there shall be no unit or prefix in the value strings.
        Assigned at runtime in __init__ to self.toCptDict.
        """
        return CptExportDict(
            self.name,
            self.uName,
            self.iName,
            self.toLatex(self._magnitude),
            self.toLatex(self._cpxValue),
            self.toLatex(self.reZ),
            self.toLatex(self.imZ),
            self.toLatex(self.zPhase),
            self.toLatex(self._value),
            self.toLatex(self._u),
            self.toLatex(self.uPhase),
            self.toLatex(self._i),
            self.toLatex(self.iPhase),
            self.hasConversion
        )

    def _toCptDict(self) -> CptExportDict:
        """
        :returns: CptExportDict, a dictionary with the values of the elements see exportDict.py
        For numeric calculation there shall be a unit and prefix in the value strings.
        Assigned at runtime in __init__ to self.toCptDict
        """
        return CptExportDict(
            self.name,
            self.uName,
            self.iName,
            self.latexWithPrefix(self._magnitude),
            self.latexWithPrefix(self._cpxValue),
            self.latexWithPrefix(self.reZ.round(self.precision)),
            self.latexWithPrefix(self.imZ.round(self.precision)),
            self.latexWithPrefix(self.zPhase),
            self.latexWithPrefix(self._value),
            self.latexWithPrefix(self._u),
            self.latexWithPrefix(self.uPhase),
            self.latexWithPrefix(self._i),
            self.latexWithPrefix(self.iPhase),
            self.hasConversion
        )

    def toCptDict(self) -> CptExportDict:
        """
        Handles unit and prefix depending on the self.isSymbolic flag.
        Function is assigned at runtime in __init__ to self.toCptDict.
        if self.isSymbolic is True, no unit and prefix are added to latex strings,
        if self.isSymbolic is False, unit and prefix are added to latex strings
        :returns: CptExportDict, a dictionary with the values of one element see exportDict.py
        """
        pass

    @staticmethod
    def _returnExpr(value) -> Union[sympy.Mul, str]:
        return value

    def toSourceDict(self):
        return Step0ExportDictSource(self.compType,
                                     self.latexWithPrefix(self.omega_0),
                                     self.latexWithPrefix(self.omega_0/(2*sympy.pi)),
                                     self.toCptDict())

    def _convertValue(self, cpxVal) -> tuple:
        convValue, convCompType = ValueToComponent(cpxVal, self.omega_0)
        return cpxVal, uwa.addUnit(convValue, convCompType), convCompType

    @property
    def value(self):
        return self._returnFkt(self._value)

    @property
    def cpxVal(self):
        return self._returnFkt(self._cpxValue)

    @property
    def i(self):
        return self._returnFkt(self._i)

    @property
    def u(self):
        return self._returnFkt(self._u)

    @property
    def hasConversion(self) -> bool:
        return not self.compType == "Z"

    @property
    def magnitude(self):
        return self._returnFkt(self._magnitude)
