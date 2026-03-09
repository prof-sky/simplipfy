from .checkLanguages import SupportedLangs
import re
from pathlib import Path
import os
from simplipfy.Tools.printColored import cPrint
import argparse
from pycountry import languages

project_root = Path(__file__).parents[3]

def getFileKeysAndValues(file: Path):
    if not file.is_file():
        return {}
    fileContent = open(file, "r", encoding="utf-8").read()

    pattern = re.compile(
        r'^\s*([a-zA-Z_]\w*)\s*:\s*\n?\s*"([^"]*)"',
        re.MULTILINE
    )

    pairs = {}
    for m in pattern.finditer(fileContent):
        pairs[m.group(1)] = m.group(2)

    return pairs

def generateNewLang(newLang: str, langFolder: Path | None = None, mainLang: SupportedLangs = "en", override=False):
    if langFolder is None:
        langFolder = project_root/"Pyodide/src/scripts/languages"

    try:
        cpv = languages.get(alpha_2=newLang)
    except KeyError:
        raise KeyError(f"Unknown language: {newLang}")

    newLangFullName = cpv.name.lower()
    mainLangFullName = languages.get(alpha_2=mainLang).name.lower()

    pattern = re.compile(
        r'^(.*) ?= ?{',
        re.MULTILINE
    )

    mainLangFolder = langFolder/mainLang
    mainLangFiles = mainLangFolder.glob("**/*.js")
    for file in mainLangFiles:
        pairs = getFileKeysAndValues(file)
        text = file.read_text(encoding="utf-8")
        objName = next(pattern.finditer(text))

        if objName is None or not objName.group(1):
            raise RuntimeError(f"Could not find Object name in {file.as_posix()}")

        newFile = Path(file.as_posix().replace(f"/{mainLang}/", f"/{newLang}/").replace(f".{mainLang}.", f".{newLang}."))
        os.makedirs(file.parent.as_posix().replace(f"/{mainLang}/", f"/{newLang}/").replace(f"/{mainLang}", f"/{newLang}"), exist_ok=True)

        if not override and newFile.is_file():
            continue

        oldIdentifier = mainLang[0].upper()+mainLang[1:]
        newIdentifier = newLang[0].upper()+newLang[1:]
        if file.name == f"lang.{mainLang}.js":
            text = file.read_text()
            text = text.replace(oldIdentifier, newIdentifier).replace(mainLangFullName, newLangFullName)
            newFile.write_text(text)
            print(f"created {newFile.relative_to(langFolder)}")
            continue

        with open(Path(newFile), "w", encoding="utf-8") as f:
            f.write(f"{objName.group(1).replace(oldIdentifier, newIdentifier)}" + "= {\n")
            for langKey in pairs.keys():
                f.write(f"\t{langKey}:\n\t\t\"{pairs[langKey]}\",\n")
            f.write("}")

        print(f"created {newFile.relative_to(langFolder)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--newLang", "-n", required=True,
                        help="Short name for the new language, should be 2 characters long, e.g. en, de, fr...")
    parser.add_argument("--override", "-o", action="store_true",
                        help="Override existing language files, if they exists, else create a new one")
    args = parser.parse_args()

    generateNewLang(args.newLang, args.newLangFullName, override=args.override)


