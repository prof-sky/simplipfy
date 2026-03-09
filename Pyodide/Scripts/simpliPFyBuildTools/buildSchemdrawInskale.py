from build.__main__ import build_package as build
from pathlib import Path
from simplipfy.Tools.printColored import cPrint, CPrintColors
from os import remove
from shutil import copy
from simpliPFyBuildTools.bumpVersion import VersionManager, versionChangeOpts
project_root = Path(__file__).parents[3]
src = project_root.joinpath("Schemdraw")
dst = project_root.joinpath("Schemdraw/dist")

def build_schemdraw(versionChange: versionChangeOpts = "noChange"):
    vm = VersionManager()
    vm.schemdrawInskale.update(versionChange)
    versionString = vm.schemdrawInskale.versionString

    print("Build Schemdraw package whl:")
    build(src, dst, ["wheel"])
    cPrint("Successfully built Schemdraw package whl", color=CPrintColors.GREEN)

    print("Remove old packages from .../inskale/Pyodide/Packages")
    packagesFolder = project_root.joinpath("Pyodide/Packages")
    packages = packagesFolder.glob("*schemdraw*.whl")
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

    vm.schemdrawInskale.updateHash()

if __name__ == "__main__":
    build_schemdraw()