import os

from lcapyInskale import Circuit
from simplipfy.Helpers.impedanceConverter import FileToImpedance
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.solution import Solution
from simplipfy.Svg.drawingConfig import drawing_config_instance


def solve(filename: str, filePath="Circuits/", savePath="Solutions/", langSymbols: dict = {}):
    """
    :param filename: name of the file to be solved, with extension
    :param filePath: path to the file
    :param savePath: path to the folder where the solution will be saved
    :param langSymbols: dictionary of language symbols, used to initialize a LangSymbols object
    """
    langSym = LangSymbols(langSymbols)

    cct = Circuit(FileToImpedance(os.path.join(filePath, filename)))
    isGeneralized = drawing_config_instance.generalize
    cct.namer.reset()
    steps = cct.simplify_stepwise()
    sol = Solution(steps, langSym, isGeneralized)
    sol.draw(path=savePath, filename=filename)
    sol.exportAsJsonFiles(path=savePath, filename=filename)