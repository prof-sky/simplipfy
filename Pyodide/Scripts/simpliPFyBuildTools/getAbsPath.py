import os
from pathlib import Path

def getAbsPath(path: Path | str) -> Path:
    if os.path.isabs(path):
        return Path(path)

    else:
        return Path(os.path.join(os.getcwd(), path))