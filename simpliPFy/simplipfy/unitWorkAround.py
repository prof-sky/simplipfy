from typing import Union

from lcapyInskale import ConstantFrequencyResponseDomainExpression, ConstantFrequencyResponseDomainImpedance
from lcapyInskale import capacitance, current, impedance, inductance, resistance, voltage
from lcapyInskale import state
from lcapyInskale.mnacpts import C, L, R, Z
from lcapyInskale.units import farads, henrys, ohms


class UnitWorkAround:
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
        else:
            raise NotImplementedError(f"{cptType} not supported edit Solution.addUnit to support")
        return returnVal

    @staticmethod
    def getUnit(element: Union[R, C, L, Z]) -> (
            ConstantFrequencyResponseDomainExpression or ConstantFrequencyResponseDomainImpedance):
        """
        returns the unit of an element
        for R 1*ohm
        for C 1*F
        for L 1*H
        for Z 1*ohm (impedance has unit ohm)
        :param element: element: mnacpts.R | mnacpts.C | mnacpts.L | mnacpts.Z
        :return: for R, C, L ConstantFrequencyResponseDomainExpression; for Z ConstantFrequencyResponseDomainImpedance
        """
        if isinstance(element, R):
            return ohms
        elif isinstance(element, C):
            return farads
        elif isinstance(element, L):
            return henrys
        elif isinstance(element, Z):
            return ohms
        else:
            raise NotImplementedError(f"{type(element)} not supported edit Solution.addUnit to support")