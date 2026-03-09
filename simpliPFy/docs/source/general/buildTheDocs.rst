=================
Documentation
=================

Setup
=========================
Python
--------
The build process relies on ``sphinx`` and uses the ``sphinx-rtd-theme``.
Those packages are installed by ``setupDevInterpreter.ps1`` else execute::

    pip install sphinx
    pip install sphinx-rtd-theme

to setup your python interpreter.

Typedoc
--------
To document the js-Frontend ``Typedoc`` is used.
For the package to work you need a working installation of node.js that is available in the terminal used to create the
documentation. ::

    npm --version

has to produce a output like ``10.9.3`` whereas the specific version does not matter.
then install typedoc with ::

    npm install typedoc typescript --save-dev

Assert that ::

    npx typedoc --version

produces output like::

    TypeDoc 0.28.17
    Using TypeScript 5.9.3 from ./node_modules/typescript/lib

versions must not match.

Build the documentation
=========================
Run ::

     python .../Inskale/Pyodide/Scripts/buildDocs.py

That will build
    - python API Documentation of simplipfy package
    - python documentation of handwritten files in ``.../Inskale/simplipfy/docs/source``
    - js API Documentation of the front end

the front end documentation is then copied from ``.../Inskale/Pyodide/src/docs`` to
``.../Inskale/simplipfy/docs/_build/source/frontendAPI``. All files that need to be released for the new documentation
are in ``.../Inskale/simplipfy/docs/_build``.

Manually create the documentation
==================================

Navigate into ``.../Inskale/Pyodide/Scripts``. From there generate the documentation.
For the sphinx part run::

    sphinx-apidoc -f -o ../../simpliPFy/docs ../../simpliPFy/simplipfy
    sphinx-build -b html ../../simpliPFy/docs ../../simpliPFy/docs/_build

For typedoc navigate into ``.../Inskale`` and run ::

    npx typedoc --options simpliPFy/docs/typedoc.json --skipErrorChecking

There is no output expected if the generation succeeds.
We need to change the directory because the python build script has this directory as its working directory, otherwise
the relative path for typedoc from the typedoc.json at ``.../Inskale/simpliPFy/docs`` and sphinx are not correct.

Then move all files from ``.../Inskale/Pyodide/src/docs`` to .../Inskale/simplipfy/docs/_build/source/frontendAPI``
you may have to create the ``frontendAPI`` folder. All files needed for a new release of the documentation are now in
``.../Inskale/simplipfy/docs/_build``.

.. seealso::

    For generating, updating and locally testing the documentation
    :ref:`CLI_Scripts`