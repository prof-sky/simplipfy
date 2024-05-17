from lcapy import Circuit
from lcapy import Solution
from lcapy import ConvertNetlistFile

cct = Circuit(ConvertNetlistFile("Non-Lacapy-Files/Circuit_mixed.txt"))
# cct = Circuit(filename="Non-Lacapy-Files/Circuit_resistors.txt")
# cct = Circuit(filename="Non-Lacapy-Files/Circuit_capacitors.txt")
# cct = Circuit(filename="Non-Lacapy-Files/Circuit_inductors.txt")

steps = cct.simplify_stepwise()
sol = Solution(steps)
sol.draw()

# sol.step0.draw()
# cct.draw()

# print(sol.complete_solution_text(skip=set(['step1'])))

# for step in sol.steps():
#     print(step.solutionText)
#     step.circuit = step.circuit.remove_dangling()
#     step.circuit.draw()


# print(sol.initialCircuit.circuit.netlist())

# print("".join(sol.next_solution_text()))

# print("----------------------------")
# print(sol.initialCircuit.circuit[sol.step1.cpt1].Z)
# print("----------------------------")
