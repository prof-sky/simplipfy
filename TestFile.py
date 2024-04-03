from lcapy import Circuit

cct = Circuit("""
... V1 0 1 10; down
... W1 1 2; right
... R1 2 3 10; down
... R2 3 4 10; down
... W2 4 0; left
""")

print("--- Currents ---")
print(cct.branch_currents())
input()

print("--- Voltages ---")
print(cct.branch_voltages())
input()

print("--- Resistance ---")
print(cct.resistance(0, 1))
input()
