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
## 
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

Some IDEs read the setup.py and setup.cfg and offer to auto install needed packages.
If you auto install the packages you have to uninstall schamdraw to install the modified version.
The next step should also install all necessary packages, so don't install them by hand.

## install modified lcapy and schemdraw
```
cd .\path\to\inskale-git-repo\Inskale
pip install -e .\lcapy-inskale
pip uninstall schemdraw
pip install -e .\schemdraw
```
the `-e` keyword is only necessary if you want to automatically apply changes to the packages without
reinstalling them or modify them yourself
