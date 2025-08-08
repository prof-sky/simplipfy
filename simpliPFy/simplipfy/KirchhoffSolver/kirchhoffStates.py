from enum import Enum

class KirchhoffStates(Enum):
    """
    KirchhoffStates is an enumeration that defines the possible states of a Kirchhoff equation.
    Those are used for error handling/ error messages in the frontend.
    """
    isNewEquation = 0
    duplicateEquation = 1
    notAValidEquation = 2
    toManyJunctions = 3
    notAValidLoopOrder = 4
    dependentEquation = 5