from typing import Dict


class LangSymbols:
    """
    This class is used to define some language-specific symbols used in text, equations and labels (e.g., voltage
    across R1 in German U1 in English V1)
    """
    def __init__(self, args: Dict[str, str] = {}):
        """
        Values to set:

        * volt -> which symbol is used for voltages usually V or U; default U
        * total -> which text is used for a total current usually tot or ges; default ges
        """
        self.volt = args.get('volt', 'U')
        self.total = args.get('total', 'ges')

        for key in args.keys():
            if not hasattr(self, key):
                if args[key] is not str:
                    self.__setattr__(key, args[key])
                else:
                    self.__setattr__(key, str(key))
