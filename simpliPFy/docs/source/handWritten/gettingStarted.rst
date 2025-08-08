Getting started
===============

.. include:: gitRepos.rst

Setup local copy of git repository
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
For the latest release copy from::

    git clone --recursive https://github.com/prof-sky/simplipfy.git

As a contributor from University of Applied science Pforzheim copy from::

    git clone --recursive https://gitlab.hs-pforzheim.de/stefan.kray/inskale.git

After March 31, 2026 the project will be open for contributions on GitHub.

Set up local Python interpreter (for development)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Using script
""""""""""""""""""""""""""""""""
The Script ``setupDevInterpreter.ps1`` creates a folder .venv in the subfolder simpliPFy. Execute the Script to setup
the dev Interpreter. The execution policy has to be unrestricted (``Set-ExecutionPolicy unrestricted``), you will need
administarator prvilileges to do so. And Python has to be installed and available in the system path variable.

Manual steps
""""""""""""""""""""""""""""""""

It is recommended to use a virtual environment for the development of the project. This can be done using ``venv`` or ``conda``.
The process is automated with the script ``setupDevInterpreter.ps1`` in ``Inskale\simpliPFy`` using venv. The script creates
a virtual environment in ``Inskale\simpliPFy\.venv``. Navigate into ``path\to\project\Inskale\simpliPFy``.
Then create the venv with::

    python -m venv .venv

Then activate the virtual environment::

    .\.venv\Scripts\activate

This creates a virtual environment in the folder ``.venv`` at the current location. The virtual environment is
activated by running the script ``.\.venv\Scripts\Activate.ps1``. This changes the command line promt and a green ``(.venv)``
should appear infornt of the current line.
With the active venv navigate into the root of this project ``path\to\project\Inskale\``. The order of istalling
the packages is important! To install the packages run::

    pip install -e .\Schemdraw
    pip install -e .\lcapy-inskale
    pip install .\Pyodide\Packages\generalizenetlistdrawing-<look for current Version>.whl
    pip install -e .\simplipfy

the ``-e`` flag is for editable mode. This means that the package is installed in a way that local changes are immediately
applied for the virtual environment interpreter.

Build Packages
"""""""""""""""
in each package folder (lcapy-inskale, Schemdraw, simplipfy) is a `build<someName>.ps1`. Those files build the package
and the build package is moved to Pyodide/Packages. If the distribution has files that depend on the package version
those files are updated as well (simplipfy updates some files in Pyodide/ ).