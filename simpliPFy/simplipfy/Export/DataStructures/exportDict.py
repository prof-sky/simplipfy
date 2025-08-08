import os
from json import dump as jdump
from typing import TYPE_CHECKING

from lcapyInskale.componentRelation import ComponentRelation

if TYPE_CHECKING:
    pass


class ExportDictBase(dict):
    save_path = ""
    file_name = ""
    """
    Base class for all export dicts. Handles save to file to create json and svg files.
    
    .. note::
        The difference between ExportDict and DictExport
        * ExportDict is a modified Dictionary to hold data
        * DictExport is the class that populates an ExportDict with data for the frontend
    """
    @classmethod
    def set_paths(cls, savePath, fileName):
        cls.save_path = savePath
        cls.file_name = fileName

    def toFiles(self, savePath=None, fileName=None) -> tuple[bool, str, str]:
        if not self["step"] or not self["svgData"]:
            return False, "", ""

        return True, self.toJSON(savePath, fileName), self.toSVG(savePath, fileName)

    def toSVG(self, savePath=None, fileName=None) -> str:
        """
        Saves the export dict to a svg file. The file is saved in the format <filename>_<step>.json
        :param savePath: path to save the file to, defaults to self.save_path
        :param fileName: name of the saved file, defaults to self.file_name
        :returns: path to the saved file
        """
        savePath = savePath if savePath else self.save_path
        fileName = fileName if fileName else self.file_name

        step = self["step"]
        fileName = os.path.splitext(fileName)[0]
        svgFilePath = os.path.join(savePath, fileName) + "_" + step + ".svg"
        svgFile = open(svgFilePath, "w", encoding="utf8")
        svgFile.write(self["svgData"])
        svgFile.close()

        return svgFilePath

    def toJSON(self, savePath=None, fileName=None) -> str:
        """
        Saves the export dict to a json file. The file is saved in the format <filename>_<step>.json
        :param savePath: path to save the file to, defaults to self.save_path
        :param fileName: name of the saved file, defaults to self.file_name
        :returns: path to the saved file
        """
        savePath = savePath if savePath else self.save_path
        fileName = fileName if fileName else self.file_name

        step = self["step"]
        fileName = os.path.splitext(fileName)[0]
        jsonFilePath = os.path.join(savePath, fileName) + "_" + step + ".json"
        with open(jsonFilePath, "w", encoding="utf-8") as f:
            jdump(self, f, ensure_ascii=False, indent=4)

        return jsonFilePath

class CptExportDict(dict):
    """
    Dict that holds the data of one component and is used in classes derived from ExportDictBase
    """
    def __init__(self, rName: str, uName: str, iName: str, zImpedance, cpxVal, re, im, phase, zVal, uVal, uPhase, iVal,
                  iPhase, hasConversion: bool):
        super().__init__()
        self["Z"] = {"name": rName, "impedance": zImpedance, "cpxVal": cpxVal, "re": re, "im": im, "phase": phase,
              "val": zVal}
        self["U"] = {"name": uName, "val": uVal, "phase": uPhase}
        self["I"] = {"name": iName, "val": iVal, "phase": iPhase}
        self["hasConversion"] = hasConversion

class EmptyCptExportDict(CptExportDict):
    """
    Dict that holds the data of one empty component and is used in classes derived from ExportDictBase
    """
    def __init__(self):
        super().__init__(None, None, None, None, None, None, None,
                         None, None, None, None, None, None, False)

class Step0ExportDictSource(dict):
    """
    Dict that holds the data of one source and is used in classes derived from ExportDictBase
    """
    def __init__(self, sourceType: str, omega_0: str, frequency: str, val: CptExportDict):
        """
        :param sourceType: type of the source (V or I)
        :param omega_0: angular frequency in rad/s as latex str with prefix
        :param frequency: frequency in Hz as latex str with. (omega_0/(2*pi) can't be calculated internally omega_0 is a str
        """
        super().__init__()
        self["Type"] = sourceType
        self["omega_0"] = omega_0
        self["frequency"] = frequency
        self.update(val)

class Step0ExportDict(ExportDictBase):
    """
    Export dict that holds the data of step0 and is used in DictExport class
    """
    def __init__(self, step, sources: list[Step0ExportDictSource], allCpts: list['DictExportElement'],
                 circuitType: str, svgData: str):
        super().__init__()
        self["step"] = step
        self["sources"] = sources
        self["allComponents"] = allCpts
        self["componentTypes"] = circuitType
        self["svgData"] = svgData

class ExportDict(ExportDictBase):
    """
    Export dict that holds the data of step<n> where n>0 and is used in DictExport class
    """
    def __init__(self, step: str, canBeSimplified: bool, simplifiedTo: dict,
                   componentsRelation: ComponentRelation, svgData: str,
                   cpts: list[CptExportDict], allCpts: list[CptExportDict]):
        super().__init__()
        self["step"] = step
        self["canBeSimplified"] = canBeSimplified
        self["simplifiedTo"] = simplifiedTo
        self["componentsRelation"] = componentsRelation.to_string()
        self["components"] = cpts
        self["allComponents"] = allCpts
        self["svgData"] = svgData

class EmptyExportDict(ExportDict):
    """
    Export dict that holds the data of an empty step<n> where n>0, and is used in DictExport class
    """
    def __init__(self):
        super().__init__(None, False, EmptyCptExportDict(), ComponentRelation.none, None,
                         [], [])