import simplipfyAPI
from simplipfy.Tools.printColored import CPrintColors, cPrint

#generate svg file

fileName = ("kirchhoffTest.txt")

solver = simplipfyAPI.SolveInUserOrder(fileName, "Circuits/kirchhoff/", langSymbols={"volt": "U", "total": "ges"})
step0Data = solver.Solution.exportStepAsDict("step0")
if step0Data["error"]: raise RuntimeError(step0Data["errorMessage"])
step0Data.toSVG(fileName="curKirchhoff.svg")

# test = solve.KirchhoffSolver("08_resistor_parallel3.txt", "Circuits/resistor/", {"volt": "U", "total": "ges"})
test = simplipfyAPI.KirchhoffSolver(fileName, "Circuits/kirchhoff/", {"volt": "U", "total": "ges"})
#test.checkVoltageLoopRule(["Vb", "R2", "R3", "R4"])

test.checkJunctionRule(["R1", "R2", "R6", "R3"])
#test.checkVoltageByEq([["Va", -1], ["Vb", -1], ["R2",1], ["R3",1]])
print(test.equations())

exit(0)