from generalizeNetlistDrawing.backends.positions import Optimize

from simplipfy.Svg.drawingConfig import drawing_config_instance as dc


def test_setOptions():
    dc.setToDefault()
    dc.setOptions("# optimize mobile generalize")
    assert dc.generalize == False
    assert dc.optimize == Optimize.NONE

    dc.setToDefault()
    dc.setOptions("#")
    assert dc.generalize == False
    assert dc.optimize == Optimize.NONE

    dc.setToDefault()
    dc.setOptions("# --generalize")
    assert dc.generalize == True
    assert dc.optimize == Optimize.NONE

    dc.setToDefault()
    dc.setOptions("# --generalize --optimize-mobile")
    assert dc.generalize == True
    assert dc.optimize == Optimize.MOBILE

    dc.setToDefault()
    dc.setOptions("# --optimize-mobile")
    assert dc.generalize == False
    assert dc.optimize == Optimize.NONE

    dc.lock(on="# --generalize-false --optimize-none")
    assert dc.generalize == False
    assert dc.optimize == Optimize.NONE

    dc.setOptions("# --generalize-true --optimize-desktop")
    assert dc.generalize == False
    assert dc.optimize == Optimize.NONE

    dc.unlock()
    dc.setOptions("--generalize-true --optimize-desktop")
    assert dc.generalize == True
    assert dc.optimize == Optimize.DESKTOP

    options = dc.saveOptions()
    dc.setToDefault()
    dc.loadOptions(options)
    assert dc.generalize == True
    assert dc.optimize == Optimize.DESKTOP

    dc.setToDefault()