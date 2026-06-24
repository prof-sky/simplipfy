from shutil import copytree

from cli.release import printHeading
from simpliPFyBuildTools.envVars import EnvVars
from cli.dockerQuickReleaseDev import dockerServerPath, dist

def copyToServer():
    envVars = EnvVars()
    folderName = envVars.commitSHA

    printHeading(f"Copying dist to docker server at /dev")
    copytree(dist, dockerServerPath/folderName, dirs_exist_ok=True)

    print("finished copying dist to docker server at /dev")

if __name__ == "__main__":
    copyToServer()