from simpliPFy.solve import solve_circuit, SolveInUserOrder
import os
from simplipfy.Export.dictExport import ExportDict
import pytest
from random import choices
from string import ascii_uppercase, digits

# string is filename, integer is number of steps that shall be created
# the initial step has to be included
filenames = ["capacitor/07_capacitors_mixed_simple.txt",
             "inductor/08_inductors_mixed_simple.txt",
             "mixed/Circuit_mixed_30.txt",
             "mixed/Circuit_mixed_2pi30.txt",
             "resistor/04_resistor_mixed_simple.txt"]


def clearDir(path):
    if os.path.exists(path) and os.path.isdir(path):
        toRemove = os.listdir(path)
        for remove in toRemove:
            os.remove(os.path.join(path, remove))


def check_for_solutions(solSteps: int, filename: str, path: str = "../Solutions", filesPerStep: int = 2):
    # each step produces 2 json files and 1 svg file
    assert len(os.listdir(path)) == solSteps*filesPerStep, f"{filename} didn't produce as many files as expected"

def randomDirName(length:int  = 8) -> str:
    return ''.join(choices(ascii_uppercase + digits, k=length))

@pytest.mark.parametrize("absFileName", filenames)
def test_solveInUserOrder(absFileName):
    dirName = os.path.join("Solutions/", randomDirName())
    os.mkdir(dirName)

    fileName = os.path.basename(absFileName)
    filePath = os.path.join("../Circuits", os.path.dirname(absFileName))
    test = SolveInUserOrder(filename=fileName, filePath=filePath)
    ExportDict.set_paths(savePath=dirName, fileName=fileName)

    initStep = test.createInitialStep()
    initStep.toFiles()
    test.simplifyNCpts(["Z4", "Z5"]).toFiles()
    test.simplifyNCpts(["Z1", "Zs1"]).toFiles()
    test.simplifyNCpts(["Z2", "Z3"]).toFiles()
    test.simplifyNCpts(["Zs2", "Zs3"]).toFiles()
    

    check_for_solutions(filename=absFileName, solSteps=len(initStep["allComponents"]), path=dirName)
    clearDir(dirName)
    os.rmdir(dirName)



def generate_solve_circuit_fileNames() -> list:
    allFiles = []
    for root, _, files in os.walk("../Circuits"):
        for file in files:
            if file.endswith(".txt"):
                allFiles.append(os.path.join(root, file))
    return allFiles

@pytest.mark.parametrize("absFilePath", generate_solve_circuit_fileNames())
def test_solve_circuits(absFilePath):
    dirName = os.path.join("Solutions/", randomDirName())
    os.mkdir(dirName)

    filePath = os.path.dirname(absFilePath)
    filename = os.path.basename(absFilePath)
    solve_circuit(filename, filePath=filePath, savePath=dirName)
    steps = len(SolveInUserOrder(filename=filename, filePath=filePath).createInitialStep()["allComponents"])

    check_for_solutions(filename=filename, solSteps=steps, path=dirName)
    clearDir(dirName)
    os.rmdir(dirName)