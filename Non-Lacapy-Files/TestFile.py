from lcapy import Circuit


def process_entry(cir: Circuit, iteration: int):
    print("-------------------------")
    print(f"Netlist of nos :{iteration}")
    print(cir)

    cir, _ = cir.remove_dangling()
    cir.draw()


cct = Circuit("""
... V1 0 2 dc {10}; up
... W1 2 3; up
... W2 3 4; right
... R1 4 5 {100}; down
... R2 5 6 {100}; down
... R3 6 7 {100}; down
... R4 7 8 {100}; down
... W6 7 11; right
... R5 11 12 {100}; down
... W7 12 8; left
... W3 8 9; left
... W4 9 10; up
... W5 10 0; up
""")

print("--- Currents ---")
print(cct.branch_currents())

print("--- Voltages ---")
print(cct.branch_voltages())

print("--- Resistance ---")
print(cct.resistance(4, 5))
print(cct.netlist())

cct.draw()
cct2, nos = cct.simplify()

i = 1
for net in nos:
    process_entry(net, i)
    i += 1

