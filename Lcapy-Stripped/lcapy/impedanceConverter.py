import sympy.functions.elementary.complexes

import lcapy.netlistLine
from lcapy import NetlistLine
import sympy as sp


def ComponentToImpedance(netlistLine: str,
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

    if netLine.type in skipElementTypes:
        returnVal = netLine.line
    elif netLine.type in list(replaceElementType.keys()):
        netLine.value = '{'+replaceValueWith[netLine.type].replace("value", netLine.value)+'}'
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

    print(f"Netlist Line: {netLine.reconstruct()}")
    return netLine.reconstruct()


def ValueToComponent(value) -> (sp.Mul, str):

    # ToDo omega_0 shall not be assumed to be 1 instead shall be circuit value
    _value = sp.parse_expr(value, local_dict={'omega_0': 1, 'j': sp.I})

    freeSymbols = _value.free_symbols

    if len(freeSymbols) > 1:
        raise AttributeError(f"Too many free symbols in {_value}, free symbols: {freeSymbols}")

    sub_dict = {}
    for freeSymbol in freeSymbols:
        sub_dict[str(freeSymbol)] = sp.Symbol(str(freeSymbol), finite=True, real=True, positive=True)

    _value = _value.subs(sub_dict)
    if sp.re(_value) == 0:
        if sp.im(_value) > 0:
            returnVal = sp.im(_value)
            returnType = "L"
        elif sp.im(_value) < 0:
            returnVal = -1 / sp.im(_value)
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
    if True:
        conv_netlist = ""
        for line in netlist:
            conv_netlist += ComponentToImpedance(line, newLine=True)

        return conv_netlist
    else:
        return netlistString


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
