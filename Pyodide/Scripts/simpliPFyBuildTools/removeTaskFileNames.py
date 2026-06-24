from pathlib import Path
from os import remove
from shutil import make_archive, unpack_archive, rmtree

project_root = Path(__file__).parents[3]
distCircuitsZipPath = project_root / "Pyodide" / "dist" / "Circuits.zip"
distPath = project_root / "Pyodide" / "dist"

unpack_archive(distCircuitsZipPath, distPath, 'zip')
remove(distCircuitsZipPath)

circuitsFolderPath = distPath / "Circuits"

txtFiles = list(circuitsFolderPath.glob("*/**.txt"))
for file in txtFiles:
    if file.parent.name == "wheatstone": continue
    newName = file.name.split("_")[0]+"_.txt"
    try:
        file.rename(file.parent / newName)
    except FileExistsError:
        print(f"File {newName} already exists in {file.parent}. At least numbers before filenames have to be unique for this to work.")
        exit(1)

svgFiles = circuitsFolderPath.glob("*/**.svg")
for file in svgFiles:
    if file.parent.name == "wheatstone": continue
    newName = file.name.split("_")[0]+"__step0.svg"

    try:
        file.rename(file.parent / newName)
    except FileExistsError:
        print(f"File {newName} already exists in {file.parent}. At least numbers before filenames have to be unique for this to work.")
        exit(1)

make_archive(circuitsFolderPath.as_posix(), "zip", circuitsFolderPath)
rmtree(circuitsFolderPath)