import os.path
from typing import Iterable, TYPE_CHECKING, Union
from warnings import warn

from lcapyInskale import state
from lcapyInskale.mnacpts import C, L, R, Z
from simplipfy.Export.dictExportCircuitInfo import DictExportCircuitInfo
from simplipfy.Export.dictExportSimpStep import DictExportSimpStep
from simplipfy.Helpers.impedanceConverter import ImpedanceToComponent
from simplipfy.Helpers.unitWorkAround import UnitWorkAround as uwa
from simplipfy.Svg.drawWithSchemdraw import DrawWithSchemdraw
from simplipfy.Export.DataStructures.exportDict import ErrorExportDict

if TYPE_CHECKING:
    from simplipfy.Export.DataStructures.exportDict import ExportDictBase, ErrorExportDict
    from simplipfy.Export.DataStructures.exportDict import Step0ExportDict
    from lcapyInskale import ConstantDomainExpression
    from lcapyInskale.solutionStep import SolutionStep
    from simplipfy.Helpers.langSymbols import LangSymbols

class Solution:
    def __init__(self, steps: list['SolutionStep'], langSymbols: 'LangSymbols', isGeneralized: bool):
        """
        :param steps: List of SolutionSteps, lcapy.SolutionStep Object created by SimplifyStepWise and
         SimplifyInUserOrder Modules

        This class handles the access to all data that is necessary to create a step-by-step solution for a circuit.
        """
        self._attributes = {}
        self.available_steps: list[SolutionStep] = []

        self.langSymbols = langSymbols
        self.mapKey = dict([("initialCircuit", "step0")])

        # convert the steps returned from simplify_stepwise to SolutionSteps
        # the simplify function cant return SolutionSteps because it imports lcapy and therefor results in a circular
        solSteps = steps

        if not solSteps:
            raise AttributeError('can`t create Solution from empty list\n'
                                 'make sure parameter steps isn`t an empty list')

        # name and add first Circuit
        self.available_steps.append("step0")
        self.__setitem__("step0", solSteps[0])
        self.circuitType = self._getCircuitType()
        self.isSymbolic = self._isSymbolic()
        self.isGeneralized = isGeneralized

        if len(solSteps) >= 2:
            self["step0"].nextStep = solSteps[1]
        else:
            return

        for i in range(1, len(solSteps)):
            curStep = "step" + str(i)
            self.available_steps.append(curStep)

            self.__setitem__(curStep, solSteps[i])
            self[curStep].lastStep = solSteps[i - 1]

            # the list index is only to len(list) -1 accessible
            if i + 1 <= len(solSteps) - 1:
                self[curStep].nextStep = solSteps[i + 1]

    def __getitem__(self, key) -> 'SolutionStep':
        try:
            return self._attributes[key]
        except KeyError:
            if key in self.mapKey.keys():
                return self._attributes[self.mapKey[key]]
            else:
                raise KeyError

    def __setitem__(self, key: str, value: 'SolutionStep'):
        self._attributes[key] = value

    def __getattr__(self, key: str) -> 'SolutionStep':
        try:
            return self._attributes[key]
        except KeyError:
            if key in self.mapKey.keys():
                return self._attributes[self.mapKey[key]]
            else:
                raise KeyError

    def __setattr__(self, key: str, value: 'SolutionStep'):
        if key.startswith('_'):
            super().__setattr__(key, value)
        else:
            self.__setitem__(key, value)

    def addKeyMapping(self, accessKey, realKey: str) -> None:
        """
        :param accessKey: key that you want to use
        :param realKey: key name from this class step0, step1, step2, ...
        :returns: None

        If a KeyError is thrown, a dictionary is searched. If it is in the dictionary the __getItem__ or __getAttr__
        it is tried again with the specified key in the Dictionary
        """
        if realKey not in self.available_steps:
            raise KeyError("realKey doesn't exist")

        self.mapKey[accessKey] = realKey

    def removeKeyMapping(self, accessKey):
        """
        removes the mapping of a key that was added with self.addKeyMapping
        """
        if accessKey in self.mapKey.keys():
            self.mapKey.pop(accessKey)
        else:
            warn("accessKey not in mapKey")

    def getAvailableSteps(self, skip: set[str]) -> 'list[str]':
        """
        :param skip: set of step names to skip
        :returns: List of string with the names of the steps

        Returns all available Steps
        """
        if skip:
            return list(set(self.available_steps) - skip)
        else:
            return self.available_steps

    @staticmethod
    def getElementSpecificValue(element: Union['R', 'C', 'L', 'Z'], unit=False) -> 'ConstantDomainExpression':
        """
        :param element: Mnacpts.R | mnacpts.L | mnacpts.C | mnacpts.Z
        :param unit: if True the Unit (ohm, F, H) is added to the str
        :returns: lcapy Object of value if the unit is true with unit set in the object.

        Lcapy does not have a function to get the value of a component e.g.: Resistance for R1 and capacitance of C1
        This function is used to get the value of a component. It uses the type of the component to determine which
        field to access to return the correct value.
        """
        if unit:
            return uwa.addUnit(Solution.getElementSpecificValue(element), element.type)

        state.show_units = False
        if isinstance(element, R):
            returnVal = element.R
        elif isinstance(element, C):
            returnVal = element.C
        elif isinstance(element, L):
            returnVal = element.L
        elif isinstance(element, Z):
            returnVal = element.Z
        else:
            raise NotImplementedError(f"{type(element)} "
                                      f"not supported edit Solution.getElementSpecificValue() to support")

        return returnVal

    def steps(self, skip: set[str] = None) -> Iterable['SolutionStep']:
        """
        :param skip: defines a set of step names that should be skipped
        :returns: yields the steps of the solution
        """
        for step in self.getAvailableSteps(skip=skip):
            yield self[step]

    @staticmethod
    def check_path(path: str):
        """
        checks if the Solution directory exists, if not, it will be created
        """
        if not os.path.isdir(path) and os.path.isfile(path):
            raise ValueError(f"{path} is a file not a directory")
        elif not os.path.isdir(path) and not path == "":
            os.mkdir(path)

    def draw(self, filename: str = "circuit", path: str = None) -> None:
        """
        :param filename: optional filename, files will be named filename_step<n>.svg n = 0,1 ..., len(availableSteps)
        :param path: directory in which to save the json-Files in, if None save in current directory
        :returns: None
        :raises ValueError: if path is not a directory

        Saves a svg-File for each step in the Solution.
        """

        if path is None:
            path = ""

        Solution.check_path(path)

        for step in self.available_steps:
            self.drawStep(step, filename=filename, path=path)

    def drawStep(self, step, filename=None, path: str = None) -> str:
        """
        :param step: step0, step1, step2, ..., step<n> ..., self.getAvailableSteps returns all valid steps
        :param filename: optional filename, files will be named filename_step<n>.svg n = 0,1 ..., len(availableSteps)
        :param path: directory in which to save the json-File in, if None save in the current directory
        :returns: path to the svg-File
        :raises ValueError: if path is not a directory

        Draws the circuit for a specific step
        """
        if path is None:
            path = ""

        if filename is None:
            filename = self.filename
        filename = os.path.splitext(filename)[0]

        DrawWithSchemdraw(self[step].circuit, fileName=filename + f"_{step}.svg", langSymbols=self.langSymbols).draw(path=path)

        return os.path.join(path, filename + f"_{step}.svg")

    def exportCircuitInfo(self, step) -> Union['Step0ExportDict', 'ErrorExportDict']:
        """
        :returns the circuit information of step0 as a dictionary
        """
        try:
            return DictExportCircuitInfo(self.langSymbols, self.circuitType, self.isSymbolic).getDictForStep(step, self)
        except ValueError as e:
            return ErrorExportDict(str(e))

    def exportStepAsDict(self, step) -> 'ExportDictBase':
        """
        :returns the circuit information of any step in the solution as a dictionary
        """
        if step == "step0":
            return self.exportCircuitInfo("step0")

        return DictExportSimpStep(self.langSymbols, self.isSymbolic).getDictForStep(step, self)

    def exportStepAsJson(self, step: str, path: str = None, filename: str ="circuit") -> str:
        """
        :param step: step0, step1, step2, ..., step<n> ..., self.getAvailableSteps returns all valid steps
        :param path: directory in which to save the json-File in, if None save in current directory
        :param filename: json-File will be named <filename>_step<n>.json n = 0,1 ..., len(availableSteps)
        :param debug: print dictionary used to create the json-File

        Export a step to a json-File
        """
        if path is None:
            path = ""

        Solution.check_path(path)

        return self.exportStepAsDict(step).toJSON(savePath=path, fileName=filename)

    def exportAsJsonFiles(self, path: str = None, filename: str = "circuit"):
        """
        :param path: Directory in which to save the json-File in, if None save in current directory
        :param filename: json-File will be named <filename>_step<n>.json n = 0,1 ..., len(availableSteps)
        :param debug: Print dictionary used to create the json-File

        Export all steps to json-Files.
        """

        for step in self.available_steps:
            self.exportStepAsDict(step).toJSON(savePath=path, fileName=filename)

    def exportAsDicts(self) -> list[dict]:
        """
        :returns: list of dictionaries, list contains each step as a dict for details of dict see exportStepAsDict
        """
        dicts = []
        for step in self.available_steps:
            dicts.append(self.exportStepAsDict(step))

        return dicts

    def _getCircuitType(self) -> str:
        """
        :returns: "R", "L", "C", "RLC"
        :raises ValueError: if the type is not one of the expected types (R, L, C, RLC)

        Determines the type of the circuit by checking the components in the circuit
        """
        types = set()
        for cptName in self['step0'].circuit.reactances:
            cptType = ImpedanceToComponent(str(self['step0'].circuit[cptName]))[0]
            types.add(cptType)

        if len(types) == 1:
            if "R" in types:
                return "R"
            elif "L" in types:
                return "L"
            elif "C" in types:
                return "C"
            elif "Z" in types:
                return "RLC"
            else:
                raise ValueError("Unexpected type in set types")
        else:
            return "RLC"

    def _isSymbolic(self):
        """
        checks if the circuit is symbolic by checking if the reactances in the circuit are sympy symbols
        """
        isSymbolic = True
        for cptName in self['step0'].circuit.reactances:
            if not self['step0'].circuit[cptName].impedance.symbols:
                isSymbolic = False
                break

        return isSymbolic

