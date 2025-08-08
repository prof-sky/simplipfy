import os
import warnings

from simplipfy.Tools.forceDrawing import forceDrawing
from simplipfy.Tools.printColored import cPrint
from simplipfy.Tools.validateCircuitFile import ValidateCircuitFile

curFile: str = ""

class SVGFileGenerator:
    """
    Class to generate the svg files for the Circuits folder.
    This class validates the folder structure to assert it works with simplify frontend.
    If you only want to generate a svg file use simpliPFyAPI.forceDrawing instead.
    """
    allowedFolders = {"capacitor", "inductor", "kirchhoff", "mixed", "quickstart", "resistor", "symbolic", "wheatstone"}

    def __init__(self, folderPath: str):
        """
        :param folderPath: path to the folder containing the circuit files
        """
        self.folderPath = folderPath
        self.failedFiles = []
        self.progress = 0

        self.foundFolders = self._getUsedFolders()
        self.filesInFolders: list[str] = self._getFilesInFolders()

    def _getUsedFolders(self) -> list[str]:
        folders = [file for file in os.listdir(self.folderPath) if os.path.isdir(os.path.join(self.folderPath, file))]
        if set(folders) - self.allowedFolders:
            cPrint(f"Invalid folder structure, the following folders are not allowed: {set(folders) - self.allowedFolders}")
            return []

        return folders

    def _getFilesInFolders(self):
        files = []
        for folder in self.foundFolders:
            folderPath = os.path.join(self.folderPath, folder)
            folderFiles = [os.path.join(folder, file) for file in os.listdir(folderPath)]
            files.extend(folderFiles)

        return files

    def getFilteredFiles(self, exts: list[str]) -> list[str]:
        """
        exts: list of file extensions to filter for e.g. ['.txt', '.sch']
        :returns: list of files with the given extensions
        """
        return [file for file in self.filesInFolders if file[file.rfind(".")::] in exts]

    def removeSVGFiles(self):
        """
        Removes all svg files in the folder specified by self.folderPath
        """
        svgFiles = self.getFilteredFiles([".svg"])
        for file in svgFiles:
            os.remove(os.path.join(self.folderPath, file))

    def generateSVGFile(self, filePath: str) -> int:
        """
        :param filePath: path to the circuit file with name and extension
        :returns: int error code

        * 0 if the svg file was generated successfully,
        * 1 if the svg file was not found,
        * 2 if the circuit file is not valid,
        * 3 if generating the file throws an error

        Generates the svg file for the given circuit file.

        """
        folder, file = os.path.split(filePath)
        baseName, ext = os.path.splitext(file)

        if not os.path.isfile(os.path.join(self.folderPath, filePath)):
            cPrint(f"File {filePath} not found")
            return 1

        print(f"generating: {os.path.join(folder, baseName + '.svg')}")
        if not ValidateCircuitFile(fileName=file, filePath=os.path.join(self.folderPath, folder)).isValid():
            self.failedFiles.append(file)
            return 2
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")

                with open(os.path.join(self.folderPath, filePath), "r") as f:
                    netlist = f.read()

                drawingConfig = ""
                if netlist[0] == "#":
                    endDrawingConfig = netlist.find("\n")
                    drawingConfig = netlist[1:endDrawingConfig]
                    netlist = netlist[endDrawingConfig + 1::]

                imageData = forceDrawing(netlist, ls={}, configOption=drawingConfig)

                with open(os.path.join(self.folderPath, os.path.join(folder, baseName) + "_step0.svg"), "w") as f:
                    f.write(imageData)

        except Exception as e:
            cPrint(f"Error generating {filePath}: {e}")
            self.failedFiles.append(file)
            return 3

        return 0

    def generateAllFiles(self, raiseEx:bool = True) -> int:
        """
        :param raiseEx: if True, raise an RuntimeError if the svg file generation fails.
        If False, return the number of failed files.
        :returns: None
        :raises: RuntimeError if raiseEx is True and the svg file generation fails for one file.

        Remove all svg files in the folder specified by self.folderPath and generate new svg files for each circuit file
        (.txt or .sch) in the folder.
        """
        self.removeSVGFiles()
        failedFiles = 0
        for filePath in self.getFilteredFiles([".txt", ".sch"]):
            state = self.generateSVGFile(filePath)
            if state:
                if raiseEx:
                    raise RuntimeError(f"Error generating {filePath}")
                else:
                    failedFiles += 1
        return failedFiles

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="-path provides the p")
    parser.add_argument(
        '-path',
        type=str,
        required=False,
        help="The path to the circuit files"
    )

    args = parser.parse_args()
    if args.path:
        input_path = args.path
    else:
        print("No path provided, using simpliPFy circuits folder")
        input_path = os.path.join(os.getcwd().split("simplipfy")[0], "Circuits")
    abs_path = os.path.abspath(os.path.normpath(input_path))
    print(f"The provided path is: {abs_path}")

    generator = SVGFileGenerator(abs_path).generateAllFiles()
