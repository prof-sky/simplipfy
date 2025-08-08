from simplipfy.Helpers.netlistLine import NetlistLine
from simplipfy.Svg.drawingElement import DrawingElement


class DrawingInfo:
    """
    Wrapper for the infromtaon needed to create a DrawingElement
    """
    def __init__(self, drawParam: str, type: str, typeSuffix: str, value: any, ac_dc: str = None, rotation: int = None):
        self.drawParam = drawParam
        self.rotation = rotation if rotation is not None else DrawingElement.textToDirection(drawParam)
        self.type = type
        self.typeSuffix = typeSuffix
        self.value = value
        self.ac_dc = ac_dc

    @property
    def name(self):
        if not self.typeSuffix:
            return self.type
        return self.type + self.typeSuffix

    @property
    def label(self):
        if not self.typeSuffix:
            return self.type
        return self.type + self.typeSuffix

    @staticmethod
    def fromNetline(nl: NetlistLine) -> 'DrawingInfo':
        return DrawingInfo(nl.drawParam, nl.type, nl.typeSuffix, nl.value, nl.ac_dc)