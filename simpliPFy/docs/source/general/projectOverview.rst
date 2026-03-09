General
========

.. image:: /_static/techStack.svg

In the image above you can see a abstracted representation of the tech stack used for this project.
On the left side the visual representation as show in the web browser. To its right the fundamental technology
that enables this project, Pyodide. Pyodide is a python interpreter ported to webassembly and enables us to
use python code and packages in the web browser. With Pyodide the python package simplipfy is loaded. This package is
programmed within the scope of this project and developed for the simplipfy.org website. The simplipfy package uses
modified versions of lcapy and schemdraw. When pyodide is loaded the packages from ``.../inskale/Pyodide/Packages`` are
installed into the Python interpreter that is used in the web browser. If you make changes to any of the packages
(simplifpy, lcapy or schemdraw) you have to rebuild those packages and replace the versions in the
Packages folder mentioned earlier. Each package has a build<someName>.ps1 that does that automatically.

.. seealso::
    :ref:`ref_build_python_packages`
