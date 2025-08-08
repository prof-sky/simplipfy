# for simplipfy version: 0.1.74
import warnings
warnings.filterwarnings('ignore')
# this py File is imported into pyodide and enables the use of the simpliPFy library in the web app without the need
# to type out the full path to the functions
from simplipfy.SimplifyStepWise.simplifyStepwise import solve as ssw
solveStepwise = ssw

from simplipfy.SimplifyInUserOrder.solvInUserOrder import SolveInUserOrder as siuo
SolveInUserOrder = siuo


from simplipfy.KirchhoffSolver.kirchhofSolver import KirchhoffSolver as khs
KirchhoffSolver = khs


from simplipfy.WheatstoneBridge.solver import equationIsValid as wss
WheatstoneBridgeSolver = wss

from simplipfy.WheatstoneBridge.solver import bridgeIsBalanced as wsbb
WheatstoneBridgeBalanced = wsbb

from simplipfy.WheatstoneBridge.solver import calcMissingVal as wscmv
WheatstoneBridgeCalcMissingVal = wscmv

from simplipfy.Tools.validateCircuitFile import ValidateCircuitFile as vcf
ValidateCircuitFile = vcf

from simplipfy.Tools.forceDrawing import forceDrawing as fd
forceDrawing = fd

from simplipfy.Tools.generateSVGFiles import SVGFileGenerator as svgfg
SVGFileGenerator = svgfg

from simplipfy.Tools.zipFolder import zip_folder as zf
zipFolder = zf

from simplipfy.Svg.drawingConfig import drawing_config_instance as dc
drawingConfigInstance = dc

from simplipfy.Tools.generateGraphs import generate_graph_from_circuit as ggfc
generateGraphFromCircuit = ggfc     
