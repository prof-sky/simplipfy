from enum import Enum

class MagneticStates(Enum):
    """
    MagneticStates is an enumeration that defines the possible states of the Chosen Magnetic Elements.
    Those are used for error handling/ error messages in the frontend.
    """
    isTransformable = 0
    duplicateElement = 1    # not used if elements can only be clicked once
    notSingleSource = 2     # user tried to combine source with different elements
    notInSeries = 3         # not in series (user chooses components that are not connected, or deg>2)
    chooseOneElement = 4    # no element chosen