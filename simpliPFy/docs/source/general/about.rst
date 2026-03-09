About
=======

Simplipfy is the Python package that handles the backend for the webpage `www.simplipfy.org <https://www.simplipfy.org/>`_.
Its implemented using slightly modified Versions of Schemdraw (`original Package <https://github.com/cdelker/schemdraw>`_)
and Lcapy (`original Pacakge <https://github.com/mph-/lcapy>`_).
Lcapy was modified to support stepwise simplification of circuits. This is used to solve circuits interactively.
Schemdraw was modified to add classes and IDs to the generated path elements inside the svg files. This is used to retrieve
information about the element the user is interacting with on the webpage.

Aim
------
The simpliPFy project aims to provide a interactive scalable learning environment (inskale) that allows students to
deepen their understanding on basic electronic topics. Currently those topics are supported:

- simplification of circuits with an analytical method
- ohms law
- complex voltage and current calculation
- Kirchhoff's laws
- Wheatstone bridge

For each topic a set of exercises is provided. The Tool is not limited to those exercises.
New exercises can be provided as an netlist file with the file format .txt. For more information see the
documentation.

Release
-------------
The most recent release is available to the public at `www.simplipfy.org <https://www.simplipfy.org>`_. Feel free to use this
link we appreciate traffic on our site. If you want to use customized circuits either self host or use the local file
import on the website.

Documentation
--------------
| The documentation can be found at:
| `docs.simplipfy.org <https://docs.simplipfy.org>`_