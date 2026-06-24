Circuits
========

Note: see :doc:`netlists` to learn how circuit files should look.

.. _CircuitsZipStructure:

Circuits zip structure
---------------------------
The structure inside the circuits zip file has to be a subset of the following folders:

- capacitor (circuits with only capacitors)
- inductor (circuits with only inductors)
- mixed (circuits with a mix of capacitors, inductors, resistors)
- quickstart (circuits that shall be shown at the top as a preview selection, those are presolved files and limited to
  to the provided ones)
- resistor (circuits with only resistors)
- symbolic (circuits that have variables (R1, C1, L1, V1) as values (resistance, capacitance, voltage etc.))
  this only makes sense for small circuits and is likely to crash for capacitors and inductors
- wheatstone (the bridge circuit used for determining the value of an unknown resistor)
- magnetic (circuits that represent magnetic circuits)

Create circuit files that end with .txt and sort them into the according folders.
To host circuits with the simplipfy page, zip the folders or a subset of the folders into a file called
``Circuits.zip``. The zip file has to be in the Pyodide folder. If you arent sure where to place the file search for
``Circuits.zip`` in the distributed code. The zip file can be created with any zip program except powershell zip util.
Inside the zip there can either be a folder containing the folders above. This happens if you zip the folder containing
the folders mentioned above. Or you zip the folder directly so that the zip includes only the folders mentioned above.

Circuit file names
-------------------
In each folder there should be .txt files that define circuits using the :ref:`netlist notation <netlists>`.
The file names shall be structured like::

    <sorting, two digits>_<some name to identify>.txt
    e.g.
    00_resistor_easy.txt

if your name would use whitespaces use ``_`` instead.
For the file name on the webpage the leading digits until ``_`` are stripped, file endings are stripped and
all occurrences of ``_`` are replaced with whitespaces.
This would result in::

    resistor easy

for the example given above.
The stripped digits are used to guarantee the sorting you want. If you would like to sort alphabetically you can
remove the digits but have to keep a leading ``_``. The numbers used in a subfolder of Circuits have to be unique.

Host own circuit files
---------------------------

Create a venv to generate svg files
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
If you already set up a venv for developing you can use that and skip ahead to the next section.
Open a PowerShell. Create a python virtual venv with ``python -m venv ./circuitsGenVenv`` (this creates the venv in the
directory you are currently in). The venv has to be at least Python 3.8. Activate the venv with
``.\circuitsGenVenv\Scripts\Activate.ps1``. From `simplipfy packages <https://github.com/prof-sky/simplipfy/tree/main/Pyodide/Packages>`_
download:

- lcapyInskale
- schemdrawInskale

If you are not on the latest version take the packages from your download `path/to/sourceCode/Pyodide/Packages`
and save them where you created the venv. Alternatively you can replace ``.\`` with ``path\to\packages\`` and save
them wherever you want. Then run in Powershell::

    pip install .\schemdrawInskale-<version>-none-any.whl
    pip install .\lcapyInskale-<version>-none-any.whl

It is important to first install schemdrawInskale then install lcapyInskale. Otherwise the installation of lcapyInskale
might fail due to missing dependencies. Navigate into to <sourceCode>/Pyodide or simply Pyodide
(you should see e.g. the folders Circuits, Packages, Scripts, ...).

Generate svg files
~~~~~~~~~~~~~~~~~~~~~

With the venv where the packages lcapyInskale, schemdrawInskale, generalizeNetlistDrawing, simplipfy are installed,
execute from the project base directory::

    .\Scripts\generateSVGFiles.ps1

This might take some time and should produce output that looks like this::

    generating: Circuits\capacitor\00_capacitor_row3.svg
    generating: Circuits\capacitor\01_capacitor_parallel3.svg
    generating: Circuits\capacitor\07_capacitors_mixed_simple.svg
    ...

Package circuits to zip
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Now you have to zip the new circuits folder, commit and push your changes to GitHub. Don't forget to update your
gh-pages branch with ``git subtree push --prefix Pyodide origin gh-pages`` if you forked the repository. If you forked
and don`t update the gh-pages branch the changed circuits will not be on your GitHub Page. If you downloaded the source
code, pushing to the main branch of your repository will trigger the GitHub Page build. If you serve them via a http(s)
server, simply overwriting the Circuits.zip file will yield the new files on the webserver.

Upload own circuit files
---------------------------
In the tab custom circuits you can upload a circuit file (zip-file). The uploaded circuits are evaluated and shown on
the page ``custom circuits``. The circuits aren't persistent and will be removed if the page is reloaded, the tab is
closed or the browser is closed.