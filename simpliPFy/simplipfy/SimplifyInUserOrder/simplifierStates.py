from enum import Enum
from lcapyInskale.componentRelation import ComponentRelation

class SimplifierStates(Enum):
    """
    KirchhoffStates is an enumeration that defines the possible states of a Kirchhoff equation.
    Those are used for error handling/ error messages in the frontend.
    """
    inSeries = "inSeries"
    inParallel = "inParallel"
    notSeries = "notSeries"
    notParallel = "notParallel"
    notInRelation = "notInRelation"
    delta = "delta"
    star = "star"
    undefined = "undefined"

    @staticmethod
    def fromCptRelation(state: ComponentRelation) -> 'SimplifierStates':
        if state == ComponentRelation.parallel:
            return SimplifierStates.inParallel
        elif state == ComponentRelation.series:
            return SimplifierStates.inSeries
        elif state == ComponentRelation.none:
            return SimplifierStates.notInRelation
        else:
            raise RuntimeError(f"Value has no conversion to SimplifierState, value: {state.value}")

    def to_string(self):
        return self.__str__()
