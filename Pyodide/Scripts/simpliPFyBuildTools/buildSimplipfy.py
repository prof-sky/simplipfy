from typing import LiteralString

from build.__main__ import build_package as build
from pathlib import Path
from simplipfy.Tools.printColored import cPrint, CPrintColors
from os import remove
from shutil import copy
from simpliPFyBuildTools.bumpVersion import VersionManager, versionChangeOpts


project_root = Path(__file__).parents[3]
src = project_root.joinpath("simpliPFy")
dst = project_root.joinpath("simpliPFy/dist")

def build_simplipfy(versionChange: versionChangeOpts = "noChange"):
    # update content in Pyodide/simplipfyAPI.py
    vm = VersionManager()
    vm.simplipfy.update(versionChange)

    print("Update simplipfyAPI.py:")
    versionString = vm.simplipfy.versionString
    versionHeader = f"# for simplipfy version: {versionString}"

    with open(project_root.joinpath("simpliPFy/simplipfyAPI.py"), "r") as sAPI:
        simplipfyAPIContent = sAPI.read()

    header = versionHeader + "\nimport warnings\nwarnings.filterwarnings('ignore')\n"
    with open(project_root.joinpath("Pyodide/simplipfyAPI.py"), "w") as sAPI:
        sAPI.write(header + simplipfyAPIContent)

    cPrint(f"Updated Pyodide/simplipfyAPI.py to: {versionString}", color=CPrintColors.GREEN)

    print("Build simplipfy package whl:")
    build(src, dst, ["wheel"])
    cPrint("Successfully built simplipfy package whl", color=CPrintColors.GREEN)

    print("Remove old packages from .../inskale/Pyodide/Packages")
    packagesFolder = project_root.joinpath("Pyodide/Packages")
    packages = packagesFolder.glob("*simplipfy*.whl")
    for package in packages:
        remove(package)
        print("Removed package:", package.name)

    print("Copy new package:")
    newPackage = next(dst.glob(f"*{versionString}*"), None)
    if newPackage is None:
        raise RuntimeError(f"No new package found for {versionString}")
    newPackage = newPackage
    copy(newPackage, project_root.joinpath("Pyodide/Packages"))
    print(f"copied: {newPackage.name} to .../inskale/Pyodide/Packages")
    cPrint("Successfully copied new package to Pyodide/Packages", color=CPrintColors.GREEN)

    vm.simplipfy.updateHash()