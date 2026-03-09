Update Pyodide
===============
From time to time there will be new releases of Pyodide. This might result in performance increases if Pyodide is
updated to the newest version. To Update Pyodide download

    - pyodide
    - pyodide-core

from `Pyodide Releases <https://github.com/pyodide/pyodide/releases/>`__.
Unpack the archives. Copy everything from the pyodide-core folder into ``.../inskale/Pyodide`` and replace the old files
with the new ones from pyodide-core. Then replace each package that matches ``*wasm*`` with the same package (and a new
version) from the unpacked pyodide folder. Ignore any metadata file in the pyodide folder.