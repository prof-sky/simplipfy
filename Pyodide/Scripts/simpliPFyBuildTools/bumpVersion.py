# bump_version.py
import os
from pathlib import Path
from json import loads, dumps
from warnings import warn
import re
from simpliPFyBuildTools.hashFolder import hash_folder
from typing import Literal

versionChangeOpts = Literal["noChange", "patch", "minor", "major"]

project_root = Path(__file__).parents[3]
simplipfyVersionFile = project_root.joinpath("simpliPFy/setup.py")
simplipfyFolder = project_root.joinpath("simpliPFy/simplipfy")
lcapyVersionFile = project_root.joinpath("lcapy-inskale/setup.py")
lcapyFolder = project_root.joinpath("lcapy-inskale/lcapyInskale")
schemdrawVersionFile = project_root.joinpath("Schemdraw/schemdrawInskale/__init__.py")
schemdrawFolder = project_root.joinpath("Schemdraw/schemdrawInskale")
versionFile = project_root.joinpath("versionInfo.json")

versionRegex = r"__version__ = '[0-9]+\.[0-9]+\.[0-9]+'"

class PackageVersionDict(dict):
    major: int
    minor: int
    patch: int
    hash: str

class PackageVersion:
    def __init__(self, data: PackageVersionDict,
                 versionFile: Path, packageFolder: Path):
        self.major: int = data["major"]
        self.minor: int = data["minor"]
        self.patch: int = data["patch"]
        self.hash: str = data["hash"]
        self.versionFile: Path = versionFile
        self.packageFolder: Path = packageFolder

    @property
    def versionString(self):
        return self.__str__()

    def toJson(self) -> PackageVersionDict:
        return PackageVersionDict({
            "major": self.major,
            "minor": self.minor,
            "patch": self.patch,
            "hash": self.hash
        })

    def __str__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

    def bump(self, option: versionChangeOpts):
        if option == "patch":
            return self.bumpPatch()
        elif option == "minor":
            return self.bumpMinor()
        elif option == "major":
            return self.bumpMajor()
        elif option == "noChange":
            return self
        else:
            raise RuntimeError(f"Invalid bump option: {option}")

    def bumpPatch(self):
        self.patch += 1
        return self

    def bumpMinor(self):
        self.patch = 0
        self.minor += 1
        return self

    def bumpMajor(self):
        self.patch = 0
        self.minor = 0
        self.major += 1
        return self

    def update(self, versionChange: versionChangeOpts = "noChange", safe: bool = True):
        if versionChange == "noChange":
            return

        self.bump(versionChange)
        self.updateVersionInFile(versionRegex)
        self.updateHash()

        if safe:
            VersionManager().safe()

    @property
    def hashChanged(self) -> bool:
        return self.calculateHash() != self.hash

    def calculateHash(self):
        return hash_folder(self.packageFolder, "**/*.py").hexdigest()

    def updateHash(self):
        self.hash = self.calculateHash()
        return self

    def updateVersionInFile(self, regex: str):
        with open(self.versionFile, "r+") as f:
            initData = f.read()
            initData = re.sub(regex, "__version__ = " + f"\'{self.versionString}\'", initData)

            f.seek(0)
            f.write(initData)
            f.truncate()


class VersionManager:
    _instance = None
    _initialized = False


    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)

        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        exists = os.path.isfile(versionFile)
        if exists:
            with open(versionFile) as v:
                data = loads(v.read())
        else:
            warn(f"versionInfo.json not found, assuming all package versions are 0.0.0")
            data = {
                "simplipfy": {
                    "major": 0,
                    "minor": 1,
                    "patch": 101,
                    "hash": ""
                },
                "lcapyInskale": {
                    "major": 0,
                    "minor": 38,
                    "patch": 7,
                    "hash": ""
                },
                "schemdrawInskale": {
                    "major": 0,
                    "minor": 10,
                    "patch": 0,
                    "hash": ""
                }
            }

        simplipfy = PackageVersionDict(data["simplipfy"])
        lcapyInskale = PackageVersionDict(data["lcapyInskale"])
        schemdrawInskale = PackageVersionDict(data["schemdrawInskale"])

        self.simplipfy = PackageVersion(simplipfy, simplipfyVersionFile, simplipfyFolder)
        self.lcapyInskale = PackageVersion(lcapyInskale, lcapyVersionFile, lcapyFolder)
        self.schemdrawInskale = PackageVersion(schemdrawInskale, schemdrawVersionFile, schemdrawFolder)

        self._initialized = True

    def safe(self):
        with open(versionFile, "w") as v:
            v.write(
                dumps(
                    {
                    "simplipfy": self.simplipfy.toJson(),
                    "lcapyInskale": self.lcapyInskale.toJson(),
                    "schemdrawInskale": self.schemdrawInskale.toJson(),
                    }
                )
            )

if __name__ == "__main__":
    print("Usage example:")
    vm = VersionManager()
    vm.simplipfy.bumpPatch()
    vm.lcapyInskale.bumpPatch()
    vm.schemdrawInskale.bumpPatch()
    vm.safe()
    print("example finished")