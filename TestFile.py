from lcapy import Circuit

cct = Circuit("""
... V1 0 2 {V1}; up
... R1 2 3 {R1}; down
... R2 3 4 {R2}; down
... R3 4 5 {R3}; down
... R4 5 6 {R4}; down
""")

print("--- Currents ---")
print(cct.branch_currents())

print("--- Voltages ---")
print(cct.branch_voltages())

print("--- Resistance ---")
print(cct.resistance(2, 5))
print(cct.netlist())
cct2, nos = cct.simplify()

i = 1
for net in nos:
    print("-------------------------")
    print(f"Netlist of nos :{i}")
    i += 1
    print(net)
    print("--------------------------")

print(cct2.netlist())

exit("Exit Code early with statement")

cct.draw()
