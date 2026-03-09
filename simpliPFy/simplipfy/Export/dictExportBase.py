from typing import TYPE_CHECKING, Union

from sympy import Float, Mul, simplify
from sympy.printing import latex

from lcapyInskale import Expr
from simplipfy.Helpers.unitPrefixer import SIUnitPrefixer

if TYPE_CHECKING:
    from simplipfy.Helpers.langSymbols import LangSymbols
    from simplipfy.Helpers.solution import Solution


class DictExportBase:
    """
    Base class for the classes that create dictionaries with information about the circuit relevant to the frontend
    Handles conversation from lcapy objects to latex strings

    .. note::
        The difference between ExportDict and DictExport
        
        * ExportDict is a modified Dictionary to hold data
        * DictExport is the class that populates an ExportDict with data for the frontend
    """
    def __init__(self, precision: int, langSymbol: 'LangSymbols', isSymbolic=False):
        """
        :param precision: int with the number of decimal places to round to
        :param langSymbol: LangSymbols object with the symbols to use for the circuit
        :param isSymbolic: bool, True if the circuit is calculated with symbolic values instead of numeric values
        """
        self.precision = precision
        self.prefixer = SIUnitPrefixer()
        self.ls = langSymbol
        self.isSymbolic = isSymbolic
        self.error = False

    def _latexRealNumber(self, value: Union[Mul, Expr], prec=None, addPrefix: bool = True) -> str:
        if prec is None:
            prec = self.precision

        if addPrefix:
            toPrint = 1.0 * self.prefixer.getSIPrefixedMul(value)
        else:
            if isinstance(value, Expr):
                toPrint = 1.0 * value.expr_with_units
            else:
                toPrint = 1.0 * value

        # evaluate because expressions like 60*pi*Hz need to be evaluated to 188.49555921539 before rounding
        toPrint = toPrint.evalf()
        atomsList = list(toPrint.atoms(Float))
        for val in atomsList:
            toPrint = toPrint.evalf(subs={val: str(round(val, prec))})
        latexString = latex(toPrint, imaginary_unit="j")
        return latexString

    @staticmethod
    def _latexComplexNumber(value: Union['Mul', Expr]):

        test = latex(value.evalf(n=3, chop=True))
        return test

    def toLatex(self, toPrint):
        if self.isSymbolic:
            if isinstance(toPrint, Expr):
                toPrint = simplify(toPrint.expr)
            else:
                pass
        else:
            toPrint = 1.0 * toPrint.expr_with_units

        for val in list(toPrint.atoms(Float)):
            toPrint = toPrint.evalf(subs={val: str(round(val, self.precision))})
        latexString = latex(toPrint, imaginary_unit="j")
        return latexString

    def latexWithPrefix(self, value: Union['Mul', Expr], prec=None, addPrefix: bool = True) -> str:
        if value.is_Add:
            return self._latexComplexNumber(value)
        else:
            return self._latexRealNumber(value, prec, addPrefix)

    def latexWithoutPrefix(self, value: Expr, prec=None) -> str:
        if value.is_Add:
            return self._latexComplexNumber(value)
        else:
            return self._latexRealNumber(value, prec, addPrefix=False)

    def getDictForStep(self, step, solution: 'Solution'):
        raise NotImplementedError("Implement in Child class")
