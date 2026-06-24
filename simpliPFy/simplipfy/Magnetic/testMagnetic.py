#from simpliPFyBuildTools.getAbsPath import getAbsPath
#from devFile import filename
from Pyodide.simplipfyAPI import SVGFileGenerator
from simplipfy.Magnetic.elements import MagneticElement, MagneticElementFkt, Gap
from simplipfy.Magnetic.magneticCircuit import MCircuit
import simplipfyAPI
from simplipfy.Svg.magneticDrawWithSchemdraw import MagneticDrawWithSchemdraw
from simplipfy.Helpers.langSymbols import LangSymbols
from lcapyInskale import Circuit

f = open("test.txt", "r")
magnetic_circuit = MCircuit.parse(f.read())
f.close()
magnetic_graph = magnetic_circuit.graph

#a= netlist.cpts[0].mr
#b = set(netlist.filterElems(Gap))
#c = set(netlist)
#d = list(c - b)

mDrawer = MagneticDrawWithSchemdraw(magnetic_circuit, LangSymbols())
circuit_drawing = mDrawer.drawElements()
circuit_drawing.draw()
circuit_drawing.save("C://Users//annemarie.kannenberg//Documents//inskale//Pyodide//Circuits//magnetic//test.svg")

fileName = "test.txt"

test = simplipfyAPI.MagneticTransformer(fileName, "Circuits/kirchhoff/")
test.check_transformation(["V1", "C1"])
print(test.el_netlist)
test.check_transformation(["V1"])
print(test.el_netlist)
test.check_transformation(["C1"])
print(test.el_netlist)
test.check_transformation(["G2"])
print(test.el_netlist)
test.check_transformation(["C2","C4","G1"])
print(test.el_netlist)
test.check_transformation(["C3"])

print(test.transformed_all_elements())
el_netlist_lines = test.el_netlist
netlist =  "\n".join(el_netlist_lines)
print(netlist)
pass