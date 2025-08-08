from re import finditer
from warnings import warn

from generalizeNetlistDrawing.backends.positions import Optimize


class Option:
    """
    Class to represent an option for the drawing config.
    Wrapper for the name and value of the option after parsing with DrawingConfig.parseString()
    """
    def __init__(self, name: str, value: str):
        """
        :param name: name of the option
        :param value: value of the option
        """
        self.name = name.lower()
        self.value = value.lower()


class DrawingConfig:
    """
    Singleton class to manage drawing options for the schematic drawing.

    Available options are:

    * --generalize-<value> -> sets generalize to <value> (true/false): draws a generalized schematic
    * --optimize-<value> -> sets optimize to <value> (mobile/desktop/none): draws a generalized schematic, and rotates it to
      fit eighter mobile or desktop screens better. If optimize is set to none, the schematic is not rotated.

    .. note::
        If you want to add an option:

        * Create a function named `_<optionName>` within the class.
            The function signature should be:

            ::

                def _option<Name>(self, option: Option):

            Inside this function, you should implement the logic:

            ::

                if option.name == "<optionName":
                    if option.value == ...:
                        DrawingConfig._showNodes = ...
                    elif option.value == ...:
                        DrawingConfig._showNodes = ...
                    else:
                        raise RuntimeError(f"Unknown <optionName> value: {option.value}, option not changed")

        * add _<optionName> to class variables
        * add getter function:

            ::

                @property
                def <optionName>(self) -> <type>:
                    return self._<optionName>
        * add it to self._setOptionFns in self.__new__
        * add it to self.saveOptions()
        * add it to self.setToDefault()
    """

    _instance = None
    _setOptionFns = []
    _locked = False
    _generalize = False
    _optimize = Optimize.NONE
    _showNodes = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._setOptionFns = [cls._optionGeneralize, cls._optionOptimize, cls._optionShowNodes]

        return cls._instance

    @property
    def generalize(self) -> bool:
        """
        :returns: True if generalize is set, else False

        Generalizes the schematic drawing. This means that the drawing emphasizes to highlight series and parallel
        relations between components. No wires are needed in the netlist for this to work but won't break if they are
        present.
        """
        return DrawingConfig._generalize

    @property
    def optimize(self) -> Optimize:
        """
        :returns: Optimize enum value currently set for self.optimize

        Depends on self.generalize being set to True.
        Optimize is an enum with the following values:

        * Optimize.NONE: no optimization
        * Optimize.MOBILE: optimize for mobile -> rotates the schematic to fit mobile screens better
        * Optimize.DESKTOP: optimize for desktop -> rotates the schematic to fit desktop screens better
        """
        return DrawingConfig._optimize

    @property
    def showNodes(self) -> bool:
        """
        :returns: True if showNodes is set, else False

        Show nodes adds each node that is in the netlist to the drawing with its node number.
        """
        return DrawingConfig._showNodes

    def lock(self, on:str = None):
        """
        :param on: Calls setOptions with on string to set options before locking the config
        :returns: None

        Lock the drawing config. This prevents any changes to the config.
        """
        if on: self.setOptions(on)
        DrawingConfig._locked = True

    def unlock(self, setTo:str = None):
        """
        :param setTo: Calls setOptions with set string to set options after unlocking the config
        :returns: None

        Unlock the drawing config. Reverts self.lock().
        """
        DrawingConfig._locked = False
        if setTo: self.setOptions(setTo)

    @staticmethod
    def isLocked() -> bool:
        """
        :returns: True if the drawing config is locked, else False

        If the drawing config is locked, no changes can be made to the config.
        All calls to functions that would change the config will be ignored.
        """
        return DrawingConfig._locked

    @staticmethod
    def saveOptions() -> list[Option]:
        """
        :returns: list of all options and their values

        The return value of this function can be loaded with self.loadOptions
        """
        return [
        Option("generalize", str(DrawingConfig._generalize)),
        Option("optimize", str(DrawingConfig._optimize.value)),
        Option("shownodes", str(DrawingConfig._showNodes))
        ]

    def loadOptions(self, options: list[Option]) -> None:
        """
        :options: list of Options to load
        :returns: None

        load options from a list of Options
        """
        for option in options:
            self._setOption(option)

    @staticmethod
    def parseString(options: str, reset=True) -> list[Option]:
        """
        :param reset: resets the options to its standard values
        :param options: string, --<optionName>-<value>
        :returns: list of object Option with the parsed options

        options string is not case sensitive

        .. note::
            The options string is parsed using regex. The format is:

            * --<optionName>-<value> -> value is set to <value>
            * --<optionName> -> value is set to true
            * --generalize -> sets generalize to True
            * --generalize-true -> sets generalize to True
            * --generalize-false -> sets generalize to False
            * --optimize-mobile -> sets optimize to Optimize.MOBILE and generalize to True
            * --optimize-desktop -> sets optimize to Optimize.DESKTOP and generalize to True
            * --optimize-none -> sets optimize to Optimize.NONE and does not change generalize
            * --generalize-false --optimize-none -> sets generalize to False and optimize to Optimize.NONE
        """
        if reset:
            drawing_config_instance.setToDefault()

        matches = finditer(r"--(?P<option>[^\s-]+)(?:-(?P<value>[^\s]+))?", options)

        options: list[Option] = []
        for match in matches:
            name = match.group("option")
            value = "true" if match.group("value") is None else match.group("value")
            options.append(Option(name, value))

        return options

    def setOptions(self, optionStr: str, reset=True) -> None:
        """
        :param reset: resets all options before parsing the string
        :param optionStr: see self.parseString for details
        :returns: None

        Sets options parsed from a string using self.parseString
        """
        parsedOptions: list[Option] = self.parseString(optionStr, reset=reset)
        for option in parsedOptions:
            self._setOption(option)

    def _optionGeneralize(self, option: Option) -> None:
        """
        :param option: Option class
        :returns: None

        checks if the option given into this function is "generalize" and sets the value if it is, else does nothing
        """
        if option.name == "generalize":
            if option.value == "true":
                DrawingConfig._generalize = True
            elif option.value == "false":
                DrawingConfig._generalize = False
            else:
                warn(f"Unknown generalize value: {option.value}, option not changed")

    def _optionOptimize(self, option: Option) -> None:
        """
        :param option: Option class
        :returns: None

        checks if the option given into this function is "optimize" and sets the value if it is, else does nothing
        """
        if option.name == "optimize":
            value = option.value
            try:
                if not DrawingConfig._generalize:
                    warn("Optimize needs generalize to be set to True, option not changed")
                    return
                value = None if value == "none" else value
                DrawingConfig._optimize = Optimize(value)
            except:
                warn(f"Unknown optimize value: {value}, option Optimize not changed")

    def _optionShowNodes(self, option: Option) -> None:
        """
        :param option: Option class
        :returns: None

        checks if the option given into this function is "shownodes" and sets the value if it is, else does nothing
        """
        if option.name == "shownodes":
            if option.value == "true":
                DrawingConfig._showNodes = True
            elif option.value == "false":
                DrawingConfig._showNodes = False
            else:
                warn(f"Unknown shownodes value: {option.value}, option not changed")

    def _setOption(self, option:Option) -> None:
        """
        :param option: Option class object with name and value
        :returns: None

        Set the option in the drawing config
        """
        if DrawingConfig._locked: return
        for setOptFn in self._setOptionFns:
            setOptFn(self, option)

    @staticmethod
    def setToDefault() -> None:
        """
        :returns: None

        sets the following values:

        * generalize = False
        * optimize = Optimize.NONE

        does not work when locked
        """
        DrawingConfig._generalize = False
        DrawingConfig._optimize = Optimize.NONE
        DrawingConfig._showNodes = False

drawing_config_instance = DrawingConfig()