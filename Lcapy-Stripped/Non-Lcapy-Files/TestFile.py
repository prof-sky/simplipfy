from lcapy import Circuit
from lcapy import Solution
from lcapy import FileToImpedance

# filename = "Non-Lcapy-Files/Circuit_inductors.txt"
# filename = "Non-Lcapy-Files/Circuit_resistors.txt"
# filename = "Non-Lcapy-Files/Circuit_capacitors.txt"
filename = "Non-Lcapy-Files/Circuit_mixed.txt"

cct = Circuit(FileToImpedance(filename))

steps = cct.simplify_stepwise()
sol = Solution(steps)
sol.draw(path="Non-Lcapy-Files/Solutions")
sol.export(path="Non-Lcapy-Files/Solutions")

