from generalizeNetlistDrawing.vector2D import Vector2D

import schemdrawInskale
import schemdrawInskale.elements as elm
from schemdrawInskale import Drawing
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Svg.drawingElement import DrawingElement
from simplipfy.Svg.drawingInfo import DrawingInfo


class Resistor(DrawingElement):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        DrawingElement.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)

    def schemdrawElement(self) -> elm.Resistor:
        label = '#E#.### ##'
        id_ = self.di.label
        class_ = self.value()
        fill = "transparent"
        labelClass = 'element-label ' + id_
        labelOffset = self.elOfst[self.di.drawParam]
        return elm.Resistor(id_=id_, class_=class_, fill=fill).label(label, ofst=labelOffset, class_=labelClass).at(self.startPos.asTuple).to(self.endPos.asTuple)


class Capacitor(DrawingElement):
    caOfst = {"up": 0.3, "down": 0.3, "left": 0.3, "right": 0.3}
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        DrawingElement.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)

    def _capacitor(self,d, id_, class_, fill) -> schemdrawInskale.elements.elements.Element:
        combElm = schemdrawInskale.Drawing()
        cap = elm.Capacitor().at((0,0)).right()
        combElm.add(cap)
        combElm.add(elm.Resistor(id_=id_, class_=class_, fill=fill, color='transparent').at((0,0)).right())

        element_anchors = {
            'start': cap.start,
            'end': cap.end,
            'center': cap.center
        }

        newElm = schemdrawInskale.elements.ElementDrawing(combElm, d=d, anchors=element_anchors)
        newElm.anchors = element_anchors
        return newElm

    def curLabel(self, drawing: Drawing, at: elm.Element, ofst=0, ofstLabel=(-0.1, 0), reverse=False):
        dirVec: Vector2D = self.direction()
        d = self.directionToText(dirVec)
        ofst = self.caOfst[d]
        labelPos = self.startPos + dirVec * Vector2D(1.5, 1.5)
        super().curLabel(drawing, at=labelPos.asTuple, ofst=ofst, ofstLabel=self.clOfst[d], reverse=reverse)

    def schemdrawElement(self) -> elm.Capacitor:
        label = '#E#.### ##'
        id_ = self.di.label
        class_ = self.value()
        fill = "transparent"
        labelClass = 'element-label ' + id_
        dirParam = self.directionToText(self.direction())
        labelOffset = self.elOfst[dirParam]
        return self._capacitor(d=dirParam, id_=id_, class_=class_, fill=fill).label(label, ofst=labelOffset, class_=labelClass).at(self.startPos.asTuple)


class Inductor(DrawingElement):
    vaOfst = {"up": -0.25, "down": 0.3, "left": 0.3, "right": -0.25}

    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        DrawingElement.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)

    def _inductor(self,d, id_, class_, fill) -> schemdrawInskale.elements.elements.Element:
        combElm = schemdrawInskale.Drawing()
        ind = elm.InductorIEC().at((0,0)).right()
        combElm.add(ind)
        combElm.add(elm.Resistor(id_=id_, class_=class_, fill=fill, color='transparent').at((0,0)).right())

        element_anchors = {
            'start': ind.start,
            'end': ind.end,
            'center': ind.center
        }

        newElm = schemdrawInskale.elements.ElementDrawing(combElm, d=d, anchors=element_anchors)
        newElm.anchors = element_anchors
        return newElm

    def curLabel(self, drawing: Drawing, at: elm.Element, ofst=0.7, ofstLabel=(-0.1, 0), reverse=False):
        dirVec: Vector2D = self.direction()
        d = self.directionToText(dirVec)
        labelPos = self.startPos + dirVec * Vector2D(1.5, 1.5)
        super().curLabel(drawing, at=labelPos.asTuple, ofst=ofst, ofstLabel=self.clOfst[d], reverse=reverse)

    def voltLabel(self, drawing: Drawing, at: elm.Element, ofst=0.3, ofstLabel=(0.2, -0.1), reverse=False):
        dirVec: Vector2D = self.direction()
        d = self.directionToText(dirVec)
        ofst = self.vaOfst[d]
        ofstLabel = self.vlOfst[d]
        labelPos = self.startPos + dirVec * Vector2D(1.5, 1.5)
        super().voltLabel(drawing, at=labelPos.asTuple, ofst=ofst, ofstLabel=ofstLabel, reverse=reverse)


    def schemdrawElement(self) -> elm.InductorIEC:
        label = '#E#.### ##'
        id_ = self.di.label
        class_ = self.value()
        fill = "transparent"
        labelClass = 'element-label ' + id_
        dirParam = self.directionToText(self.direction())
        labelOffset = self.elOfst[self.di.drawParam]
        return self._inductor(d=dirParam, id_=id_, class_=class_, fill=fill).label(label, ofst=labelOffset, class_=labelClass).at(self.startPos.asTuple)


class Line(DrawingElement):
    elOfstR = {"up": (0, -2.2), "down": (0, 2.2), "left": (0, 0), "right": (0, 0)}
    elOfstL = {"up": (0, 0), "down": (0, 0), "left": (0, 0), "right": (0, 0)}
    def schemdrawElement(self) -> elm.Line:
        # The label of vertical elements can result in an uncentered svg image. Adding transparent labels to lines
        # resolves this issue
        ofstL = self.elOfstL[self.di.drawParam]
        ofstR = self.elOfstR[self.di.drawParam]

        return elm.Line(

        ).label(
            "LLL.LLL LL", ofst=ofstL, color='transparent'
        ).label(
            "LLL.LLL LL", ofst=ofstR, color='transparent'
        ).at(self.startPos.asTuple).to(self.endPos.asTuple)

    def voltLabel(self, drawing: Drawing, at: elm.Element, ofst=0.15, ofstLabel=(0.2, -0.1), reverse=False) -> None:
        return

    def curLabel(self, drawing: Drawing, at: elm.Element, ofst=0.7, ofstLabel=(-0.1, 0), reverse=False) -> None:
        return

    def value(self):
        return ""

class ConnectionDot(DrawingElement):
    def __init__(self, vec: Vector2D, di: DrawingInfo, omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0, label=""):
        di = DrawingInfo("down", "D", "", None, None, 0)
        DrawingElement.__init__(self, vec, di, omega_0, multipleSources, formatter, ls, scaling=3.0)
        self.label = label

    @property
    def endPos(self) -> Vector2D:
        return self.startPos

    def length(self) -> float:
        return 1

    def schemdrawElement(self) -> elm.Dot:
        return elm.Dot().at(self.startPos.asTuple).label(self.label, ofst=(-0.3, 0.15))

    def voltLabel(self, drawing: Drawing, at: elm.Element, ofst=0.15, ofstLabel=(0.2, -0.1), reverse=False):
        return
    def curLabel(self, drawing: Drawing, at: elm.Element, ofst=0.7, ofstLabel=(-0.1, 0), reverse=False):
        return
