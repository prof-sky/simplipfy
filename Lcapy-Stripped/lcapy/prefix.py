from sympy import Mul
from sympy.physics.units.prefixes import PREFIXES, Prefix
from typing import Union
from math import log10


class SIPrefix:
    def __init__(self):
        self.prefixes: dict[int, Prefix] =\
            {PREFIXES[prefixKey]._exponent: PREFIXES[prefixKey] for prefixKey in PREFIXES.keys()}

    @staticmethod
    def _findExponent(value: Union[float, int, Mul]) -> int:
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

    def _findSIPrefix(self, exponent) -> Prefix:
        return self.prefixes[min(self.prefixes.keys(), key=lambda x: abs(x-exponent))]

    def getSIPrefix(self, value) -> Prefix:
        return self._findSIPrefix(self._findExponent(value))

    def getSIPrefixedValue(self, value):
        prefix = self.getSIPrefix(value)
        exp = prefix._exponent
        return value * (1/10**exp) * prefix
