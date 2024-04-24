from lcapy import Circuit
import to_impedance

def process_entry(cir: Circuit, iteration: int):
    print("-------------------------")
    print(f"Netlist of nos :{iteration}")
    print(cir)

    cir, _ = cir.remove_dangling()
    cir.draw()


# cct = Circuit(to_impedance.ConvertNetlistFile("Circuit.txt"))
cct = Circuit(open("ImpedaceCircuit.txt").read())
cct2, _ = cct.simplify()

cct.draw()
cct2, nos = cct.simplify()

i = 1
for net in nos:
    process_entry(net, i)
    i += 1

