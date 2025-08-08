from generalizeNetlistDrawing.vector2D import Vector2D

import schemdrawInskale.elements as elm
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Svg.drawingElement import DrawingElement
from simplipfy.Svg.drawingInfo import DrawingInfo
from generalizeNetlistDrawing.vector2D import Vector2D

import schemdrawInskale.elements as elm
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Svg.drawingElement import DrawingElement
from simplipfy.Svg.drawingInfo import DrawingInfo


class Meter(DrawingElement):
    vaOfst = {"up": -1.15, "down": 0.15, "left": 0.15, "right": -1.2}
    vlOfst = {"up": (-0.2, 0.1), "down": (0.2, -0.1), "left": (-0.4, -0.25), "right": (0, 0.25)}
    clOfst = {"up": (0, 0), "down": (-0.15, 0), "left": (-0.1, -0.15), "right": (-0.1, 0.15)}

    def schemdrawElement(self) -> elm.Element:
        raise NotImplementedError("schemdrawElement must be implemented in the child class")

class Voltmeter(Meter):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        DrawingElement.__init__(self, vec=vec, di=di, omega_0=omega_0, multipleSources=multipleSources,
                         formatter=formatter, ls=ls)

    def schemdrawElement(self) -> elm.MeterV:
        label = '#E#.### ##'
        id_ = self.di.label
        fill = "transparent"
        labelClass = 'element-label ' + id_
        labelOffset = self.labelOffset()
        return elm.MeterV(id_=id_, fill=fill).label(label, ofst=labelOffset, class_=labelClass).at(self.startPos.asTuple).to(self.endPos.asTuple)

class Ammeter(Meter):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        DrawingElement.__init__(self, vec=vec, di=di, omega_0=omega_0, multipleSources=multipleSources,
                         formatter=formatter, ls=ls)

    def schemdrawElement(self) -> elm.MeterI:
        label = '#E#.### ##'
        id_ = self.di.label
        fill = "transparent"
        labelClass = 'element-label ' + id_
        labelOffset = self.labelOffset()
        return elm.MeterI(id_=id_, fill=fill).label(label, ofst=labelOffset, class_=labelClass).at(self.startPos.asTuple).to(self.endPos.asTuple)