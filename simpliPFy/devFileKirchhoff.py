import simplipfyAPI
from simplipfy.Tools.printColored import CPrintColors, cPrint

#generate svg file

fileName = "00_Resistor_junction4.txt"

solver = simplipfyAPI.SolveInUserOrder(fileName, "Circuits/kirchhoff/", langSymbols={"volt": "U", "total": "ges"})
step0Data = solver.Solution.exportStepAsDict("step0")
step0Data.toSVG(fileName="curKirchhoff.svg")

# test = solve.KirchhoffSolver("08_resistor_parallel3.txt", "Circuits/resistor/", {"volt": "U", "total": "ges"})
test = simplipfyAPI.KirchhoffSolver(fileName, "Circuits/kirchhoff/", {"volt": "U", "total": "ges"})


#test.checkVoltageLoopRule(["R1", "R2"])

test.checkVoltageLoopRule(["Va", "R1", "R5"])
print(test.foundAllVoltEquations())
test.checkVoltageLoopRule(["Va", "R2", "R3", "R4", "R6"])
print(test.foundAllVoltEquations())
test.checkVoltageLoopRule(["R3", "R4", "R6", "R5"])
print(test.foundAllVoltEquations())
test.checkVoltageLoopRule(["Va", "R1","R3", "R4", "R6"])
print(test.foundAllVoltEquations())
test.checkVoltageLoopRule(["R1","R2"])
print(test.foundAllVoltEquations())
print(test.equations())

a = test.checkJunctionRule(["R1", "R2", "R3", "R5"])
#print(test.foundAllEquations())
'''
e = test.checkJunctionRule(["R1","R2", "R3", "R5"])
print(test.equations())
print(test.foundAllEquations())
test.checkJunctionRule(["R3","R4"])
test.checkJunctionRule(["R6","R4"])
#test.checkJunctionRule([])
print(test.equations())
print(test.foundAllEquations())'''

#-----------------------------------------------------------------------------------------------------------------------

test.checkJunctionByEq([["R1",1], ["R2",1], ["R3",-1], ["R5", -1]])
print(test.equations())
print(test.foundAllEquations())
test.checkJunctionByEq([["R4",1],["R6",-1]])
print(test.equations())
print(test.foundAllEquations())
test.checkJunctionByEq([["R4",1],["R3",-1]])
print(test.equations())
print(test.foundAllEquations())
test.checkJunctionByEq([["R1",1], ["R2",1], ["R4",-1], ["R5", -1]])
print(test.equations())
print(test.foundAllEquations())
test.checkJunctionByEq([["R1",1], ["R2",1], ["R6",-1], ["R5", -1]])
print(test.equations())

print(test.foundAllEquations())

'''
test.checkVoltageLoopRule(["Va", "R1", "C2", "L3"])
print(test.equations())
print(test.foundAllEquations())
test.checkVoltageLoopRule(["Va", "R1", "C2"])
print(test.equations())
print(test.foundAllEquations())
test.checkJunctionRule(["R1", "C2", "L3"])
print(test.equations())
print(test.foundAllEquations())
f = test.checkJunctionRule(["R1", "C2"])
print(test.equations())'''
exit(0)