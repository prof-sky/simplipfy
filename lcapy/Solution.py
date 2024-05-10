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
        self._attributes = {}
        self.available_steps = []

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
        return self._attributes[key]

    def __setitem__(self, key, value):
        self._attributes[key] = value

    def __getattr__(self, key):
        return self._attributes[key]

    def __setattr__(self, key, value):
        if key.startswith('_'):
            super().__setattr__(key, value)
        else:
            self.__setitem__(key, value)

    def get_available_steps(self, skip: set):
        if skip:
            return OrderedSet(self.available_steps) - skip
        else:
            return OrderedSet(self.available_steps)

    def solution_text(self, step: str) -> str:
        assert isinstance(self, Solution)
        assert isinstance(self[step], SolutionStep)

        if self[step].is_initial_step:
            return "\ninitialCircuit"

        solText = "\n-------------------------------"
        solText += f"\nSimplified {self[step].cpt1} and {self[step].cpt2} to {self[step].newCptName}"
        solText += f"\nthe components are in {self[step].relation}"
        solText += f"\n{self[step].cpt1}: {self[step].LastStep.circuit[self[step].cpt1].Z}"
        solText += f"\n{self[step].cpt2}: {self[step].LastStep.circuit[self[step].cpt2].Z}"
        solText += f"\n{self[step].newCptName} (Result): {self[step].circuit[self[step].newCptName].Z}"
        return solText

    def _next_solution_text(self, skip: set = None, returnSolutionStep: bool = False) -> str or (str, SolutionStep):

        for step in self.get_available_steps(skip):
            if not returnSolutionStep:
                yield self.solution_text(step)
            else:
                yield self.solution_text(step), self[step]

    def Steps(self, skip: set = None) -> Iterable[SolutionStep]:
        """
        yields the steps from the simplification. They can be iterated in a for loop e.g.:
        for step in sol.Steps():
            print(step.solutionText)
            step.circuit.draw()
        :param skip: define a set of steps that should be skipped e.g. the initialCircuit (step[0]) every other step is
        named as follows: step1, step2, ..., step<n>
        :return:
        """
        for step in self.get_available_steps(skip=skip):
            yield self[step]

    def complete_solution_text(self, skip: set = None) -> str:

        solText = ""
        for step in self.get_available_steps(skip):
            solText += self.solution_text(step)
        return solText
