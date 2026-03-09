# copy all files and folders, only copy <name>.bundle.js if files are bundled
import os
import shutil
from warnings import warn
from pathlib import Path
from simpliPFyBuildTools.getAbsPath import getAbsPath

project_root = Path(__file__).parents[3]

distSrc = project_root/"Pyodide"
distDst = project_root/"Pyodide/dist"

class Excludes:
    _excludes = {
        r"": {"files": [".folderHash", "Circuits_example", "GzipSimplePythonHttpServer.py", ],
                "folders": [".idea", "node_modules", "Circuits", "Circuits_example", "dist", "Scripts", "yannick"]},
        r"src": {"files": ["jsdoc.json", "log.txt","module_test.html", "readme.md"], "folders": ["docs"]},
        r"src\pages": {"files": [], "folders": ["template"]},
        r"src\scripts\applications": {"files": [], "folders": ["common", "kirchhoff", "simplifier", "wheatstone"]},
    }

    def __init__(self, path: Path | str):
        if isinstance(path, Path):
            path = str(path)
        self.path = path

    def excludedFiles(self, root):
        try:
            root = root.replace(self.path, "")
            return self._excludes[root]["files"]
        except KeyError:
            return []

    def excludedDirs(self, root):
        try:
            root = root.replace(self.path, "")
            return self._excludes[root]["folders"]
        except KeyError:
            return []

def makeDist(source: Path | str, dest: Path | str) -> None:
    if isinstance(source, Path):
        source = str(source)
    if isinstance(dest, Path):
        dest = str(dest)

    if os.path.isdir(dest):
        shutil.rmtree(dest)
    os.mkdir(dest)

    excludes = Excludes(source)

    for root, dirs, files in os.walk(source):

        dirs[:] = [d for d in dirs if d not in excludes.excludedDirs(root)]

        _dest = root.replace(source, dest)
        if ".bundleLast" in files:
            try:
                file = [file for file in files if ".bundle." in file][0]
                shutil.move(os.path.join(root, file), os.path.join(_dest, file))
            except IndexError:
                if not ".bundleLast" in os.listdir(os.path.split(root)[0]):
                    warn(f"Expected bundle file in {root}, but none found in root or parent")

            for _dir in dirs:
                if _dir not in excludes.excludedDirs(root):
                    print(f"Copying files from {root + '/' + _dir}")
                    os.mkdir(os.path.join(_dest, _dir))

        else:
            for file in files:
                if file not in excludes.excludedFiles(root):
                    shutil.copy(os.path.join(root, file), os.path.join(_dest, file))
            for _dir in dirs:
                if _dir not in excludes.excludedDirs(root):
                    print(f"Copying files from {root + '/' +_dir}")
                    os.mkdir(os.path.join(_dest, _dir))

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="-path, path to the folder to hash")
    parser.add_argument(
        '-src',
        type=str,
        required=False,
        help="the absolute path to the folder to hash"
    )
    parser.add_argument(
        '-dst',
        type=str,
        required=False, )

    args = parser.parse_args()
    if args.src:
        src = getAbsPath(args.src)
    else:
        src = distSrc

    if args.dst:
        dst = getAbsPath(args.dst)
    else:
        dst = distDst

    makeDist(src, dst)