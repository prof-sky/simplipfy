import cProfile
import os
import time
from datetime import datetime

import solve
from simplipfy.Export.dictExportBase import ExportDict
from simplipfy.validateCircuitFile import ValidateCircuitFile


def save_netlist(netlist, filename, index, save: bool=True):
    if save:
        f = open(f"Netlists/net_{filename}_step_{index}", "w")
        f.write(netlist)
        f.close()

def work():
    a.createInitialStep().toFiles()
    for line in open(f"StepsToSolve/{folder}/{filename}").readlines():
        cpts = line.replace(" ", "").replace("\n", "").split(",")
        a.simplifyNCpts(cpts).toFiles()
        save_netlist(
            a.steps[-1].circuit.netlist(),
            filename,
            a.steps.index(a.steps[-1]),
            saveNetlist
        )




#  clear Solutions directory
clearPath = "./Solutions"
files = os.listdir(clearPath)
for file in files:
    os.remove(os.path.join(clearPath, file))

fixFile = False
saveNetlist = False
if fixFile:
    folder = "resistor"
    filePath = f"Circuits/{folder}"
    filename = "00_Resistor_Hetznecker.txt"
else:
    from tkinter import filedialog
    curPath = os.getcwd()
    absFilePath = filedialog.askopenfilename(initialdir=os.path.join(curPath, "Circuits"),
                                             filetypes=[("Textdateien", "*.txt"), ("Alle Dateien", "*.*")])
    filePath = os.path.dirname(absFilePath)
    folder = os.path.basename(filePath)
    filename = os.path.basename(absFilePath)

if not os.path.isfile(f"StepsToSolve/{folder}/{filename}"):
    print("File with steps to solve not found:")
    if not os.path.isfile(f"StepsToSolve/{folder}/{filename}"):
        file = open(f"StepsToSolve/{folder}/{filename}", "w")
        file.close()
        print(f"File StepsToSolve/{folder}/{filename} created.")
        exit("fill created file with steps to solve")
    exit(f"Create File ./StepsToSolve/{folder}/{filename} with steps to solve")

if not ValidateCircuitFile([os.path.join(filePath, filename)]).isValid():
    exit("File not valid")

st = time.time()
# solve.solve_circuit(filename, filePath="StandardCircuits")
a = solve.SolveInUserOrder(filename, filePath=filePath, savePath="Solutions", langSymbols={"volt": "V", "total": "tot"})
ExportDict.set_paths(a.savePath, a.filename)
cProfile.run("work()",sort="tottime")
et = time.time()

print(f"Execution time was: {et-st:.2f} s, DateTime: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
