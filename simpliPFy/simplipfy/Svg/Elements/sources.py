from abc import abstractmethod

from generalizeNetlistDrawing.vector2D import Vector2D

import schemdrawInskale.elements as elm
from schemdrawInskale import Drawing
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Svg.drawingElement import DrawingElement
from simplipfy.Svg.drawingInfo import DrawingInfo


class Source(DrawingElement):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        DrawingElement.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)

    @abstractmethod
    def schemdrawElement(self) -> elm.Source:
        pass

    def voltLabel(self, drawing: Drawing, at: elm.Element, ofst=0.15, ofstLabel=None, reverse=False, suffix=None):
        suffix = self.di.typeSuffix if self.multipleSources else self.ls.total
        super().voltLabel(drawing, at, suffix=suffix)

    def curLabel(self, drawing: Drawing, at: elm.Element, ofst=0.7, ofstLabel=(-0.1, 0), reverse=False, suffix=None):
        suffix = self.di.typeSuffix if self.multipleSources else self.ls.total
        super().curLabel(drawing, at, reverse=True, suffix=suffix)

class SourceV(Source):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        Source.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)

    def schemdrawElement(self) -> [elm.SourceSin, elm.StabilizedSource]:
        label = '#E#.### ##'
        id_ = self.di.label
        class_ = self.value()
        labelClass = 'element-label ' + id_
        labelOffset = self.elOfst[self.di.drawParam]

        if self.di.ac_dc == "ac":
            return elm.sources.SourceSin(id_=id_, class_=class_).label(label, ofst=labelOffset, class_=labelClass).at(
                self.startPos.asTuple).to(self.endPos.asTuple)
        else:
            return elm.sources.StabilizedSource(id_=id_, class_=class_).label(label, ofst=labelOffset, class_=labelClass).at(
                self.startPos.asTuple).to(self.endPos.asTuple)

class SourceI(Source):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        Source.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)

    def schemdrawElement(self) -> elm.Source:
        label = '#E#.### ##'
        id_ = self.di.label
        class_ = self.value()
        labelClass = 'element-label ' + id_
        labelOffset = self.elOfst[self.di.drawParam]

        return elm.sources.SourceI(id_=id_, class_=class_).label(label, ofst=labelOffset, class_=labelClass).at(
            self.startPos.asTuple).to(self.endPos.asTuple)