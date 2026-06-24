import os
from subprocess import Popen
import re

from sphinx.cmd.build import build_main
from shutil import rmtree, copytree, copy
import subprocess

from simpliPFyBuildTools.envVars import EnvVars
from simpliPFyBuildTools import ftp as simFTP
from pathlib import Path

projectRoot = Path(__file__).parents[3]
pdfp = projectRoot.joinpath("simpliPFy/docs") # python docs folder path
spfp = projectRoot.joinpath("simpliPFy/simplipfy")  # simplipfy package folder path
pdbfp = projectRoot.joinpath("simpliPFy/docs/_build")  # python docs bulid folder path
fdfp = projectRoot.joinpath("Pyodide/src/docs")  # frontend docs folder path
fdbfp = projectRoot.joinpath("simpliPFy/docs/_build/source/frontendAPI")  # frontend docs build folder path
tdcp = projectRoot.joinpath("simpliPFy/docs/typedoc.json")  # jsdoc configuration path
afp = projectRoot.joinpath("simpliPFy/docs/source/general/about.rst")
rfp = projectRoot.joinpath("readme.rst")

def sub_process(cmdArgs: list[str]) -> Popen:
    useShell = True if os.name == "nt" else False
    if useShell:
        cmdArgs = " ".join(cmdArgs)

    return subprocess.Popen(cmdArgs,
                               shell=useShell,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT)


def buildDocs():
    curDir = os.getcwd()
    # change into the directory of this script, all links are relative to .../Inskale/Pyodide/Scripts/cli
    os.chdir(Path(__file__).parent)

    # Building python API documentation
    print("building python API documentation...")
    process = sub_process(["sphinx-apidoc", "-f", "-o", pdfp.as_posix(), spfp.as_posix()])
    # Print output line by line
    line = ""
    for line in process.stdout:
        print(line, end="\n")
    process.wait()

    if os.path.isdir(fdfp) and not line:
        print("build of python API documentation succeeded!\n")
    else:
        print("\n\ncheck output on console it was not expected that sphinx-apidoc generates output to the console\n")

    # Arguments mimic the command line
    # Example: sphinx-build -b html source_dir build_dir
    processArgs = [
        '-b', 'html',  # builder (html, latex, etc.)
        pdfp.as_posix(),  # source directory
        pdbfp.as_posix()  # output directory
    ]

    # Run Sphinx build
    print("building python documentation...")
    status = build_main(processArgs)
    if status == 0:
        print("Sphinx build succeeded!\n")
    else:
        print(f"Sphinx build failed with code {status}\n")

    # check if frontend folder exists, remove and or create
    if os.path.isdir(fdfp):
        rmtree(fdfp)

    # npx typedoc --options simpliPFy/docs/typedoc.json --skipErrorChecking
    print("building frontend API documentation...")
    process = sub_process(['npx', 'typedoc', '--options', tdcp.as_posix(), "--skipErrorChecking"])
    # Print output line by line
    line = ""
    for line in process.stdout:
        print(line.decode("utf-8", errors="ignore"), end="\n")
    process.wait()

    isGeneratedInfo = bool(re.search(r"(?P<isExpectedOutput>\[info\].*html generated at)", str(line)))
    if os.path.isdir(fdfp) and isGeneratedInfo:
        print("build of frontend API documentation succeeded!\n")
    else:
        print("\n\ncheck output on console it was not expected that typedoc generates output to the console\n")

    # check if frontend folder exists, remove if exists
    if os.path.isdir(fdbfp):
        rmtree(fdbfp)

    # copy frontendAPI into python doc
    copytree(fdfp, fdbfp)

    # copy about.rst in the main folder as readme.rst to avoid differences between those two files
    copy(afp, rfp)
    print("updated readme.rst")

    os.chdir(curDir)

def uploadDocs():
    ev = EnvVars()
    ftp = simFTP.connect_ftp(ev.server, ev.user, ev.password)
    simFTP.rmdir(ftp, ev.docsFolder)
    ftp.mkd(ev.docsFolder)
    src = Path(__file__).parents[3].joinpath("simpliPFy", "docs", "_build")
    dst = Path(ev.docsFolder)
    simFTP.uploadFiles(ftp, src, dst)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Simplify Sphinx documentation')
    parser.add_argument("--upload", action="store_true", help="Upload the documentation to simplipfy server")
    args = parser.parse_args()

    buildDocs()

    if args.upload:
        uploadDocs()
