from pathlib import Path
from typing import Literal
import re

from simplipfy.Tools.printColored import cPrint

project_root = Path(__file__).parents[3]
SupportedLangs = Literal["en", "de"]

def removeLangName(langPath, key) -> list[str]:
    paths: list[Path] = list(langPath.glob("**/*.js"))
    return [path.as_posix().replace(f".{key}.", ".<lang>.").replace(f"/{key}/", "/<lang>/") for path in paths]

def filesMissing(langs: dict[str, Path], keys, mainLang: SupportedLangs, raiseError=True) -> tuple[bool, list[str]]:
    missingFiles = {}
    filesInMain = removeLangName(langs[mainLang], mainLang)
    setFilesInMain = set(filesInMain)

    for key in keys:
        diffSet = setFilesInMain - set(removeLangName(langs[key], key))
        if diffSet:
            missingFiles[key] = diffSet

    errorPrinted = False
    if missingFiles.keys():
        error = ""
        for key in missingFiles:
            error += f"Missing files in language {key}:\n"
            for file in missingFiles[key]:
                error += f"\t{file.replace('<lang>',key)}\n"
            error += "you can generate the missing files with:\n"
            error += f"\tsimplipfy language build {key}"

        if error:
            error += "\n"
            errorPrinted = True
            cPrint(error)
            if raiseError:
                raise FileNotFoundError("Missing file(s) in language(s)")


    return errorPrinted, filesInMain

def getFileKeys(file: Path):
    if not file.is_file():
        return []
    fileContent = open(file, "r", encoding="utf-8").read()

    pattern = re.compile(
        r'^\s*([a-zA-Z_]\w*)\s*:',
        re.MULTILINE
    )

    keys = []
    for m in pattern.finditer(fileContent):
        keys.append(m.group(1))

    return keys

def keysMissing(keys, mainLang: SupportedLangs, files, raiseError=True) -> tuple[bool, dict[str, list]]:
    missingKeys: dict[str, list] = {}
    keys = [key for key in keys if key != mainLang]

    for file in files:
        mainKeys = getFileKeys(Path(file.replace("<lang>", mainLang)))

        for key in keys:
            langFile = Path(file.replace("<lang>", key))
            langKeys = getFileKeys(langFile)
            langMissingKeys = set(mainKeys) - set(langKeys)
            if langMissingKeys:
                missingKeys[key] = [langFile.as_posix(), list(langMissingKeys)]

    errorPrinted = False
    if missingKeys.keys():
        error = ""
        for lang in missingKeys:
            error += f"Missing key(s) in language {lang}:\n"
            error += f"{missingKeys[lang][0]}\n"
            for key in missingKeys[lang][1]:
                error += f"\t{key}\n"

        if error:
            cPrint(error)
            errorPrinted = True
            if raiseError:
                raise KeyError("Some keys are missing in language file(s)")


    return errorPrinted, missingKeys

def checkLanguages(langFolder: Path | None = None, mainLang: SupportedLangs = "en", raiseError=True):
    if langFolder is None:
        langFolder = project_root.joinpath("Pyodide/src/scripts/languages")

    langFolders = [folder for folder in list(langFolder.glob("*")) if folder.is_dir()]
    langs: dict[str, Path] = {}
    for lang in langFolders:
        key = lang.as_posix().split("/")[-1]
        langs[key] = lang

    compareWith = [key for key in langs.keys() if key != mainLang]

    errorPrinted1, files = filesMissing(langs, compareWith, mainLang, raiseError)
    errorPrinted2, missingKeys = keysMissing(langs.keys(), mainLang, files, raiseError)

    if not errorPrinted1 and not errorPrinted2:
        print("No missing files or keys found")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--path", "-p", default=None, type=str, help="Path to folder containing language folders, from project root")
    parser.add_argument("--mainLang", "-l", default="en", type=str, help="Main language which the others are compared to", choices=("en", "de"))
    parser.add_argument("--raiseError", "-e", action="store_true", help="Raise error if differences are found, else only prints the error but continues")

    args = parser.parse_args()
    checkLanguages(args.path, args.mainLang, args.raiseError)