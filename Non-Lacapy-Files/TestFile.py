from lcapy import Circuit
import to_impedance

import random


cct = Circuit(to_impedance.ConvertNetlistFile("Non-Lacapy-Files/Circuit.txt"))
# cct = Circuit(open("Non-Lacapy-Files/ImpedaceCircuit.txt").read())
# cct2 = cct.simplify()

steps = cct.simplify_stepwise(debug=True)


for step in steps:
    print("-------------------------")
    assert isinstance(step[0], Circuit)
    step.draw()
    if setp 
    print(step.netlist())

