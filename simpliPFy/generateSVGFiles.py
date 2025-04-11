import os
import shutil
import sys
import warnings

if os.path.isfile(os.path.join(os.path.dirname(os.getcwd()), "solve.py")):
    os.chdir('../')

sys.path.append(os.getcwd())
import solve


# where the Circuits are
folderPath = "Circuits"
# look for subfolders, subfolders in subfolders are forbidden
subFolderPaths = []
for path in os.listdir(folderPath):
    if os.path.isdir(os.path.join(folderPath, path)):
        subFolderPaths.append(os.path.join(folderPath, path))

# create a folder to save the files in temporarily
savePath = ".tmpSVGFiles"
if not os.path.exists(savePath):
    os.mkdir(savePath)
else:
    shutil.rmtree(savePath)
    os.mkdir(savePath)

try:
    for folder in subFolderPaths:

        allFiles = os.listdir(folder)
        files = []
        quickStartFiles = []
        for file in allFiles:
            if file[-4::] in [".txt", ".sch"]:
                files.append(file)
            elif file[-5::] in [".json"]:
                quickStartFiles.append(file)

        # remove files that are not a circuit
        for file in list(set(allFiles) - set(files) - set(quickStartFiles)):
            os.remove(os.path.join(folder, file))

        for file in files:
            path = os.path.join(folder, file)
            print(f"generating: {path.replace('.txt', '.svg')}")
            if not os.path.isfile(path):
                continue
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                solver = solve.SolveInUserOrder(file, filePath=folder, savePath=savePath)
                solver.createInitialStep().toSVG(fileName=file, savePath=savePath)

        for file in os.listdir(savePath):
            if not file[-4::] == ".svg":
                os.remove(os.path.join(savePath, file))

        tempFolderFiles = os.listdir(savePath)
        for file in tempFolderFiles:
            shutil.move(os.path.join(savePath, file), os.path.join(folder, file))

except Exception as ex:
    print(ex)
    shutil.rmtree(savePath)
    exit(1)

# remove the temp folder
shutil.rmtree(savePath)
