from lcapy import Circuit
import to_impedance
import random


def process_entry(cir: Circuit, iteration: int):
    print("-------------------------")
    print(f"Netlist of nos :{iteration}")
    print(cir)

    cir, _ = cir.remove_dangling()
    cir.draw()


cct = Circuit(to_impedance.ConvertNetlistFile("Non-Lacapy-Files/Circuit.txt"))
# cct = Circuit(open("Non-Lacapy-Files/ImpedaceCircuit.txt").read())
cct2 = cct.simplify()

steps = cct.simplify_stepwise(debug=True)
for step in steps:
    assert isinstance(step, Circuit)
    step.draw()

exit("early exit")

cct.draw()

i = 1
for net in steps:
    process_entry(net, i)
    i += 1
