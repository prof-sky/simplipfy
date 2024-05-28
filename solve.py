print("started solve.py")

from lcapy import Circuit
from lcapy import Solution
from lcapy import FileToImpedance
import os
print("imports  done")

# cct = Circuit(FileToImpedance("Circuits/Circuit_mixed.txt"))
# cct = Circuit(filename="Circuits/Circuit_resistors.txt")
# cct = Circuit(filename="Circuits/Circuit_capacitors.txt")
cct = Circuit(filename="Circuits/Circuit_inductors.txt")

steps = cct.simplify_stepwise()
sol = Solution(steps)
sol.draw(path="Solutions")
sol.export(path="Solutions")

print(os.listdir("Solutions"))

print("finished solve.py")