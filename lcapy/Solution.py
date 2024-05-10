from .SolutionStep import SolutionStep
from ordered_set import OrderedSet
from typing import Iterable

class Solution:
    def __init__(self, steps: list[tuple]):
        """
        This class simplifies the Solution and handles the access to all data that is necessary to create a step by step
        solution to a circuit. The input is of this class is the output of simplify_Stepwise
        :param steps:
        """
        self.showUnits(setTo=True)
        self._attributes = {}
        self.available_steps = []
        self.mapKey = dict([("initialCircuit", "step0")])

        solSteps = []
        for step in steps:
            solSteps.append(SolutionStep(step))

        self.available_steps.append("initialCircuit")
        self.__setitem__("initialCircuit", solSteps[0])
        if len(solSteps) >= 2:
            self["initialCircuit"].NextStep = solSteps[1]
        else:
            return

        for i in range(1, len(solSteps)):
            curStep = "step" + str(i)
            self.available_steps.append(curStep)

            self.__setitem__(curStep, solSteps[i])
            self[curStep].LastStep = solSteps[i-1]

            # the list index is only to len(list) -1 accessible
            if i + 1 <= len(solSteps) - 1:
                self[curStep].NextStep = solSteps[i+1]

        for solText, solStep in self._next_solution_text(returnSolutionStep=True):
            solStep.solutionText = solText

    def __getitem__(self, key):
        try:
            return self._attributes[key]
        except KeyError:
            if key in self.mapKey.keys():
                return self._attributes[self.mapKey[key]]
            else:
                raise AttributeError

    def __setitem__(self, key, value):
        self._attributes[key] = value

    def __getattr__(self, key):
        try:
            return self._attributes[key]
        except KeyError:
            if key in self.mapKey.keys():
                return self._attributes[self.mapKey[key]]
            else:
                raise AttributeError

    def __setattr__(self, key, value):
        if key.startswith('_'):
            super().__setattr__(key, value)
        else:
            self.__setitem__(key, value)

    @staticmethod
    def showUnits(setTo: bool = None):
        """
        changes the global state object from lcapy to show or not show units when printing
        :param setTo: bool value True enable False disable
        :return: nothing
        """
        if setTo is not None:
            state.show_units = setTo
            return
        else:
            if state.show_units:
                state.show_units = False
                return
            else:
                state.show_units = True
                return

    def addKeyMapping(self, accessKey, realKey):
        """
        If a KeyError is thrown a dictionary is searched. If it is in the dictionary the __getItem__ or __getAttr__
        it is tried again with the specified key in the Dictionary
        :param accessKey: key that you want to use
        :param realKey: key name from this class step0, step1, step2, ...
        :return: nothing / void
        """
        self.mapKey[accessKey] = realKey

    def removeKeyMapping(self, accessKey):
        self.mapKey.pop(accessKey)

    def getAvailableSteps(self, skip: set) -> OrderedSet[str]:
        """
        Returns all available steps
        :param skip: steps to skip
        :return: OrderedSet[str]
        """
        if skip:
            return OrderedSet(self.available_steps) - skip
        else:
            return OrderedSet(self.available_steps)

    @staticmethod
    def accessSpecificValue(element: mnacpts.R | mnacpts.C | mnacpts.L | mnacpts.Z) -> lcapy.ConstantDomainExpression:
        """
        accesses the value resistance, capacitance, inductance, or impedance of an element based on its type
        :param element: mnacpts.R | mnacpts.C | mnacpts.L | mnacpts.Z
        :return: lcapy.ConstantDomainExpression
        """
        if isinstance(element, mnacpts.R):
            return element.R
        elif isinstance(element, mnacpts.C):
            return element.C
        elif isinstance(element, mnacpts.L):
            return element.L
        elif isinstance(element, mnacpts.Z):
            return element.Z
        else:
            raise NotImplementedError(f"{type(element)} not supported edit Solutoin.accessSpecificValue() to support")

    def addUnit(self, element: mnacpts.R | mnacpts.C | mnacpts.L | mnacpts.Z) -> (
            ConstantFrequencyResponseDomainExpression or ConstantFrequencyResponseDomainImpedance):
        """
        returns the value of an element with its unit
        :param element: mnacpts.R | mnacpts.C | mnacpts.L | mnacpts.Z
        :return: for R, C, L ConstantFrequencyResponseDomainExpression; for Z ConstantFrequencyResponseDomainImpedance
        """
        if isinstance(element, mnacpts.R):
            return lcapy.resistance(self.accessSpecificValue(element))
        elif isinstance(element, mnacpts.C):
            return lcapy.capacitance(self.accessSpecificValue(element))
        elif isinstance(element, mnacpts.L):
            return lcapy.inductance(self.accessSpecificValue(element))
        elif isinstance(element, mnacpts.Z):
            return lcapy.impedance(self.accessSpecificValue(element))
        else:
            raise NotImplementedError(f"{type(element)} not supported edit Solutoin.getUnit to support")

    def solutionText(self, step: str) -> str:
        """
        returns the solution text of the given step
        :param step: step0, step1, step2, step<n> ..., can getAvailableSteps returns all valid steps
        :return: solutionText for the given step
        """
        assert isinstance(self, Solution)
        assert isinstance(self[step], SolutionStep)

        if self[step].isInitialStep:
            return "\ninitialCircuit / step0"

        name1 = self[step].cpt1
        name2 = self[step].cpt2
        newName = self[step].newCptName
        thisStep = self[step]
        lastStep = self[step].lastStep

        solText = "\n-------------------------------"
        solText += f"\nSimplified {name1} and {name2} to {newName}"
        solText += f"\nthe components are in {thisStep.relation}"
        solText += f"\n{name1}: {self.addUnit(lastStep.circuit[name1])}"
        solText += f"\n{name2}: {self.addUnit(lastStep.circuit[name2])}"
        solText += (f"\n{newName} (Result):" +
                    f"{self.addUnit(thisStep.circuit[newName])}")
        return solText

    def _nextSolutionText(self, skip: set = None, returnSolutionStep: bool = False) -> str or (str, SolutionStep):
        """
        is used internally, Externally use Steps() or completeSolutionText()
        :param skip: steps to skip
        :param returnSolutionStep: bool, default False when true returns str and SolutionStep else only str
        :return: str || str and SolutionStep, based on returnSolutionStep
        """
        for step in self.getAvailableSteps(skip):
            if not returnSolutionStep:
                yield self.solutionText(step)
            else:
                yield self.solutionText(step), self[step]

    def steps(self, skip: set = None) -> Iterable[SolutionStep]:
        """
        yields the steps from the simplification. They can be iterated in a for loop e.g.:
        for step in sol.Steps():
            print(step.solutionText)
            step.circuit.draw()
        :param skip: define a set of steps that should be skipped e.g. the step0 every other step is
        named as follows: step1, step2, ..., step<n>
        :return:
        """
        for step in self.getAvailableSteps(skip=skip):
            yield self[step]

    def completeSolutionText(self, skip: set = None) -> str:
        """
        returns the complete solution text for the Steps saved in the Solution Object it's called on
        :param skip: steps to skip
        :return: string that contains the complete solution text
        """
        solText = ""
        for step in self.getAvailableSteps(skip):
            solText += self.solutionText(step)
        return solText
