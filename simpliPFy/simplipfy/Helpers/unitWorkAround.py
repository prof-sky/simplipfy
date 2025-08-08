from typing import Union

from lcapyInskale import ConstantFrequencyResponseDomainExpression, ConstantFrequencyResponseDomainImpedance, \
    capacitance, current, impedance, inductance, resistance, state, voltage
from lcapyInskale.mnacpts import C, L, R, Z
from lcapyInskale.units import farads, henrys, ohms


class UnitWorkAround:
    """
    Add units to values based on the type of the element
    """

    @staticmethod
    def addUnit(val, cptType):
        state.show_units = True
        if cptType == "R":
            returnVal = resistance(val)
        elif cptType == "C":
            returnVal = capacitance(val)
        elif cptType == "L":
            returnVal = inductance(val)
        elif cptType == "Z":
            returnVal = impedance(val)
        elif cptType == "V":
            returnVal = voltage(val)
        elif cptType == "I":
            returnVal = current(val)
        elif cptType == "W":
            return val
        elif cptType == "VM" or cptType == "AM":
            return val
        else:
            raise NotImplementedError(f"{cptType} not supported edit Solution.addUnit to support")
        return returnVal

    @staticmethod
    def getUnit(element: Union[R, C, L, Z]) -> (
            ConstantFrequencyResponseDomainExpression or ConstantFrequencyResponseDomainImpedance):
        """
        :param element: value to add unit
        :returns: unit, as lcapy Object

        Returns the unit of an element
        ::

            for R, Z -> ohm
            for C -> F
            for L -> H
        """
        if isinstance(element, (R, Z)):
            return ohms
        elif isinstance(element, C):
            return farads
        elif isinstance(element, L):
            return henrys
        else:
            raise NotImplementedError(f"{type(element)} not supported edit Solution.addUnit to support")