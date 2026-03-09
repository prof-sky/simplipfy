Configuration File
===================
At ``.../Pyodide/src/conf`` is a file named ``conf.json``. This file defines strings and values.
The json-data is loaded into the Configurations class at ``.../Pyodide/src/scripts/utils/configurations.js``.
It asserts that in code file or folder names are not specified multiple times and can be changed if necessary.

Assume we have this in java-script code::

    let conf = new Configurations();

for the entry in conf.json::

    "pyodide.paths.workingDir": "/home/pyodide"

the first part::

    "pyodide.paths.workingDir"

defines that the value can be accessed in java-script like this::

    conf.pyodide.paths.workingDir

What the values mean:

- pyodide.paths.workingDir -> specifies the path where pyodide saves all its files. This is defined by pyodide.
- pyodide.names.solutions -> Specifies the folder name where the solution files are generated (obsolete)
- server.names.circuits -> The filename of the zip served by the server that includes the circuits loaded by default
- server.names.packages -> the folder name where the python packages to install into pyodide are stored on the server
- server.names.simplipfyAPI -> the filename that specifies the api that is used by pyodide for the simplipfy package
- wheatstone.names.optionsExtension -> defines the file ending of the file that stores the wheatstone options
- tools.customCircuits.names.dir -> directory where circuits loaded by the user are stored
- tools.svgGen.names.dir -> name of the directory in which svgs are generated from the tools page
- tools.svgScan.paths.dir -> folder where netlist scanned from a qr code are saved
- tools.svgScan.names.file -> the filename that a netlist scanned from a qr code is saved with
- editor.names.dir -> directory in which editor netlists are saved
- editor.names.file -> the filename that a netlist created by the editor is saved with
- page.values.timeout -> the time it takes for a page to run into an timeout error in ms

To add a value, add the object and its members to the Configurations class. Edit the init to save
the value in the configuration object. If it is a path extend the path by ``pyodide.paths.workingDir``. The string
value of an path in conf shall be usable with pyodide.FS.read and not throw an error.
