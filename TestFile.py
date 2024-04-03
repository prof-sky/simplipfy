from lcapy import Circuit

cct = Circuit("""
... V1 0 1 10
... R1 1 2 10
... R2 2 0 10
""")

print(cct)
