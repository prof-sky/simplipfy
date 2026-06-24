from abc import abstractmethod

from generalizeNetlistDrawing.elements.element import Direction, Element
from generalizeNetlistDrawing.vector2D import Vector2D

import schemdrawInskale.elements as elm
from schemdrawInskale import Drawing
from simplipfy.Export.dictExportBase import DictExportBase
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Helpers.unitWorkAround import UnitWorkAround as uwa


class DrawingElement(Element):
    """
    Base class for drawing elements in schemdraw that handles the common case for creating labels, positions etc.
    Treat this class as an abstract class.
    """
    vaOfst = {"up": -0.65, "down": 0.15, "left": 0.15, "right": -0.65}
    elOfst = {"up": (0.35, 0.1), "down": (-0.35, -0.1), "left": (0, -0.25), "right": (0, 0.25)}
    clOfst = {"up": (0.15, -0.15), "down": (-0.15, 0.15), "left": (-0.1, -0.05), "right": (-0.1, 0.05)}
    vlOfst = {"up": (0, 0.15), "down": (0, -0.15), "left": (0, -0.15), "right": (0, 0.15)}

    def __init__(self, vec: Vector2D, di: 'DrawingInfo', omega_0, multipleSources: bool, formatter: DictExportBase,
                 ls: LangSymbols, scaling=3.0):
        self.di: 'DrawingInfo' = di
        self.omega0 = omega_0
        self.multipleSources = multipleSources
        self.format = formatter
        self.ls: LangSymbols = ls

        super().__init__(vec=vec, name=di.label, rotation=self.di.rotation, scaling=scaling)

    @property
    def posNodePos(self) -> Vector2D:
        """
        Returns: position of the positive node as Vector2D object
        """
        return self.startPos

    @property
    def negNodePos(self) -> Vector2D:
        """
        Returns: position of the negative node as Vector2D object
        """
        return self.endPos

    def voltLabel(self, drawing: Drawing, at: elm.Element, ofst=0.15, ofstLabel=None, reverse=False, suffix=None):
        drawParam = self.di.drawParam
        ofst = self.vaOfst[drawParam]
        ofstLabel = self.vlOfst[drawParam]
        suffix = self.di.label if suffix is None else suffix
        drawing.add(
            elm.CurrentLabel(
                length=1.5, class_="voltage-label arrow " + self.ls.volt + suffix, ofst=ofst, reverse=reverse
            ).at(
                at
            ).label(
                '#V#.### ##', loc='bottom', class_='voltage-label arrow ' + self.ls.volt + suffix, ofst=ofstLabel
            )
        )

    def curLabel(self, drawing: Drawing, at: elm.Element, ofst=0.7, ofstLabel=None, reverse=False, suffix=None):
        drawParam = self.di.drawParam
        ofstLabel = self.clOfst[drawParam] if ofstLabel is None else ofstLabel

        suffix = self.di.label if suffix is None else suffix
        drawing.add(elm.CurrentLabelInline(
            direction='in', class_="current-label arrow I" + suffix, ofst=ofst, reverse=reverse
                                    ).at(
            at
                                    ).label(
            '#C#.### ##', class_='current-label arrow I' + suffix, ofst=ofstLabel
                                            )
        )


    @staticmethod
    def textToDirection(dirText) -> int:
        if dirText == "right":
            return Direction.right.value
        if dirText == "left":
            return Direction.left.value
        if dirText == "up":
            return Direction.up.value
        if dirText == "down":
            return Direction.down.value

        raise RuntimeError(f"Unknown direction text: {dirText}")

    @staticmethod
    def textToDirectionVector(dirText) -> Vector2D:
        if dirText == "right":
            return Vector2D(1, 0)
        if dirText == "left":
            return Vector2D(-1, 0)
        if dirText == "up":
            return Vector2D(0, 1)
        if dirText == "down":
            return Vector2D(0, -1)

        raise RuntimeError(f"Unknown direction text: {dirText}")

    def value(self):
        return self.format.latexWithPrefix(uwa.addUnit(self.di.value, self.di.type))

    def labelOffset(self) -> tuple[float, float]:
        if self.rotation == Direction.right.value:
            return 0, 0.3
        elif self.rotation == Direction.left.value:
            return 0, -0.3
        return -0.4, -0.1

    @abstractmethod
    def schemdrawElement(self) -> elm.Element:
        raise NotImplementedError("schemdrawElement must be implemented in the subclass")