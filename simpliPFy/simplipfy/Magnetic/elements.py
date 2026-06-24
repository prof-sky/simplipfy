from abc import ABC, abstractmethod
from typing import Literal
from sympy import Rational, pi, Expr, Integer, parse_expr

#from doc.conf import man_pages

drawingDirections = Literal["up", "down", "left", "right", None]
Value = float | int | Expr

class MagneticElementBase(ABC):
    componentType = ""
    identifier = ""
    positiveNode = ""
    negativeNode = ""
    drawingDirection: drawingDirections = ""
    netlist = ""
    magneticConstant = pi * Rational(4, 10**7)

    def __init__(self, data: list[str | drawingDirections]):
        self.componentType = data[0][0]
        self.identifier = data[0][1:]
        self.positiveNode = data[1]
        self.negativeNode = data[2]
        self.drawingDirection = data[-1]

        self.netlist = " ".join(data[0:-1]) + "; " + data[-1] if data[-1] is not None else " ".join(data[0:-1])

    @staticmethod
    def parse(string: str) -> list[str | drawingDirections]:
        """
        :param string: string to parse
        :returns: (positiveNode, negativeNode)

        parses the nodes from a string of the form
        "<componentType><identifier> <positive Node> <negative Node> {arg1}, {arg2}, ... ; <drawing hint>"
        """
        data: list[str | drawingDirections]
        drawingDirection: drawingDirections

        string, drawingDirection = string.split(";") if ";" in string else (string, None)

        data = string.split(" ")
        if drawingDirection:
            drawingDirection = drawingDirection.replace(" ", "")
        data.append(drawingDirection)
        return data

    def __str__(self) -> str:
        return self.netlist

    @property
    @abstractmethod
    def mr(self)  -> Expr:
        raise NotImplementedError("mr should be implemented by subclasses of MagneticElementBase")

    @property
    def magneticResistance(self) -> Expr:
        return self.mr

    @abstractmethod
    def mmf(self, magneticFlux: Value) -> Expr:
        raise NotImplementedError("mmf should be implemented by subclasses of MagneticElementBase")

    """
    :returns: the magnetomotive force of the magnetic element for a given magnetic flux, use self.mmf for short
    """
    def magnetomotiveForce(self, magneticFlux: Value) -> Expr:
        return self.mmf(magneticFlux)

    @abstractmethod
    def mf(self, magnetomotiveForce: Value) -> Expr:
        raise NotImplementedError("mf should be implemented by subclasses of MagneticElementBase")

    """
    :returns: the magnetic flux of the magnetic element for a given magnetomotive force, use self.mf for short
    """
    def magneticFlux(self, magnetomotiveForce: Value) -> Expr:
        return self.mf(magnetomotiveForce)


class MagneticCore(MagneticElementBase):
    type = "C"
    _length = ""
    _relativePermeability = ""
    _area = ""

    """
    Creates a magnetic core from the given netlist arguments.
    :param data: list of strings containing the netlist arguments in the following order:
    [positiveNode, negativeNode, area, drawingDirection]
    """
    def __init__(self, data: list[str | drawingDirections]):
        if data[0][0] != self.type:
            raise ValueError(f"data[0] should start with {self.type} but is {data[0]}")

        super().__init__(data)
        self._length = data[3]
        self._relativePermeability = data[4]
        self._area = data[5]

    @property
    def length(self) -> Expr:
        return parse_expr(self._length)

    @property
    def relativePermeability(self) ->  Expr:
        return parse_expr(self._relativePermeability)

    @property
    def area(self) -> Expr:
        return parse_expr(self._area)

    @staticmethod
    def parse(string: str) -> "MagneticCore":
        """
        :param string: string to parse
        :returns: MagneticCore object with the parsed values

        parses a magnetic core from a string of the form "C length relativePermeability area"
        """
        MagneticElementBase.parse(string)
        return MagneticCore(MagneticElementBase.parse(string))#

    """
    :returns: the permeability of the magnetic core, use p for short
    """
    @property
    def permeability(self) -> Expr:
        return self.p

    """
    :returns: the permeability of the magnetic core
    """
    @property
    def p(self):
        return self.relativePermeability * self.magneticConstant

    """
    :returns: the magnetic resistance of the magnetic core
    """
    @property
    def mr(self) -> Expr:
        return self.length / (self.permeability * self.area)

    """
    :returns: the magnetomotive force of the magnetic core for a given magnetic flux
    """
    def mmf(self, magneticFlux: Value) -> Expr:
        return self.mr * magneticFlux


    """
    :returns: the magnetic flux of the magnetic core for a given magnetomotive force
    """
    def mf(self, magnetomotiveForce: Value) -> Expr:
        return magnetomotiveForce / self.mr

