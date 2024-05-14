import schemdraw
import schemdraw.elements as elm

nodePos = {}


def addNodePos(start: int, end: int, circuit):
    nodePos[start] = circuit.elements[-1].start
    nodePos[end] = circuit.elements[-1].end


def addElement(element, circuit, label):
    circuit.add(element.label(label))


circuit = schemdraw.Drawing()
circuit.add(elm.sources.SourceV(d="up").label("V1"))
# addNodePos(0, 2, circuit)

circuit.add(elm.Line().up())
circuit.add(elm.Line().right())
addElement(elm.Capacitor(d="down"), circuit, "C1")
circuit.add(elm.Capacitor().down().label('C2'))
circuit.add(elm.Capacitor().down().label('C3'))
circuit.add(elm.Capacitor().down().label('C4'))
addNodePos(7, 8, circuit)
circuit.add(elm.Line().right().at(nodePos[7]))
circuit.add(elm.Capacitor().down().label('C5'))
circuit.add(elm.Line().left())
circuit.add(elm.Line().left())
circuit.add(elm.Line().up())
circuit.add(elm.Line().up())

with circuit:
    elm1 = elm.sources.SourceV().up().label('V1')
    nodePos["0"] = elm1.start
    nodePos["2"] = elm1.end



circuit.save('my_circuit.svg')
