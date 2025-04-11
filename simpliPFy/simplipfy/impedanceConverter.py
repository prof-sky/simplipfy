from typing import Union

import sympy as sp

import lcapyInskale
from lcapyInskale import Circuit
from lcapyInskale import j
from lcapyInskale import omega0 as lcapy_omega0
from lcapyInskale import state
from .netlistLine import NetlistLine


def ComponentToImpedance(netlistLine: str,
                         omega_0: Union[float, str] = None,
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

    returns Z2 5 6 {-j/(100*omega_0}; down
    """
    if skipElementTypes is None:
        skipElementTypes = ["V", "W"]
    if replaceElementType is None:
        replaceElementType = {"R": "Z", "L": "Z", "C": "Z"}
    if replaceValueWith is None:
        replaceValueWith = {"R": "value", "L": "j*value*omega_0", "C": "-j/(value*omega_0)"}

    netLine = NetlistLine(netlistLine, validate=True)

    if isinstance(omega_0, float):
        _omega_0 = omega_0
    elif isinstance(omega_0, str):
        _omega_0 = sp.parse_expr(omega_0, local_dict={"pi": sp.pi})
    else:
        _omega_0 = lcapy_omega0

    if netLine.type in skipElementTypes:
        returnVal = netLine.line
    elif netLine.type in list(replaceElementType.keys()):
        state.show_units = False

        expr = replaceValueWith[netLine.type]
        parsedVal = sp.parse_expr(netLine.value)
        parsedEx = sp.parse_expr(expr, {"value": parsedVal, "omega_0": _omega_0, "j": j})
        netLine.value = '{'+str(parsedEx)+'}'

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


def ImpedanceToComponent(strNetlistLine: str = None,
                         netlistLine: NetlistLine = None,
                         omega_0: Union[float, str] = None) -> str:
    """
    Takes a strNetlistLine (Z1 4 5 {R1}; down) or NetlistLine() created from a strNetlistLine and converts it to its
    corresponding Component (R, L, or C) if it is not possible it returns the input strNetlistLine
    :param strNetlistLine a line of a lcapy.Circuit.netlist() string
    :param netlistLine an Object from lcapy.netlistLine.NetlistLine(), created from strNetlistLine
    :param omega_0 is the circular frequency used for the conversion. If None, standard variable omega_0 is used. If string, sympy Symbol with string as name is created and used. If float, float value is used.
    :return: strNetlistLine (str); R1 4 5 100; down
    """

    if netlistLine:
        netLine = netlistLine
    elif strNetlistLine:
        netLine = NetlistLine(strNetlistLine)
    else:
        raise AttributeError("strNetlistLine or netlistLine need a value")

    netLine.value, netLine.type = ValueToComponent(netLine.value, omega_0=omega_0)

    return netLine.reconstruct()


def ValueToComponent(value, omega_0: Union[float, str] = None) -> (sp.Mul, str):

    if isinstance(omega_0, float):
        _omega_0 = omega_0

    # omega_0, omega0 and omega are already existing symbols and thus create an unintended behavior
    elif isinstance(omega_0, str) and omega_0 not in ["omega_0", "omega0", "omega"]:
        _omega_0 = sp.parse_expr(omega_0, local_dict={'pi': sp.pi})
        if isinstance(_omega_0, sp.Symbol):
            _omega_0 = sp.Symbol(omega_0, real=True, nonzero=True, finite=True)

    else:
        _omega_0 = lcapy_omega0

    # if it comes in as lcapy.Expr object it has a unit which will be in the str and should not be in there
    if not isinstance(value, str):
        if isinstance(value, lcapyInskale.Expr):
            value = str(value.expr)
        else:
            value = str(value)

    _value = sp.parse_expr(value, local_dict={'omega_0': _omega_0, 'j': j, 'pi': sp.pi})
    if _value == sp.zoo and _omega_0 == 0:
        return _value, "C"
    # if there is a resistor with 0 ohms and omega_0 is also 0 this gives back an inductor instead of a resistor
    elif _value == 0 and _omega_0 == 0:
        return _value, "L"

    freeSymbols = _value.free_symbols - {_omega_0, 'pi'}

    # this code broke when the calculation is done symbolically e.g. with R1 as value for resistor R1
    # I think that was an unnecessary check based on the fact hat without symbolic calculations there never could be
    # more than one free symbol but is not necessary for this function to work correctly
    # if len(freeSymbols) > 1:
    #    raise AttributeError(f"Too many free symbols in {_value}, free symbols: {freeSymbols}")

    sub_dict = {}
    for freeSymbol in freeSymbols:
        sub_dict[str(freeSymbol)] = sp.Symbol(str(freeSymbol), finite=True, real=True, positive=True)

    # using the sp.im(_value) funktion equals _value/j
    _value = _value.subs(sub_dict).evalf()
    if sp.re(_value).is_zero:
        if not sp.im(_value).is_negative and not sp.im(_value).is_zero:
            returnVal = sp.im(_value) / _omega_0
            returnType = "L"
        elif sp.im(_value).is_negative:
            returnVal = -1 / (sp.im(_value) * _omega_0)
            returnType = "C"
        else:
            returnVal = value
            returnType = "Z"
    elif sp.im(_value).is_zero:
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

    cct = Circuit(netlistString)
    sources = getSourcesFromCircuit(cct)

    omega_0 = getOmegaFromCircuit(cct, sources)

    conv_netlist = ""
    for line in netlist:
        conv_netlist += ComponentToImpedance(line, newLine=True, omega_0=omega_0)

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


def getOmegaFromCircuit(circuit: 'Circuit', sources: list) -> Union[float, sp.Mul, None]:
    if len(circuit.elements[sources[0]].args) >= 3:
        value = circuit.elements[sources[0]].args[2]
        if isinstance(value, str):
            try:
                omega_0 = float(value)
            except ValueError:
                omega_0 = value
        else:
            omega_0 = 0
    else:
        omega_0 = 0

    return omega_0


def getSourcesFromCircuit(circuit: 'Circuit') -> list:
    if len(circuit.sources) > 1:
        raise ValueError("Current implementation can only handle one Source")

    return circuit.sources
