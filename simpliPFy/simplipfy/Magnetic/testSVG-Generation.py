#from simpliPFyBuildTools.getAbsPath import getAbsPath
#from devFile import filename
from Pyodide.simplipfyAPI import SVGFileGenerator
import os
from simplipfy.Tools.validateCircuitFile import ValidateCircuitFile
from simplipfy.Tools.validateMagneticFile import ValidateMagneticFile

base_path = os.path.dirname("C://Users//annemarie.kannenberg//Documents//inskale//simpliPFy//Circuits//magnetic//")
filename = "00_Magnetic.txt"
if not ValidateMagneticFile(os.path.join(base_path, filename)).isValid():
   exit("File not valid")

khf_path = os.path.dirname("C://Users//annemarie.kannenberg//Documents//inskale//simpliPFy//Circuits//kirchhoff//")
khf_filename = "02_double-voltageSource-test.txt"

khf_generator = SVGFileGenerator(khf_path)
khf_generator.generateSVGFile(khf_filename)

#svg_generator = SVGFileGenerator(base_path)
#svg_generator.generateSVGFile(filename)

#svg_generator = SVGFileGenerator(base_path)
#svg_generator.generateSVGFile("01_Magnetic.txt")