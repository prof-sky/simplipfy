import os
from pathlib import Path
import shutil
from cli.makeDist import makeDist
from simpliPFyBuildTools.localServer import localServer
from simpliPFyBuildTools.hashFolder import hash_folder
from cli.generateSVGFiles import SVGFileGenerator
from simpliPFyBuildTools.zipFolder import zip_folder
from cli.buildBundles import create_bundles
from cli.release import printHeading
from simpliPFyBuildTools.bumpVersion import VersionManager
from simpliPFyBuildTools.buildSimplipfy import build_simplipfy
from simpliPFyBuildTools.buildSchemdrawInskale import build_schemdraw
from simpliPFyBuildTools.buildLcapyInskale import build_lcapyInskale

project_root = Path(__file__).parents[3]
circuitsFolder = project_root.joinpath("Pyodide/Circuits")
oldHashPath = project_root.joinpath("Pyodide/.folderHash")
src = project_root.joinpath("Pyodide")
dst = project_root.joinpath("Pyodide/dist")

simplipfyFolder = project_root.joinpath("simpliPFy/simplipfy")
lcapyFolder = project_root.joinpath("lcapy-inskale/lcapyInskale")
schemdrawFolder = project_root.joinpath("Schemdraw/schemdrawInskale")

def startServer(port: int = 8000, bind="127.0.0.1"):
    # change into the directory of this script, all links are relative to .../Inskale/Pyodide/Scripts/cli
    dirPath = Path(__file__).parent
    os.chdir(dirPath)

    printHeading("Clear dist folder")
    if dst.is_dir():
        try:
            shutil.rmtree(dst)
        except PermissionError:
            from simplipfy.Tools.printColored import cPrint
            cPrint("Permission to delete dist folder denied, it is likely that another instance of the server is already running")
            exit(1)
    os.mkdir(dst)

    printHeading("Check Circuits.zip")
    print("get old folder hash: ", end="")
    if not os.path.isfile(oldHashPath):
        open(oldHashPath, "w").close()

    with open(oldHashPath, "r") as oldHashFile:
        old_hash = oldHashFile.read()
    print(old_hash)

    print("get new folder hash: ", end="")
    new_hash = hash_folder(circuitsFolder).hexdigest()
    print(new_hash)

    if old_hash != new_hash:
        printHeading("Generate svg files")
        gen = SVGFileGenerator(circuitsFolder)
        gen.generateAllFiles()

        print("zip folder")
        zip_folder(circuitsFolder)

        print("save changed hash")
        # the hash changes due to file generation
        with open(oldHashPath, "w") as hashFile:
            hashFile.write(hash_folder(circuitsFolder).hexdigest())

    printHeading("Check Packages")
    vm = VersionManager()

    print("check simplipfy:")
    print(f"old hash: {vm.simplipfy.hash}")
    if vm.simplipfy.hash != hash_folder(simplipfyFolder, "**/*.py").hexdigest():
        build_simplipfy("patch")
    print(f"new hash: {vm.simplipfy.hash}\n")

    print("check lcapy:")
    print(f"old hash: {vm.lcapyInskale.hash}")
    if vm.lcapyInskale.hash != hash_folder(lcapyFolder, "**/*.py").hexdigest():
        build_lcapyInskale("patch")
    print(f"new hash: {vm.lcapyInskale.hash}\n")

    print("check schemdraw:")
    print(f"old hash: {vm.schemdrawInskale.hash}")
    if vm.schemdrawInskale.hash != hash_folder(schemdrawFolder, "**/*.py").hexdigest():
        build_schemdraw("patch")
    print(f"new hash: {vm.schemdrawInskale.hash}\n")

    printHeading("Creat Bundles")
    create_bundles(src)

    printHeading("Copy to dist")
    makeDist(src, dst)

    printHeading("Start local server")
    os.chdir(dst)
    localServer(port, bind)

if __name__ == "__main__":
    startServer()