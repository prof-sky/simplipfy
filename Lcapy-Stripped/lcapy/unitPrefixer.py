from sympy import Mul
from sympy.physics.units.prefixes import PREFIXES, Prefix
from typing import Union


class SIUnitPrefixer:
    def __init__(self):
        self.prefixes: dict[int, Prefix] =\
            {PREFIXES[prefixKey]._exponent: PREFIXES[prefixKey] for prefixKey in PREFIXES.keys()}

    @staticmethod
    def _findExponentFloatInt(value: Union[float, int]) -> int:
        if value == 0:
            return 0

        exponent = 0
        _value = abs(value)

        while _value >= 10:
            _value /= 10
            exponent += 1

        while _value < 1:
            _value *= 10
            exponent -= 1

        return exponent

    @staticmethod
    def _findExponentMul(value: Mul) -> int:
        """
        this function assumes all symbols to be 1 to determine the prefix based on the numerical value in the expression
        """
        sub_dict = {}

        for freeSymbol in value.free_symbols:
            sub_dict[freeSymbol] = 1

        _value = float(value.evalf(subs=sub_dict))

        return SIUnitPrefixer._findExponentFloatInt(_value)

    def _findSIPrefix(self, exponent) -> Prefix:
        return self.prefixes[min(self.prefixes.keys(), key=lambda x: abs(x-exponent))]

    def getSIPrefix(self, value: Union[float, int, Mul]) -> Prefix:
        if isinstance(value, Mul):
            return self._findSIPrefix(self._findExponentMul(value))
        else:
            return self._findSIPrefix(self._findExponentFloatInt(value))

    def getSIPrefixedValue(self, value: Union[float, int, Mul], minExponent=3):

        if isinstance(value, Mul) or isinstance(value, float):
            value = value
        elif isinstance(value, int):
            value = float(value)
        else:
            raise TypeError("value has to be type float, int or sympy.Mul")

        prefix = self.getSIPrefix(value)
        exp = prefix._exponent

        if abs(exp) >= minExponent:
            return 1.0 * value * 10**(-exp) * prefix
        else:
            return value


# prefixer = SIUnitPrefixer()
# print(latex(prefixer.getSIPrefixedValue(10)))
# print(latex(prefixer.getSIPrefixedValue(100)))
# print(latex(prefixer.getSIPrefixedValue(1000)))
# print(latex(prefixer.getSIPrefixedValue(100.0)))
# print(latex(prefixer.getSIPrefixedValue(1000.0)))
# print(latex(prefixer.getSIPrefixedValue(100*omega0).evalf()))
# print(latex(prefixer.getSIPrefixedValue(1000*omega0).evalf()))
# print(latex(prefixer.getSIPrefixedValue(1000000*omega0).evalf()))
# print(latex(prefixer.getSIPrefixedValue(100000*omega0).evalf()))
# print(latex(prefixer.getSIPrefixedValue(100.0*omega0).evalf()))
# print(latex(prefixer.getSIPrefixedValue(1000.0*omega0).evalf()))
