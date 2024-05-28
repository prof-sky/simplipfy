from lcapy import Circuit
from lcapy import Solution
from lcapy import FileToImpedance

# cct = Circuit(FileToImpedance("Non-Lcapy-Files/Circuit_mixed.txt"))
# cct = Circuit(filename="Non-Lcapy-Files/Circuit_resistors.txt")
# cct = Circuit(filename="Non-Lcapy-Files/Circuit_capacitors.txt")
cct = Circuit(filename="Non-Lcapy-Files/Circuit_inductors.txt")

steps = cct.simplify_stepwise()
sol = Solution(steps)
sol.draw(path="Non-Lcapy-Files/Solutions")
sol.export(path="Non-Lcapy-Files/Solutions")

