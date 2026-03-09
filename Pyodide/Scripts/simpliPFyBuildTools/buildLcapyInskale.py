from build.__main__ import build_package as build
from pathlib import Path
from simplipfy.Tools.printColored import cPrint, CPrintColors
from os import remove
from shutil import copy
from simpliPFyBuildTools.bumpVersion import VersionManager, versionChangeOpts

project_root = Path(__file__).parents[3]
src = project_root.joinpath("lcapy-inskale")
dst = project_root.joinpath("lcapy-inskale/dist")

def build_lcapyInskale(versionChange: versionChangeOpts = "noChange"):
    # update content in Pyodide/simplipfyAPI.py
    vm = VersionManager()
    vm.lcapyInskale.update(versionChange)
    versionString = vm.lcapyInskale.versionString

    print("Build lcapy package whl:")
    build(src, dst, ["wheel"])
    cPrint("Successfully built lcapy-inskale package whl", color=CPrintColors.GREEN)

    print("Remove old packages from .../inskale/Pyodide/Packages")
    packagesFolder = project_root.joinpath("Pyodide/Packages")
    packages = packagesFolder.glob("*lcapyinskale*.whl")
    for package in packages:
        remove(package)
        print("Removed package:", package.name)

    print("Copy new package:")
    newPackage = dst.glob(f"*{versionString}*")
    if not newPackage:
        raise RuntimeError(f"No new package found for {versionString}")
    newPackage = next(newPackage)
    copy(newPackage, project_root.joinpath("Pyodide/Packages"))
    print(f"copied: {newPackage.name} to .../inskale/Pyodide/Packages")
    cPrint("Successfully copied new package to Pyodide/Packages", color=CPrintColors.GREEN)

    vm.lcapyInskale.updateHash()

if __name__ == "__main__":
    build_lcapyInskale()