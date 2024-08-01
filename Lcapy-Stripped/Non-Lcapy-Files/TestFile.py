from lcapy import Circuit
from lcapy import Solution
from lcapy import FileToImpedance
from lcapy.impedanceConverter import ComponentToImpedance
from lcapy.impedanceConverter import ImpedanceToComponent
from lcapy import DrawWithSchemdraw
import os

# filename = "Circuit_inductors.txt"
# filename = "Circuit_resistors.txt"
# filename = "Circuit_capacitors.txt"
filename = "Circuit_mixed.txt"
# filename = "Circuit_Wires.txt"


class SolveInUserOrder:
    def __init__(self, filename: str, filePath=None, savePath=None):
        """
        :param filename: str with filename of circuit to simplify
        :param filePath: str with path to circuit file if not in current directory
        :param savePath: str with path to save the result svg and jason files to
        """
        if filePath is None:
            filePath = ""
        if savePath is None:
            savePath = ""

        self.filename = filename
        self.filePath = filePath
        self.savePath = savePath
        self.circuit = Circuit(FileToImpedance(filePath+filename))
        self.steps = [(self.circuit, None, None, None, None)]
        self.circuit.namer.reset()

        return

    def simplifyTwoCpts(self, cpts: list) -> tuple[bool, str, str]:
        """
        :param cpts: list with two component name strings to simplify ["R1", "R2"]
        :return: tuple with bool if simplification is possible, str with json filename, str with svg filename
        """
        if cpts[1] in self.circuit.in_series(cpts[0]):
            newNet, newCptName = self.circuit.simplify_two_cpts(self.circuit, cpts)
            self.steps.append((newNet, cpts[0], cpts[1], newCptName, "series"))
        elif cpts[1] in self.circuit.in_parallel(cpts[0]):
            newNet, newCptName = self.circuit.simplify_two_cpts(self.circuit, cpts)
            self.steps.append((newNet, cpts[0], cpts[1], newCptName, "parallel"))
        else:
            return False, "", ""

        sol = Solution(self.steps)
        newestStep = sol.available_steps[-1]

        jsonName = sol.exportStepAsJson(newestStep, path=self.savePath, filename=os.path.splitext(self.filename)[0])
        svgName = sol.drawStep(newestStep, path=self.savePath, filename=os.path.splitext(self.filename)[0])

        self.circuit = newNet
        return True, jsonName, svgName

    def createInitialStep(self) -> tuple[bool, str, str]:
        """
        create the initial step or step0 of the circuit
        """
        nameStep0Svg = f"{os.path.splitext(filename)[0]}_step0.svg"
        nameStep0Json = filename

        sol = Solution(self.steps)
        nameStep0Json = sol.exportStepAsJson("step0", path=self.savePath, filename=nameStep0Json)
        nameStep0Svg = DrawWithSchemdraw(sol["step0"].circuit, fileName=nameStep0Svg).draw(path=self.savePath)

        return True, nameStep0Json, nameStep0Svg

    def createStep0(self) -> tuple[bool, str, str]:
        return self.createInitialStep()

    def getSolution(self):
        return Solution(self.steps)


def clearDir(path):
    toRemove = os.listdir(path)
    for remove in toRemove:
        os.remove(os.path.join(path, remove))


def solve(filename):
    clearDir("Solutions")
    cct = Circuit(FileToImpedance(filename))
    steps = cct.simplify_stepwise()

    name = os.path.splitext(os.path.split(filename)[1])[0]

    sol = Solution(steps)
    sol.draw(path="Solutions", filename=name)
    sol.export(path="Solutions", filename=name)


def soveInUserOrder(filename):
    clearDir("Solutions")

    test = SolveInUserOrder(filename=filename, savePath="Solutions/")
    print(test.createInitialStep())

    print(test.simplifyTwoCpts(["Z4", "Z5"]))
    print(test.simplifyTwoCpts(["Z1", "Zsim1"]))
    print(test.simplifyTwoCpts(["Z2", "Z3"]))
    print(test.simplifyTwoCpts(["Zsim2", "Zsim3"]))


# solve(filename)
soveInUserOrder(filename)
# cct = Circuit(filename)
# cct.simplify().draw()
