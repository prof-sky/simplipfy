import sympy.functions.elementary.complexes

from lcapy import NetlistLine
import sympy as sp


def ComponentToImpedance(netlistLine: str,
                         skipElementTypes=None,
                         replaceElementType=None,
                         replaceValueWith=None,
                         debug=False
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
        return netLine.line + "\n"

    if netLine.type in list(replaceElementType.keys()):
        netLine.value = '{'+replaceValueWith[netLine.type].replace("value", netLine.value)+'}'
        netLine.type = replaceElementType[netLine.type]

    newLine = netLine.reconstruct()

    if debug:
        print(f"{netlistLine} -> {newLine}")

    return newLine + "\n"


def ImpedanceToComponent(netlistLine: str):
    from lcapy import j
    netLine = NetlistLine(netlistLine)
    value = sp.parse_expr(netLine.value, local_dict={'omega_0': 1, 'j': sp.I})
    freeSymbols = value.free_symbols

    if len(freeSymbols) > 1:
        raise AttributeError(f"Too many free symbols in {value}, free symbols: {freeSymbols}")

    sub_dict = {}
    for freeSymbol in freeSymbols:
        sub_dict[str(freeSymbol)] = sp.Symbol(str(freeSymbol), finite=True, real=True, positive=True)

    value = value.subs(sub_dict)
    # ToDo potential errors with floating point comparison with 0
    if sp.re(value) == 0:
        if sp.im(value) > 0:
            netLine.value = sp.im(value)
            netLine.type = "L"
            print(f"Inductor: {netLine.value} H")
        elif sp.im(value) < 0:
            netLine.value = -1/sp.im(value)
            netLine.type = "C"
            print(f"Capacitor: {netLine.value} F")
    elif sp.im(value) == 0:
        netLine.value = sp.re(value)
        netLine.type = "R"
        print(f"Resistor: {netLine.value} Ohm")
    else:
        print("Impedance")

    print(f"Netlist Line: {netLine.reconstruct()}")


def FileToImpedance(filename: str) -> str:
    """
    Converts a netlist file that has a mixture of R L C elements to Z (impedance)
    Only converts Files that have a mixture of R L C elements
    :param filename: filename to open, with path
    :return: converted netlist as str
    """
    netlistString = open(filename, "r").read()
    netlist = netlistString.split("\n")
    if NeedsConversion(netlist):
        conv_netlist = ""
        for line in netlist:
            conv_netlist += ComponentToImpedance(line)

        return conv_netlist
    else:
        return netlistString


def StrToImpedance(netlist: str) -> str:
    conv_netlist = ""
    for line in netlist.split("\n"):
        conv_netlist += ComponentToImpedance(line)

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
