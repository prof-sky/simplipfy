import io


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
        replaceValueWith = {"R": "value", "L": "j*value*omega_0", "C": "-j/(value*omega_0)"}

    element = line[0:line.find(" ")]

    index = None
    for num in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]:
        curIndex = element.find(num)
        if curIndex != -1 and (not index or curIndex < index):
            index = curIndex

    elementNum = element[index::]
    elementType = element[0:index]

    if elementType in skipElementTypes:
        return line + "\n"
    else:
        info1 = line[line.find(" "):line.find("{")+1]
        value = line[line.find("{")+1:line.find("}")]
        info2 = line[line.find("}")::]

    reconstructedLine = element + info1 + value + info2
    if line != reconstructedLine:
        raise ValueError(f"Error parsing File:\n{line}\nand\n{reconstructedLine}")

    if elementType in list(replaceElementType.keys()):
        value = replaceValueWith[elementType].replace("value", value)
        elementType = replaceElementType[elementType]

    newLine = elementType + elementNum + info1 + value + info2

    if debug:
        print(f"{line} -> {newLine}")

    return newLine + "\n"


def ConvertNetlistFile(filename: str) -> str:
    netlist = open(filename, "r").read().split("\n")
    conv_netlist = ""
    for line in netlist:
        conv_netlist += ConvertNetlistLine(line)

    return conv_netlist
