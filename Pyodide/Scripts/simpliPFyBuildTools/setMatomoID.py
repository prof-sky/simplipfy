from enum import Enum
from pathlib import Path
import os
class MatomoID(Enum):
    simplipfy = 1
    dev = 2
    gitHub = 3

def setMatomoID(target: str):
    path = Path(__file__).parents[2].joinpath("dist", "src", "scripts", "utils", "utils.bundle.js")
    if not os.path.isfile(path):
        raise FileNotFoundError(f"utils.bundle.js file not found at {path}, build a distribution first with: generateSVGFiles.py, zipFolder.py, createBundles.py, makeDist.py")
    f = open(path, "r+")
    content = f.read()
    newID = '"setSiteId", "' + str(MatomoID[target].value) + '"'
    content = content.replace('"setSiteId", "2"', newID)
    f.seek(0)
    f.write(content)
    f.truncate()
    f.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=["dev", "simplipfy", "gitHub"], default="dev")
    args = parser.parse_args()
    setMatomoID(args.target)