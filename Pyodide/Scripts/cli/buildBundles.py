import os
from pathlib import Path
from simpliPFyBuildTools.getAbsPath import getAbsPath

project_root = Path(__file__).parents[3]
srcPath = project_root/"Pyodide/src"

from argparse import ArgumentParser
bundlesParser = ArgumentParser(description="-src, path to the folder to build bundles")
bundlesParser.add_argument(
    '-src',
    type=str,
    required=False,
    default=srcPath,
    help="path to the folder to bundle"
)

class BundleInfo:
    comments = "// *********************************************************************************************************************\n"

    def __init__(self, root: str):
        self.bundleRoot = root
        self.subRoots: list[tuple[str, list[str], list[str]]] = []

    def addSubRoot(self, root: str, files: list[str]):
        bundleLast = []
        if ".bundleLast" in files:
            f = open(os.path.join(root, ".bundleLast"), "r")
            bundleLast = f.read().split(",")
            bundleLast = [x for x in bundleLast if x != ""]
            f.close()

            file = "<not defined yet>"
            try:
                for file in bundleLast:
                    files.remove(file)

            except ValueError:
                exit(f"File listed in .bundleLast not found in {root}, file: {file}")

            files.remove(".bundleLast")




        files = [file for file in files if file.endswith(".js") and "bundle" not in file]
        bundleLast = [file for file in bundleLast if file.endswith(".js") and "bundle" not in file]

        self.subRoots.append((root, files, bundleLast))

    def bundleOrder(self):
        for root, files, bundleLast in self.subRoots:
            for file in files + bundleLast:
                yield os.path.join(root, file)

    def header(self, text):
        length = len(text)
        filler = int(107 - length)
        lenA =  int(filler/2) + filler % 2
        lenB = int(filler/2)
        fillerA = "".join(["*" for x in range(0, lenA)])
        fillerB = "".join(["*" for x in range(0, lenB)])

        return self.comments + f"// {fillerA} Bundle: {text} {fillerB}\n" + self.comments

    @property
    def name(self) -> str:
        return os.path.basename(self.bundleRoot) + ".bundle.js"

    @property
    def path(self) -> str:
        return self.bundleRoot

def create_bundles(src: Path):
    """
    creates the bundle.js files in the folder where .bundleLast files are
    """

    bundleRoot: list[str] = []
    for root, dirs, files in os.walk(src):
        # if one folder starts with the name of another folder the folder would be detected as parent already bundled
        # check if path to parent is identical
        if bundleRoot and bundleRoot[-1] in root and not "".join(bundleRoot[-1].split(os.sep)[:-1]) == "".join(root.split(os.sep)[:-1]):
            continue

        if ".bundleLast" in files:
            print(f"Found .bundleLast in {root}")
            bundleRoot.append(root)

    bundleFils: list[BundleInfo] = []
    for root in bundleRoot:
        info = BundleInfo(root)
        for subRoot, _, files in os.walk(root, topdown=False):
            info.addSubRoot(subRoot, files)
        bundleFils.append(info)

    for bundle in bundleFils:
        print(f"building {bundle.name}")
        f = open(os.path.join(bundle.path, bundle.name), "w")
        f.write("")
        f.close()

        f = open(os.path.join(bundle.path, bundle.name), "a", encoding="utf8")

        for file in bundle.bundleOrder():
            index = file.find("src")
            relativePath = file[index:]
            try:
                f.write(bundle.header(relativePath))
                f.write(open(file, "r", encoding="utf8").read() + "\n\n")
            except FileNotFoundError:
                from simplipfy.Tools.printColored import cPrint
                exit(f"{file} listed in {bundle.path}, is missing")

        f.close()

if __name__ == "__main__":
    args = bundlesParser.parse_args()
    create_bundles(getAbsPath(args.src))