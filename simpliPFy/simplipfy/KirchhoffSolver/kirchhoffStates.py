from enum import Enum

class KirchhoffStates(Enum):
    isNewEquation = 0
    duplicateEquation = 1
    notAValidEquation = 2
    toManyJunctions = 3
    notAValidLoopOrder = 4