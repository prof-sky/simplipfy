from pathlib import Path
from rjsmin import jsmin
import fnmatch

project_root = Path(__file__).parents[3]

def minifyJSFiles(src: Path,
                  exclude_patterns: tuple | list = ("*/extern/*", "*/definitions/*", "*/docs/*", "*/languages/*")):
    allFiles = list(src.glob("**/*.js"))

    filteredFiles = [
        f for f in allFiles
        if not any(fnmatch.fnmatch(str(f), pat) for pat in exclude_patterns)
    ]
    beforeSize = 0
    afterSize = 0
    for file in filteredFiles:
        beforeSize += file.stat().st_size
        with open(file, "r+", encoding="utf-8") as f:
            content = jsmin(f.read())
            f.seek(0)
            f.write(content)
            f.truncate()
        afterSize += file.stat().st_size
        print(f"minified {file}")

    if not filteredFiles:
        print(f"noting to minify in: {src}")
        return

    print(f"On average compressed by {(1 - afterSize / beforeSize) * 100:.2f}%")

if __name__ == "__main__":
    mainFolder = project_root/"Pyodide/dist/src"
    src1 = mainFolder.joinpath("pages")
    src2 = mainFolder.joinpath("scripts")
    minifyJSFiles(src1)
    minifyJSFiles(src2)