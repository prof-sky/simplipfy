.. _bundle-last:

.bundleLast Files
==================
Those files mark directories where all files are combined into a <folderName>.bundle.js file including subdirectories.
This is done when ``.../Inskale/Pyodide/Scripts/buildBundles.py`` is executed. The script is integrated in the build
process. Combining multiple files into one bundle reduces loading time because it removes loading overhead for multiple
small files.

The file named in .bundleLast is appended to the bundle last to avoid declaration errors if js files rely on each other.
You can also creat a specific order by adding all files to the .bundleLast file in the order you want them to be
append to the bundle file. The bundle files are only visible in ``.../Inskale/Pyodide/dist`` because they are moved
in the build process. If you see them in your project your build process certainly failed. Having the bundles in the
project structure hurts the idea because of duplicate code and references if you configure your ide exclude
``.../Inskale/Pyodide/dist`` from your project files.