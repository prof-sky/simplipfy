# bump_version.py
import os

VERSION_FILE = "buildNum.info"
BASE_VERSION = "0.1."

def bump_version():
    if not os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "w") as f:
            f.write("-1")
    with open(VERSION_FILE, "r+") as f:
        current = int(f.read().strip())
        new = current + 1
        f.seek(0)
        f.write(str(new))
        f.truncate()
    return BASE_VERSION + str(new)

new_version = bump_version()
with open("simplipfy/__version__.py", "w") as f:
    f.write(f"__version__ = '{new_version}'\n")
print(f"Bumped to version: {new_version}")