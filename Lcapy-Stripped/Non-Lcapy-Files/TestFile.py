from lcapy import Circuit
from lcapy import Solution
from lcapy import FileToImpedance

# filename = "NCircuit_inductors.txt"
# filename = "Circuit_resistors.txt"
# filename = "Circuit_capacitors.txt"
filename = "Circuit_mixed.txt"

cct = Circuit(FileToImpedance(filename))

steps = cct.simplify_stepwise()
sol = Solution(steps)
sol.draw(path="Solutions")
sol.export(path="Solutions")

