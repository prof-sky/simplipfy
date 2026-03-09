from simpliPFyBuildTools import ftp as simFTP
from simpliPFyBuildTools.envVars import EnvVars
from pathlib import Path
from cli.buildBundles import create_bundles
from cli.makeDist import makeDist
from io import BytesIO
from simpliPFyBuildTools.createRedirectIndex import getRedirectIndex, getUpdateInProgress
from simpliPFyBuildTools.updateSecretsInHtaccess import updateSecretsInHtaccess
from simpliPFyBuildTools.zipFolder import zip_folder
from os.path import join
from cli.generateSVGFiles import SVGFileGenerator
from typing import Literal
from simpliPFyBuildTools.setMatomoID import setMatomoID
from simpliPFyBuildTools.minifyJSFiles import minifyJSFiles
from simpliPFyBuildTools.bumpVersion import VersionManager, versionChangeOpts, simplipfyFolder
from simpliPFyBuildTools.checkLanguages import checkLanguages
from warnings import warn

project_root = Path(__file__).parents[3]

from argparse import ArgumentParser
releaseParser = ArgumentParser()
releaseParser.add_argument("--target", choices=["dev", "simplipfy"],
                           help="action to perform\n" +
                         "dev: release to dev.simplipfy.org\n" +
                         "simplipfy: releases to www.simplipfy.org\n" +
                         "default is dev",
                           default="dev")

class Vars:
    def __init__(self, target: Literal["dev", "release"]):
        folder = ""
        if target == "dev":
            folder = "dev"
        elif target == "release":
            folder = "simplipfy"
        else:
            raise ValueError(f"Invalid target: {target}")

        self.target = target
        self.folder = folder

    def get(self) -> tuple[str, str]:
        return self.target, self.folder

def printHeading(heading: str):
    seperator = "##################################################"
    length = len(heading)
    filler = int(len(seperator) - length)
    lenA = int(filler / 2)
    lenB = int(filler / 2) + filler % 2
    fillerA = "".join([" " for x in range(0, lenA)])
    fillerB = "".join([" " for x in range(0, lenB)])

    text = seperator + "\n" + f"{fillerA}{heading}{fillerB}\n" + seperator
    print(text)

