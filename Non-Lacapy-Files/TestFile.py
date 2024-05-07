import warnings

from lcapy import Circuit
import to_impedance
from lcapy import Solution
import random


# cct = Circuit(to_impedance.ConvertNetlistFile("Non-Lacapy-Files/Circuit_mixed.txt"))
# cct = Circuit(filename="Non-Lacapy-Files/Circuit_resistors.txt")
cct = Circuit(filename="Non-Lacapy-Files/Circuit_capacitors.txt")
# cct = Circuit(filename="Non-Lacapy-Files/Circuit_inductors")

steps = cct.simplify_stepwise()
sol = Solution.Solution(steps)

# print(sol.complete_solution_text(skip=set(['step1'])))

for step in sol.Steps():
    print(step.solutionText)
    step.circuit.draw()

# print("".join(sol.next_solution_text()))

# print("----------------------------")
# print(sol.initialCircuit.circuit[sol.step1.cpt1].Z)
# print("----------------------------")
