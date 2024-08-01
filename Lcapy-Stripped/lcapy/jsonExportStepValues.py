from typing import Union


class JsonExportStepValues:
    def __init__(self, name1, name2, newName,
                 relation,
                 value1, value2, result,
                 latexEquation,
                 convVal1, convVal2, convResult):
        self.name1: str = name1
        self.name2: str = name2
        self.newName: str = newName
        self.relation: str = relation
        self.value1: str = value1
        self.value2: str = value2
        self.result: str = result
        self.latexEquation: str = latexEquation
        self.convVal1: Union[str, None] = convVal1
        self.convVal2: Union[str, None] = convVal2
        self.convResult: Union[str, None] = convResult
        self.hasConversion: bool = bool(bool(convVal1) or bool(convVal2) or bool(convResult))

    def toDict(self):
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