def makeRelease(target: Literal["dev", "simplipfy"], commit_sha=None, commit_tag=None):
    envVars = EnvVars(commitSHA=commit_sha, commitTag=commit_tag)
    if target == "dev" and commit_sha is None and commit_tag is not None:
        warn(f"Specify commit_sha for dev release, using saved env var: {envVars.commitSHA}")
    if target == "simplipfy" and commit_tag is None and commit_sha is not None:
        warn(f"Specify commit_tag for simplipfy release, using saved env var: {envVars.commitTag}")

    printHeading("Check Package hashes")

    vc: versionChangeOpts = "minor"
    if target == "simplipfy":
        vc: versionChangeOpts = "major"

    vm = VersionManager()
    error = [False, ""]
    if vm.simplipfy.hashChanged:
        print(f"simplipfy path: {vm.simplipfy.packageFolder}")
        print(f"saved hash: {vm.simplipfy.hash}")
        print(f"calc hash: {vm.simplipfy.calculateHash()}")
        error[0] = True
        error[1] += f"Hash of pacakge simplipfy changed rebuild package to proceed with release\n rebuild with: simplipfy build simplipfy --version-change {vc}\n"
    if vm.lcapyInskale.hashChanged:
        print(f"lcapy path: {vm.lcapyInskale.packageFolder}")
        print(f"saved hash: {vm.lcapyInskale.hash}")
        print(f"calc hash: {vm.lcapyInskale.calculateHash()}")
        error[0] = True
        error[1] += f"Hash of pacakge lcapy-inskale changed rebuild package to proceed with release\n rebuild with: simplipfy build lcapy-inskale --version-change {vc}\n"
    if vm.schemdrawInskale.hashChanged:
        print(f"schemdraw path: {vm.schemdrawInskale.packageFolder}")
        print(f"saved hash: {vm.schemdrawInskale.hash}")
        print(f"calc hash: {vm.schemdrawInskale.calculateHash()}")
        error[0] = True
        error[1] += f"Hash of pacakge schemdraw changed rebuild package to proceed with release\n rebuild with: simplipfy build schemdraw --version-change {vc}\n"
    if error[0]:
        raise RuntimeError("One or more packages outdated\n" + error[1])
    else:
        print("Packages up to date")

    printHeading("Check Languages")
    raiseError = True if target == "simplipfy" else False
    checkLanguages(raiseError=raiseError)

    printHeading("Connecting to FTP server")
    ftp = simFTP.connect_ftp(envVars.server, envVars.user, envVars.password)
    # overwrite index.html with updateInProgressHTML
    if target == "dev":
        # if target is release this step can be skipped,
        # the old release is still available so no need to update the index.html before updating
        # releases to simplipfy.org are saved and not deleted
        updateInProgressHTML = BytesIO(getUpdateInProgress().encode("utf-8"))
        ftp.storbinary(f"STOR {target}/index.html", updateInProgressHTML)
        folders = [join(envVars.devFolder, folderName) for folderName, info in ftp.mlsd(envVars.devFolder) if
                   info["type"] == "dir"]
        printHeading("Clearing /dev")
        for folderForRedirect in folders:
            simFTP.rmdir(ftp, folderForRedirect)


    if target == "simplipfy":
        foldersServer = [folderName for folderName, info in ftp.mlsd(envVars.simplipfyFolder) if info["type"] == "dir"]
        targetFolder = envVars.commitTag
        if targetFolder in foldersServer:
            print(f"Do you want to override {target}/{targetFolder} on {envVars.server}? y/n:")
            answer = input()
            if answer == "n":
                return
            updateInProgressHTML = BytesIO(getUpdateInProgress().encode("utf-8"))
            ftp.storbinary(f"STOR {target}/index.html", updateInProgressHTML)
            printHeading(f"Clearing /simplipfy/{targetFolder}")
            simFTP.rmdir(ftp, f"{target}/"+targetFolder)

    # make new release
    src = project_root/"Pyodide"
    dist = project_root/"Pyodide/dist"

    printHeading("Generating SVG files")
    SVGFileGenerator(src.joinpath("Circuits")).generateAllFiles()

    printHeading("Zip folder")
    zip_folder(src.joinpath("Circuits"))

    printHeading("Building Bundles")
    create_bundles(src.joinpath("src"))

    printHeading(f"Creating Distribution in: {dist}")
    makeDist(src, dist)

    printHeading("Updating .htaccess from dist")
    updateSecretsInHtaccess()

    if target != "dev":
        # for matomo tracking the id has to be adjusted default is 2 (dev.simplipfy.org)
        printHeading("Updating matomo tracking id")
        setMatomoID(target)

    if target == "simplipfy":
        printHeading("Minifying JS files")
        minifyJSFiles(dist.joinpath("src", "pages"))
        minifyJSFiles(dist.joinpath("src", "scripts"))

    # upload new release
    serverPath: Path
    if target == "dev":
        folderForRedirect = envVars.devFolder
        serverPath = Path(envVars.devFolder, envVars.commitSHA)
    elif target == "simplipfy":
        folderForRedirect = envVars.simplipfyFolder
        serverPath = Path(envVars.simplipfyFolder, envVars.commitTag)
    else:
        raise ValueError(f"Invalid target: {target}")

    printHeading(f"Uploading to /{target}")
    simFTP.uploadFiles(ftp, dist, serverPath)

    printHeading(f"Updating redirect to new version")
    folderName = envVars.getReleaseFolderName(target)
    redirectIndex = BytesIO(getRedirectIndex(folderName).encode("utf-8"))
    ftp.cwd(folderForRedirect)
    ftp.storbinary(f"STOR index.html", fp=redirectIndex)

    ftp.close()
    print("----- finished -----")

if __name__ == "__main__":

    args = releaseParser.parse_args()
    makeRelease(args.target)