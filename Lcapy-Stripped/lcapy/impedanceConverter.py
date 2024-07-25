import sympy.functions.elementary.complexes

from lcapy import NetlistLine
from lcapy import j
from lcapy import omega0 as lcapy_omega0
from lcapy import state
import sympy as sp


def ComponentToImpedance(netlistLine: str,
                         omega_0: float = None,
                         skipElementTypes=None,
                         replaceElementType=None,
                         replaceValueWith=None,
                         debug=False,
                         newLine=False
                         ) -> str:
    """
    Converts the value in {} of Elements specified in replaceElementType to the given Value in the Dict.
    For the conversion it writes into the {} the value specifies in replaceValueWith. Where <value> gets replaces with
    the original value. E.g
    line = C2 5 6 {100}; down
    skipElementTypes = ["V", "W"]
    replaceElementType = {"R": "Z", "L": "Z", "C": "Z"}
    replaceValueWith = {"R": "value", "L": "j*value*omega_0", "C": "-j/(value*omega_0)"}

    returns ZC2 5 6 {-j/(100*omega_0}; down
    """
    if skipElementTypes is None:
        skipElementTypes = ["V", "W"]
    if replaceElementType is None:
        replaceElementType = {"R": "Z", "L": "Z", "C": "Z"}
    if replaceValueWith is None:
        replaceValueWith = {"R": "value", "L": "j*value*omega_0", "C": "-j/(value*omega_0)"}

    netLine = NetlistLine(netlistLine, validate=True)

    if omega_0 is not None:
        _omega_0 = omega_0
    else:
        _omega_0 = lcapy_omega0

    if netLine.type in skipElementTypes:
        returnVal = netLine.line
    elif netLine.type in list(replaceElementType.keys()):
        state.show_units = False

        expr = replaceValueWith[netLine.type]
        parsedVal = sp.parse_expr(netLine.value)
        netLine.value = '{'+str(sp.parse_expr(expr, {"value": parsedVal, "omega_0": _omega_0, "j": j}))+'}'

        netLine.type = replaceElementType[netLine.type]
        returnVal = netLine.reconstruct()
    else:
        returnVal = netLine.line

    if debug:
        print(f"{netlistLine} -> {returnVal}")

    if newLine:
        return returnVal + "\n"
    else:
        return returnVal


def ImpedanceToComponent(strNetlistLine: str = None, netlistLine: NetlistLine = None) -> str:
    """
    Takes a strNetlistLine (Z1 4 5 {R1}; down) or NetlistLine() created from a strNetlistLine and converts it to its
    corresponding Component (R, L, or C) if it is not possible it returns the input strNetlistLine
    :param strNetlistLine a line of a lcapy.Circuit.netlist() string
    :param netlistLine an Object from lcapy.netlistLine.NetlistLine(), created from strNetlistLine
    :return strNetlistLine (str)
    """

    if netlistLine:
        netLine = netlistLine
    elif strNetlistLine:
        netLine = NetlistLine(strNetlistLine)
    else:
        raise AttributeError("strNetlistLine or netlistLine need a value")

    netLine.value, netLine.type = ValueToComponent(netLine.value)

    return netLine.reconstruct()


def ValueToComponent(value, omega_0: float = None) -> (sp.Mul, str):
    # ToDo omega_0 shall not be assumed to be 1 instead shall be circuit value
    if omega_0 is not None:
        _omega_0 = omega_0
    else:
        _omega_0 = lcapy_omega0

    _value = sp.parse_expr(value, local_dict={'omega_0': _omega_0, 'j': j})
    if _value == sp.zoo and _omega_0 == 0:
        return _value, "C"
    # if there is a resistor with 0 ohms and omega_0 is also 0 this gives back an inductor instead of a resistor
    elif _value == 0 and _omega_0 == 0:
        return _value, "L"

    freeSymbols = _value.free_symbols - {_omega_0}

    if len(freeSymbols) > 1:
        raise AttributeError(f"Too many free symbols in {_value}, free symbols: {freeSymbols}")

    sub_dict = {}
    for freeSymbol in freeSymbols:
        sub_dict[str(freeSymbol)] = sp.Symbol(str(freeSymbol), finite=True, real=True, positive=True)

    # using the sp.im(_value) funktion equals _value/j
    _value = _value.subs(sub_dict)
    if sp.re(_value) == 0:
        if sp.im(_value) > 0:
            returnVal = sp.im(_value) / _omega_0
            returnType = "L"
        elif sp.im(_value) < 0:
            returnVal = -1 / (sp.im(_value) * _omega_0)
            returnType = "C"
    elif sp.im(_value) == 0:
        returnVal = sp.re(_value)
        returnType = "R"
    else:
        returnVal = value
        returnType = "Z"

    return returnVal, returnType


def FileToImpedance(filename: str) -> str:
    """
    Converts a netlist file that has a mixture of R L C elements to Z (impedance)
    Only converts Files that have a mixture of R L C elements
    :param filename: filename to open, with path
    :return: converted netlist as str
    """
    netlistString = open(filename, "r").read()
    netlist = netlistString.split("\n")
    conv_netlist = ""
    for line in netlist:
        conv_netlist += ComponentToImpedance(line, newLine=True)

    return conv_netlist


def StrToImpedance(netlist: str) -> str:
    conv_netlist = ""
    for line in netlist.split("\n"):
        conv_netlist += ComponentToImpedance(line, newLine=True)

    return conv_netlist


def NeedsConversion(netlist: [str], checkForTypes=None) -> bool:
    # define types that are relevant
    if checkForTypes is None:
        checkForTypes = ["R", "L", "C"]

    # create a variable for each relevant type
    hasType = {}
    for elType in checkForTypes:
        hasType[elType] = False

    for line in netlist:
        netLine = NetlistLine(line)
        if netLine.type in checkForTypes and not hasType[netLine.type]:
            hasType[netLine.type] = True

    return bool(sum(hasType.values())-1)
