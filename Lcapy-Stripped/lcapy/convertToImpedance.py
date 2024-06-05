from lcapy import NetlistLine
def ConvertNetlistLine(line: str,
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
    replaceElementType = {"R": "ZR", "L": "ZL", "C": "ZC"}
    replaceValueWith = {"R": "value", "L": "j*value*omega_0", "C": "-j/(value*omega_0)"}

    returns ZC2 5 6 {-j/(100*omega_0}; down
    """
    if skipElementTypes is None:
        skipElementTypes = ["V", "W"]
    if replaceElementType is None:
        replaceElementType = {"R": "ZR", "L": "ZL", "C": "ZC"}
    if replaceValueWith is None:
        replaceValueWith = {"ZR": "value", "ZL": "j*value*omega_0", "ZC": "-j/(value*omega_0)"}

    netLine = NetlistLine(line, validate=True)

    if netLine.type in skipElementTypes:
        return netLine.line + "\n"

    if netLine.type in list(replaceElementType.keys()):
        netLine.type = replaceElementType[netLine.type]
        netLine.value = '{'+replaceValueWith[netLine.type].replace("value", netLine.value)+'}'

    newLine = netLine.reconstruct()

    if debug:
        print(f"{line} -> {newLine}")

    return newLine + "\n"


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
            conv_netlist += ConvertNetlistLine(line)

        return conv_netlist
    else:
        return netlistString


def StrToImpedance(netlist: str) -> str:
    conv_netlist = ""
    for line in netlist.split("\n"):
        conv_netlist += ConvertNetlistLine(line)

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
