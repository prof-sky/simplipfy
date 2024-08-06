from typing import Union
from lcapy.unitPrefixer import SIUnitPrefixer


class JsonExportStepValues:
    def __init__(self, name1, name2, newName,
                 relation,
                 value1, value2, result,
                 latexEquation,
                 convVal1, convVal2, convResult):

        prefixer = SIUnitPrefixer()

        self.name1: str = name1
        self.name2: str = name2
        self.newName: str = newName
        self.relation: str = relation
        self.value1: str = prefixer.getSIPrefixedValue(value1)
        self.value2: str = prefixer.getSIPrefixedValue(value2)
        self.result: str = prefixer.getSIPrefixedValue(result)
        self.latexEquation: str = latexEquation
        self.convVal1: Union[str, None] = prefixer.getSIPrefixedValue(convVal1)
        self.convVal2: Union[str, None] = prefixer.getSIPrefixedValue(convVal2)
        self.convResult: Union[str, None] = prefixer.getSIPrefixedValue(convResult)
        self.hasConversion: bool = bool(bool(convVal1) or bool(convVal2) or bool(convResult))

    def toDict(self) -> dict:
        return {
            "name1": self.name1,
            "name2": self.name2,
            "newName": self.newName,
            "relation": self.relation,
            "value1": self.value1,
            "value2": self.value2,
            "result": self.result,
            "latexEquation": self.latexEquation,
            "hasConversion": self.hasConversion,
            "convVal1": self.convVal1,
            "convVal2": self.convVal2,
            "convResult": self.convResult
        }

