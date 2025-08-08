from typing import Type

from generalizeNetlistDrawing.elements.element import Element
from generalizeNetlistDrawing.elements.line import Line as genLine
from generalizeNetlistDrawing.vector2D import Vector2D

from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.impedanceConverter import ImpedanceToComponent
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.netlistLine import NetlistLine
from simplipfy.Svg.Elements.components import Capacitor, ConnectionDot, Inductor, Line, Resistor
from simplipfy.Svg.Elements.meters import Ammeter, Voltmeter
from simplipfy.Svg.Elements.sources import SourceI, SourceV
from simplipfy.Svg.drawingElement import DrawingElement
from simplipfy.Svg.drawingInfo import DrawingInfo


class DrawingElementFaktory:
    """
    Class for creating drawingElements
    """

    type_map: dict[str, Type[DrawingElement]] = {
        "R": Resistor,
        "L": Inductor,
        "C": Capacitor,
        "Z": Resistor,
        "V": SourceV,
        "I": SourceI,
        "W": Line,
        "VM": Voltmeter,
        "AM": Ammeter,
        "D": ConnectionDot
    }

    def __init__(self, ls: LangSymbols, omega_0, formatter: DictExportBase, multipleSources=False):
        """
        :param ls: LangSymbols, some language specific symbols (e.g., voltage across R1 in german U1 in englisch V1)
        :param omega_0: angular frequency of the circuit does certanly work for float or sympy.Mul
        :param formatter: formatter that is used to convert lcapy values or sympy expressions to latex strings
        :param multipleSources: if True, the naming of source(s) changes from Vtot to Va, Vb
        """
        self.ls = ls
        self.ms = multipleSources
        self.omega_0 = omega_0
        self.formatter = formatter


    def make(self, di: DrawingInfo, vec: Vector2D(0, 0), type, length=3) -> DrawingElement:
        """
        all makeFrom* functions call this function to actually make a DrawingElement
        """
        element_class = self.type_map.get(type, None)
        if element_class:
            return element_class(vec=vec, di=di, omega_0=self.omega_0, multipleSources=self.ms,
                                 formatter=self.formatter, ls=self.ls, scaling=length)
        else:
            raise NotImplementedError(f"Element type '{type}' is not implemented.")

    def makeFromNetline(self, netLine: str, vec: Vector2D(0, 0)) -> DrawingElement:
        """
        Create a drawing element from a netlist line
        e.g., lcapy.Circuit(<initialize>).netlist()[0]
        Determines the element type from the netlist line R1 5 6 {100}; down -> R type
        """
        if netLine[0] == "Z":
            netLine = ImpedanceToComponent(netLine, omega_0=self.omega_0)

        di = DrawingInfo.fromNetline(NetlistLine(netLine))
        return self.make(di, vec, di.type)

    def makeFromElement(self, elm: Element):
        """
        create a drawing element from generalize.netlistDrawing.elements.element
        """
        drawParam = elm.directionToText(elm.direction())

        if elm._netLine:
            if elm._netLine[0] == "Z":
                elm._netLine = ImpedanceToComponent(elm._netLine, omega_0=self.omega_0)

            startPos = elm.startPos
            nl = NetlistLine(elm._netLine)
            type = nl.type
            typeSuffix = nl.typeSuffix
            value = nl.value
            ac_dc = nl.ac_dc
            di = DrawingInfo(drawParam, type, typeSuffix, value, ac_dc)
            return self.make(di, startPos, type)

        elif isinstance(elm, genLine):
            length = elm.length
            di = DrawingInfo(drawParam, "W", None, None, None, None)
            return self.make(di, elm.startPos, "W", length)

        else:
            raise RuntimeError("Unhandeled element")

    def makeDot(self, vec: Vector2D, label="") -> ConnectionDot:
        """
        Creates a connection dot that indicates that two overlapping wires are connected
        """
        return ConnectionDot(vec,
                             DrawingInfo("down", "D", "", None, None, 0),
                             self.omega_0, self.ms, self.formatter, self.ls, label=label)
