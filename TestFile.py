from lcapy import Circuit

cct = Circuit("""
... V1 0 2 {V1}; up
... W1 2 3; up
... W2 3 4; right
... R1 4 5 {R1}; down
... R2 5 6 {R2}; down
... R3 6 7 {R3}; down
... R4 7 8 {R4}; down
... W6 7 11; right
... R5 11 12 {R5}; down
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
    print("-------------------------")
    print(f"Netlist of nos :{i}")
    i += 1
    print(net)

    net[0].draw()

