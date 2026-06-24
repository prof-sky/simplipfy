from lcapyInskale import Circuit
from simplipfy.Magnetic.magneticCircuit import MCircuit
from simplipfy.Helpers.langSymbols import LangSymbols
from simplipfy.Svg.drawWithSchemdraw import DrawWithSchemdraw as dws
from simplipfy.Svg.magneticDrawWithSchemdraw import MagneticDrawWithSchemdraw as mdws
from simplipfy.Svg.drawingConfig import drawing_config_instance as dc
from simplipfy.Tools.validateCircuitFile import ValidateCircuitFile


def forceDrawing(netlist: str, ls: dict, configOption:str = None) -> str:
    """
    :param netlist: str, netlist to be drawn
    :param ls: LangSymbols dict
    :param configOption: str, drawing config option to be used
    :returns: str, SVG image data

    Force drawing of a circuit with schemdraw, no checks applied simply drawing the components of the circuit
    If DrawWithSchemdraw raises a RuntimeError, the function will return an SVG image with the errors and warnings
    """
    wasLocked: bool = dc.isLocked()
    configState = dc.saveOptions()

    dc.unlock()
    configOption = configOption if configOption is not None else ""
    dc.lock(on=configOption)
    if configOption == "magnetic":
        try:
            imageData = mdws(MCircuit.parse(netlist), LangSymbols(ls)).getImageData()
        except:
            pass #TODO: add runtimeError and generate as below!
    else:
        try:
            imageData = dws(Circuit(netlist=netlist), LangSymbols(ls), removeDangling=False).getImageData()
        except RuntimeError:
            return generateSVGWithErrorsAndWarnings(netlist)

    dc.unlock()
    if wasLocked:
        dc.loadOptions(configState)
        dc.lock()
    else:
        dc.setToDefault()

    return imageData


def generateSVGWithErrorsAndWarnings(netlist):
    vd = ValidateCircuitFile(fileStr=netlist)
    vd.validate()
    if vd.warnMsgs:
        print(f"The following warning(s) are expected to cause the RuntimeError:\n {vd.warnMsgs}")
    elif vd.errMsgs:
        print(f"The following error(s) are expected to cause the RuntimeError:\n {vd.errMsgs}")

    svgStart = r'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="en" height="600" width="300" viewBox="0 0 600 300">'
    svgEnd = r'</svg>'
    fontWeight = r'font-weight="bold"'
    textAnchor = r'text-anchor="middle"'
    fill = r'fill="#ef4444"'
    headingText = "The following warning(s)/error(s) are expected to produce a rendering error:"

    msgs = vd.warnMsgs.splitlines() + vd.errMsgs.splitlines()
    if len(msgs) > 8:
        msgs = msgs[:4]
        print("Warning: Only the first 4 messages are displayed in the SVG image.")

    firstPos = 100 - (1 + len(msgs)) * 10
    heading = f'<text x="50%" y="{firstPos}%" {fontWeight} {textAnchor} {fill}>{headingText}</text>'

    texts = []
    for idx, msg in enumerate(msgs, start=1):
        texts.append(f'<text x="50%" y="{firstPos + idx * 10}%" {textAnchor} {fill}>{msg}</text>')
    texts = "".join(texts)

    return svgStart + heading + texts + svgEnd