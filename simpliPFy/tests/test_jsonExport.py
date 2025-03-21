import os
import shutil

from simpliPFy import solve
import json
from lcapy import Circuit
from lcapy.solution import Solution
from simplipfy.langSymbols import LangSymbols
from simplipfy.impedanceConverter import FileToImpedance
from random import choices
from string import ascii_uppercase, digits

#not multithread save
class TestJsonExport:

    @staticmethod
    def removeDir(folderName: str = "tempTest"):
        if os.path.isdir(folderName):
            shutil.rmtree(folderName)

    @staticmethod
    def makeTestDir(folderName: str = "tempTest"):
        if not os.path.isdir(f".\\{folderName}"):
            os.mkdir(folderName)

    @staticmethod
    def randomDirName(length: int = 8) -> str:
        return ''.join(choices(ascii_uppercase + digits, k=length))

    @staticmethod
    def readJson(filePath):
        with open(filePath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data

    def helperJsonExportCircuitInfo(self, fileName: str, savePath):
        sol = solve.SolveInUserOrder(fileName, filePath="Schematics", savePath=savePath)
        data = sol.createInitialStep()
        for key in ["step", "source", "allComponents", "componentTypes", "svgData"]:
            assert key in data.keys(), f"filename: {fileName} dataKey {key} is missing"

        sol.createInitialStep()

    def test_JasonExportCircuitInfo(self):
        dirName = self.randomDirName()
        self.makeTestDir(dirName)

        self.helperJsonExportCircuitInfo("R_parallel_dc", dirName)

        self.helperJsonExportCircuitInfo("R_parallel_ac", dirName)

        self.helperJsonExportCircuitInfo("L_parallel_ac", dirName)

        self.helperJsonExportCircuitInfo("C_parallel_ac", dirName)

        self.helperJsonExportCircuitInfo("Circuit_resistors_I", dirName)

        self.helperJsonExportCircuitInfo("RC_series_ac", dirName)
        self.removeDir(dirName)

    def helperJsonExport(self, fileName: str, filePath: str, savePath: str):
        cct = Circuit(FileToImpedance(os.path.join(filePath, fileName)))
        cct.namer.reset()
        steps = cct.simplify_stepwise()
        sol = Solution(steps, LangSymbols())

        for step in sol.available_steps[1::]:
            jsonFileName = sol.exportStepAsJson(step, path=savePath, filename=fileName)
            data = self.readJson(jsonFileName)
            for key in ["step", "canBeSimplified", "simplifiedTo", "componentsRelation",
                        "components", "svgData"]:
                assert key in data.keys(), f"filename: {jsonFileName} dataKey {key} is missing"

    def test_JsonExport(self):
        dirName = self.randomDirName()
        self.makeTestDir(dirName)
        self.helperJsonExport("C_parallel_ac", ".\\Schematics", dirName)
        self.helperJsonExport("R_parallel_ac", ".\\Schematics", dirName)
        self.helperJsonExport("L_parallel_ac", ".\\Schematics", dirName)
        self.helperJsonExport("CL_parallel_ac", ".\\Schematics", dirName)
        self.helperJsonExport("RL_parallel_ac", ".\\Schematics", dirName)
        self.helperJsonExport("C_series_ac", ".\\Schematics", dirName)
        self.helperJsonExport("R_series_ac", ".\\Schematics", dirName)
        self.helperJsonExport("L_series_ac", ".\\Schematics", dirName)
        self.helperJsonExport("CL_series_ac", ".\\Schematics", dirName)
        self.helperJsonExport("RL_series_ac", ".\\Schematics", dirName)
        self.removeDir(dirName)
