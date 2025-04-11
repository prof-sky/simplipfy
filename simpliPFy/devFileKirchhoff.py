import solve

# test = solve.KirchhoffSolver("08_resistor_parallel3.txt", "Circuits/resistor/", {"volt": "U", "total": "ges"})
test = solve.KirchhoffSolver("00_Resistor_Hetznecker.txt", "Circuits/resistor/", {"volt": "U", "total": "ges"})
a = test.checkVoltageLoopRule(["R1", "R2", "R3", "R4"])
e = test.checkVoltageLoopRule(["R2", "R1"])
b = test.checkVoltageLoopRule(["V1", "R1"])
print(test)