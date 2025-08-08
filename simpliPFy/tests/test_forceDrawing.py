import pytest
from generalizeNetlistDrawing.backends.positions import Optimize

from simplipfy.Svg.drawingConfig import drawing_config_instance as dc
from simplipfyAPI import forceDrawing


class TestForceDrawing:
    drawingHintNetlist = """
    V1 1 0 dc {10}; down
    W 1 2; right
    C1 2 3 {300}; down
    W 2 4; right
    C2 4 5 {300}; down
    W 4 6; right
    C3 6 7 {150}; down
    W 7 5; left
    W 5 3; left
    W 3 0; left"""

    generalizeNetlist = """V1 1 0 dc {10};
    C1 1 0 {10};
    C2 1 0 {10};
    C3 1 0 {10};"""

    _saveSVG = True

    @staticmethod
    def saveSVG(imageData, fileName):
        if not TestForceDrawing._saveSVG:
            return

        with open(fileName, "w") as f:
            f.write(imageData)

    def test_simple_drawing(self):
        dc.unlock()
        dc.setToDefault()
        netlist = TestForceDrawing.drawingHintNetlist
        imageData = forceDrawing(netlist, {})

        assert dc.generalize == False
        assert dc.optimize == Optimize.NONE
        assert dc.isLocked() == False
        assert imageData is not None

        self.saveSVG(imageData, "simple_drawing.svg")

    def test_set_config(self):
        dc.unlock()
        dc.setToDefault()
        netlist = TestForceDrawing.drawingHintNetlist
        imageData = forceDrawing(netlist, {}, configOption="--generalize-true --optimize-mobile")

        assert dc.generalize == False
        assert dc.optimize == Optimize.NONE
        assert dc.isLocked() == False
        assert imageData is not None

        self.saveSVG(imageData, "set_config.svg")

    def test_locked_config(self):
        dc.unlock()
        dc.lock(on="--generalize-true --optimize-desktop")
        netlist = TestForceDrawing.drawingHintNetlist
        imageData = forceDrawing(netlist, {}, configOption="--generalize-true --optimize-mobile")

        assert dc.generalize == True
        assert dc.optimize == Optimize.DESKTOP
        assert dc.isLocked() == True
        assert imageData is not None

        self.saveSVG(imageData, "locked_config.svg")

    def test_drawing_without_lines(self):
        dc.unlock()
        dc.setToDefault()
        dc.lock(on="--generalize-true --optimize-none")
        netlist = TestForceDrawing.generalizeNetlist
        imageData = forceDrawing(netlist, {}, configOption="--generalize-true --optimize-mobile")

        assert dc.generalize == True
        assert dc.optimize == Optimize.NONE
        assert dc.isLocked() == True
        assert imageData is not None

        self.saveSVG(imageData, "drawing_without_lines.svg")

    @pytest.mark.skip(reason="For debugging but cant be tested dynamically")
    def test_wheatstone_drawing(self):
        dc.unlock()
        dc.setToDefault()
        netlist = "V1 1 0 dc {V1}; down\nW 1 2; right\nR1 2 3; down\nR2 3 4 {R2}; down\nW 4 5; left\nW 5 0; up\n" \
                "W 2 6; right\nR3 6 7; down\nR4 7 8 {R4}; down\nW 8 4; left\nVMm 3 7; right"
        imageData = forceDrawing(netlist, {})

        self.saveSVG(imageData, "wheatstone_drawing.svg")