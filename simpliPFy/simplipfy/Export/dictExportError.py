from simplipfy.Export.dictExportSimpStep import DictExportBase
from simplipfy.Helpers.langSymbols import LangSymbols

class DictExportError(DictExportBase):
    """
    Is returned if lcapy throws an error during the simplification process. The error message is stored in the "error"
    field of the ExportDict. The frontend can then display this message to the user.
    """

    def __init__(self, error: Exception):
        super().__init__(precision=3, langSymbol=LangSymbols())
        self.error = True
        self.errorMessage = str(error)
