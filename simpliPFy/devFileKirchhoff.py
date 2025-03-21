import solve
from simplipfy.langSymbols import LangSymbols

test = solve.KirchhoffSolver("04_resistor_mixed_simple.txt", "Circuits/resistor/", {"volt": "U", "total": "ges"})
a = test.checkVoltageLoopRule(["R5", "R3", "R4"])
d = test.checkVoltageLoopRule(["V1", "R2", "R1", "R3", "R4"])
c = test.checkVoltageLoopRule(["V1", "R1", "R2", "R3", "R5"])
b = test.checkVoltageLoopRule(["R4", "R5"])

e = test.checkJunctionRule(["R2", "R4", "R5"])
f = test.checkJunctionRule(["R5", "R2"])
g = test.checkJunctionRule(["R2", "R3"])
h = test.checkJunctionRule(["R3", "R2"])
i = test.checkJunctionRule(["R3", "R4", "R5"])
j = test.checkJunctionRule(["R4", "R3", "R5"])
k = test.checkJunctionRule(["R5", "R3", "R4"])
l = test.checkJunctionRule(["R1", "R2"])
print(test)