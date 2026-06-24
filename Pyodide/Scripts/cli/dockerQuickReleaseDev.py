import os
import shutil

from simpliPFyBuildTools.envVars import EnvVars
from pathlib import Path
from cli.buildBundles import create_bundles
from cli.makeDist import makeDist
from simpliPFyBuildTools.createRedirectIndex import getRedirectIndex, getUpdateInProgress
from simpliPFyBuildTools.updateSecretsInHtaccess import updateSecretsInHtaccess
from simpliPFyBuildTools.zipFolder import zip_folder
from cli.generateSVGFiles import SVGFileGenerator
from simpliPFyBuildTools.setMatomoID import setMatomoID
from cli.release import printHeading, project_root
from shutil import copytree

from argparse import ArgumentParser
releaseParser = ArgumentParser()

src = project_root / "Pyodide"
dist = project_root / "Pyodide/dist"
dockerServerPath = Path("/var/www/html/dev")

def quickReleaseDev():
    # make new release


    with open(dockerServerPath/"index.html", "w") as rf:
        rf.seek(0)
        rf.write(getUpdateInProgress())
        rf.truncate()

    printHeading("Clearing /dev")
    dirList: list[str] = os.listdir(dockerServerPath)
    for entry in dirList:
        if os.path.isdir(entry) and entry not in [".", ".."]:
            print("removing: " + entry)
            shutil.rmtree(entry)

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

    # for matomo tracking the id has to be adjusted default is 2 (dev.simplipfy.org)
    printHeading("Updating matomo tracking id")
    setMatomoID("dev")

    # upload new release
    printHeading(f"Copying files to {dockerServerPath}")
    envVars = EnvVars()
    copytree(dist, dockerServerPath/envVars.commitSHA, dirs_exist_ok=True)

    printHeading(f"Updating redirect to new version")
    redirectFile = Path(dockerServerPath/"index.html")
    with open(redirectFile, "w") as rf:
        rf.seek(0)
        rf.write(getRedirectIndex(envVars.getReleaseFolderName("dev")))
        rf.truncate()

if __name__ == "__main__":
    quickReleaseDev()