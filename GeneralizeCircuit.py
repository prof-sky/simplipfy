from generalizeNetlistDrawing.backends.schemdraw.draw import Optimize, DrawWithSchemdraw
from generalizeNetlistDrawing.backends.lcapyNetlist.export import ExportAsLcapyNetlist

mobile = Optimize.MOBILE

netlistFilePath = r"Pyodide/Circuits/mixed/02_mixed_RCL_series.txt"
saveFileName = "test.txt"

netlistFile = open(netlistFilePath).read()

# to generate generalized netlist
a = ExportAsLcapyNetlist(netlistFile)

generalizedNetlist = a.export

with open(saveFileName, "w") as f:
    f.write(generalizedNetlist)

print(generalizedNetlist)

# to draw schematic with schemdraw
DrawWithSchemdraw(generalizedNetlist)
