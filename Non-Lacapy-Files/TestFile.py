import warnings

from lcapy import Circuit
import to_impedance

import random


cct = Circuit(to_impedance.ConvertNetlistFile("Non-Lacapy-Files/Circuit.txt"))
# cct = Circuit(open("Non-Lacapy-Files/ImpedaceCircuit.txt").read())
# cct2 = cct.simplify()

steps = cct.simplify_stepwise()

i = 0
for step in steps:
    print("-------------------------")
    assert isinstance(step[0], Circuit)
    # step[0].draw()
    if step[1] or step[2] or step[3] or step[4]:
        print(f"Simplified {step[1]} and {step[2]} to {step[3]}")
        print(f"the components are in {step[4]}")
        lastStep = steps[i-1]
        print(f"{step[1]}: {(lastStep[0])[step[1]].Z}")
        print(f"{step[2]}: {(lastStep[0])[step[2]].Z}")
        print(f"{step[3]} (Result): {(step[0])[step[3]].Z}")
    else:
        if not (step[1] or step[2] or step[3] or step[4]):
            print("Initial Circuit")
        else:
            warnings.warn("Missing information in a simplification step")
    i += 1