class Gap(MagneticElementBase):
    type = "G"
    core: MagneticCore = None
    gap: MagneticCore =  None

    def __init__(self, data: list[str | drawingDirections]):
        if data[0][0] != self.type:
            raise ValueError(f"data[0] should start with {self.type} but is {data[0]}")

        super().__init__(data)
        self.core = MagneticCore(["C_1", self.positiveNode, self.negativeNode, data[3], data[4], data[7], self.drawingDirection])
        self.gap = MagneticCore(["C_2", self.positiveNode, self.negativeNode, data[5], data[6], data[7], self.drawingDirection])


    @staticmethod
    def parse(string: str) -> "Gap":
        """
        :param string: string to parse
        :returns: Gap object with the parsed values

        parses a magnetic core from a string of the form "C length relativePermeability area"
        """
        MagneticElementBase.parse(string)
        return Gap(MagneticElementBase.parse(string))

    @property
    def mr(self) -> Expr:
        return self.core.magneticResistance + self.gap.magneticResistance

    def mmf(self, magneticFlux: Value) -> Expr:
        return self.core.magnetomotiveForce(magneticFlux) + self.gap.magnetomotiveForce(magneticFlux)

    def mf(self, magnetomotiveForce: Value) -> Expr:
        return self.core.magneticFlux(magnetomotiveForce) + self.gap.magneticFlux(magnetomotiveForce)


class MagnetomotiveForceSource(MagneticElementBase):
    type = "V"
    core: MagneticCore = None
    _numberOfWindings = ""
    _currentOfSource = ""

    def __init__(self, data: list[str | drawingDirections]):
        if data[0][0] != self.type:
            raise ValueError(f"data[0] should start with {self.type} but is {data[0]}")

        super().__init__(data)
        self.core = MagneticCore(["C_1", self.positiveNode, self.negativeNode, data[3], data[4], data[5], self.drawingDirection])
        self._numberOfWindings = data[6]
        self._currentOfSource = data[7]


    @staticmethod
    def parse(string: str) -> "MagnetomotiveForceSource":
        """
        :param string: string to parse
        :returns: MagnetomotiveForceSource object with the parsed values

        parses a magnetic core from a string of the form "C length relativePermeability area"
        """
        MagneticElementBase.parse(string)
        return MagnetomotiveForceSource(MagneticElementBase.parse(string))

    @property
    def numberOfWindings(self) -> Expr:
        return parse_expr(self._numberOfWindings)

    @property
    def currentOfSource(self) -> Expr:
        return parse_expr(self._currentOfSource)

    """
    :returns: the magnetic resistance of the core from the magnetomotive force source"""
    @property
    def mr(self) -> Expr:
        return self.core.magneticResistance

    """
    :returns: the magnetomotive force of the core, should be the same as self.mmfSource
    """
    def mmf(self, magneticFlux: Value) -> Expr:
        return self.core.mmf(magneticFlux)

    """
    :returns: the magnetic flux of the core from the magnetomotive force source
    """
    def mf(self, magneticResistance: Value) -> Expr:
        return self.core.mf(magneticResistance)

    @property
    def mmfSource(self) -> Expr:
        return Integer(1) * self.numberOfWindings * self.currentOfSource

    def mfSource(self, magneticResistance: Value) -> Expr:
        return self.mmfSource / magneticResistance

MagneticElement = MagneticCore | Gap | MagnetomotiveForceSource

class MagneticElementFkt:
    @staticmethod
    def getElement(line: str) -> MagneticElement:
        cptType = line[0]
        if cptType == "C":
            return MagneticCore.parse(line)
        elif cptType == "G":
            return Gap.parse(line)
        elif cptType == "V":
            return MagnetomotiveForceSource.parse(line)
        else:
            raise ValueError(f"unknown magnetic element type {cptType}")