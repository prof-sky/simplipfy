# Setup lokal git copy
```
git clone --recursive https://gitlab.hs-pforzheim.de/stefan.kray/inskale.git
```
the `--recursive` keyword is important, to clone the submodule lcapy-inskale
## Structure
There are three folders inside the InskaLE Project.
- lcapy-inskale: is a submodule that includes a fork of the lcapy GitHub repository to merge changes and updates easily.
The submodule has to branches, the master which is the same as the fork from original repository and the lcapy-inskale
branch which hold the modifications for this project. 
- Pyodide: includes all files that are needed to host pyodide and execute the lcapy package in a browser to simplify
circuits
- Schemdraw: a slightly modified version of the Schemdraw package

# Set up local Python interpreter
## install modified lcapy and schemdraw
```
cd .\path\to\inskale-git-repo\Inskale
pip install -e .\lcapy-inskale
pip uninstall schemdraw
pip install -e .\schemdraw
```
the `-e` keyword is only necessary if you want to automatically apply changes to the packages without
reinstalling them or modify them yourself

## Required packages
The lcapy package needs:
- matplotlib
- numpy
- sympy>=1.10.1
- networkx
- IPython
- setuptools
- wheel
- property_cached
- (schemdraw) don't download package from pypi
- ordered_set

for testing:
- pytest
- flake8
- flake8-bugbear
- flake8-comprehensions
- flake8-requirements

for releasing:
- wheel
- twine

The schemdraw package needs:
- matplotlib>=3.4
- ziafont>=0.8
- ziamath>=0.10
- latex2mathml

Some IDEs read the `setup.py` and `setup.cfg` and offer to auto install needed packages.
The necessary packages should be installed from the step before, so don't install them by hand.

# Build packages
in each package folder is a `buildPackage.ps1`. Those files build the package and in case
of the lcapy-inskale package it also tests it before it gets build. The new build package is modved
to Pyodide/Packages and the Pyodide/solve.py is updated automatically and annotated with the current
Package version

# Host inskale locally
To host inskale locally you only have to go to the Pyodide Folder and execute `StartServer.ps1`
this executes a simple http server integrated with Python. It executes it from a script called
`GzipSimplePythonHttpServer.py` to support Gzip compression for .whl-Files. Inskale is then hosted on 
`http:\\localhost:8000`. It is important to go to `http:\\` and not `https:\\` because the simple http server does
not support the https protocol. For an integration into an IDE it the `StartServerProcess.ps1` and 
`StopServerProcess.ps1` may be helpful. `StartServerProcess.ps1` starts a process and retrieves the process id and saves
it into `server.pid`, which `StopServerProcess.ps1` uses to stop the process if the process is still running. 
`StartServerProcess.ps1` calls `StopServerProcess.ps1` when `server.pid` is in the directory. Some IDEs can be
configured to execute a skript before executing code so the Server can be started before the IDE accesses
`http:\\localhost:8000` to debug and test inskale.