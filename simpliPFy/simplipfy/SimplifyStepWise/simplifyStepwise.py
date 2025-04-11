import os

from lcapyInskale import Circuit
from simplipfy.impedanceConverter import FileToImpedance
from simplipfy.langSymbols import LangSymbols
from simplipfy.solution import Solution


def solve(filename: str, filePath="Circuits/", savePath="Solutions/", langSymbols: dict = {}):
    langSym = LangSymbols(langSymbols)

    cct = Circuit(FileToImpedance(os.path.join(filePath, filename)))
    cct.namer.reset()
    steps = cct.simplify_stepwise()
    sol = Solution(steps, langSymbols=langSym)
    sol.draw(path=savePath, filename=filename)
    sol.exportAsJsonFiles(path=savePath, filename=filename)