.. _CLI_Scripts:

CLI Scripts
============

Alias python ./Pyodide/Scripts/cli.py
--------------------------------------
On Windows you can use the powershell profile to set an alias function::

    Test-Path $PROFILE
    if returns False:
        New-Item -Path $PROFILE -ItemType File -Force
    notepad $PROFILE
    add:
        function simplipfy {...\inskale\simpliPFy\.venv\Scripts\python.exe ...\inskale\Pyodide\Scripts\cli.py @args}

this enables you to use the cli.py script anywhere without activating the venv. After you edited the values restart your
terminal or open a new one. The usage of the cli script then is::

    simplipfy [cmd] [options]
    e.g.
    simplipfy build localhost

This is already setup in the docker image / container. The documentation is using the alias described above if you
don't use the docker container and did not set an alias you always have to use the full path to the python venv.
The venv needs all dependencies installed. With the project interpreter this is then equivalent to::

    ...\inskale\simpliPFy\.venv\Scripts\python.exe ...\inskale\Pyodide\Scripts\cli.py build localhost

To use this command replace ... with the absolute path on your system.

To check if the function is recognized correctly type::

    simplipfy --version

You should get something like this as output::

    SimpliPFy CLI Script Version 1.0
    usage: simplipfy [cmd] [option] see documentation at docs.simpliPFy.org

.. seealso::

    :ref:`set_up_local_python_interpreter`


Main Script
-------------
The main script is at ``.../inskale/Pyodide/Scripts/cli.py``. The script can:

    - **build**
        - bundles
        - svgs (``--zip`` to also build Circuits.zip)
        - dist
        - localhost (``--port`` to host on different port than 8000, ``--bind`` to bind to different ip than 127.0.0.1)
        - simplipfy (``--version-change`` one of [noChange, patch, minor, major] default patch)
        - lcapy-inskale (``--version-change`` one of [noChange, patch, minor, major] default patch)
        - schemdraw (``--version-change`` one of [noChange, patch, minor, major] default patch)
    - **docs**
        - build (``--upload`` to upload to ``/docs`` on webserver and ``--localhost`` to host on ``localhost:7500``, ``--port`` to change port for local hosting, ``--bind`` to bind to different ip than 127.0.0.1)
        - upload
        - localhost (``--port`` to host on different port than 7500, ``--bind`` to bind to different ip than 127.0.0.1)
    - **release**
        - dev (``--sha`` specify the folder name, normally would be the hash of the git commit)
        - simplipfy (``--tag`` specify the folder name, normally would be the git tag)
    - **language**
        - build (``newLang`` 2 characters after iso 639 that specify the language to build, ``--override`` overrides existing files)
        - check (``--path`` path to the folder containing language folders, ``--mainLang`` one of [en, de] default en, specifies language to compare to, ``--noErrors``, don´t raise errors)
    - **hash**
        - simplipfy (``--include``, which files to include, default= :literal:`**/*.py`)
        - lcapy-inskale (``--include``, which files to include, default= :literal:`**/*.py`)
        - schemdraw (``--include``, which files to include, default= :literal:`**/*.py`)
    - --version (display the version of the cli script)

Paths are relative to project root, ``.../inskale``.

And combine it with the full path of the cli script to use the cli script. The example below refers to the interpreter
setup in the referenced section above::

    Full Path:
    ...\inskale\simpliPFy\.venv\Scripts\python.exe ...\inskale\Pyodide\Scripts\cli.py [args]
    Alias:
    simplipfy [args]

The documentation will continue to use the aliased version.

Command build
--------------
Command usage::

    simplipfy build ...

bundles
~~~~~~~~
cmd::

    simplipfy build bundles

uses the .buildBundles-files to group .js-files to <folder>.bundle.js.

.. note::

    see more at :ref:`bundle-last`

svgs
~~~~~~~~
cmd::

    simplipfy build svgs

Builds / generates the overview pictures of the circuits seen on learning page of simplipfy.org.
With the ``--zip`` flag the Circuits folder with the newly generated svg files will be zipped to ``Circuits.zip``

dist
~~~~~~~~
cmd::

    simplipfy build dist

Move all files needed for a release from the project to ``.../inskale/Pyodide/dist``. This expects:

    - the bundles to be build
    - the svgs to be generated
    - the circuits folder to be zipped.

localhost
~~~~~~~~~~
cmd::

    simplipfy build localhost

Setup a simple python http server on ``localhost:8000`` or the specified port with ``--port``. ``--bind`` bind to a
different ip than 127.0.0.1. Used in docker container to bind to 0.0.0.0 to make it accessible by the host.

Command docs
--------------
Command usage::

    simplipfy docs ...


build
~~~~~~~~
cmd::

    simplipfy docs build

Build the front- and backend documentation in ``.../inskale/simpliPFy/docs/_build``.
Use the ``--upload`` flag to upload the docs to ``/docs`` on the webserver.
Use the ``--localhost`` flag to also host on ``localhost:7500`` and ``--port`` to adjust the port. In the Docker-Container
you need to bind to a different ip this can be achieved with the ``--bind``. Bind to ``0.0.0.0`` in the Docker-Container.
This only is necessary when also local hosting the documentation.

upload
~~~~~~~
cmd::

    simplipfy docs upload

Upload the docs to ``/docs`` on the webserver

localhost
~~~~~~~~~~
cmd::

    simplipfy docs localhost

Setup a simple python http server on ``localhost:7500`` or the specified port with ``--port``. ``--bind`` bind to a
different ip than 127.0.0.1. Used in docker container to bind to 0.0.0.0 to make it accessible by the host.

Command release
-----------------
Command usage::

    simplipfy release ...


dev
~~~~~~~~
cmd::

    simplipfy release dev

Build bundles, svg-files, dist and copy them via ftp to ``/dev`` on the webserver.
With ``--sha`` the folder name in which it is put on the server can be specified. By default this is the commit hash
of the git commit if it is executed by the runner or the value set for ``CI_COMMIT_SHA`` in the .env file.

dev
~~~~~~~~
cmd::

    simplipfy release simplipfy

Build bundles, svg-files, dist and copy them via ftp to ``/simplipfy`` on the webserver.
With ``--tag`` the folder name in which it is put on the server can be specified. By default this is a git tag
if it is executed by the runner or the value set for ``CI_COMMIT_TAG`` in the .env file.


simplipfy
~~~~~~~~~~
cmd::

    simplipfy release simplipfy

Build bundles, svg-files, dist and copy them via ftp to ``/simplipfy`` on the webserver

Command language
------------------
Command usage::

    simplipfy language ...

check
~~~~~~~~
cmd::

    simplipfy language check

checks if the languages differ from the main language, by default it compares to english (en).
Can be adjusted with ``--mainLang / -l`` valid choices are [en, de]. Raises errors if files or keys are missing,
can be avoided using ``--noErrors / -e``. Checks the default language folder, can be adjusted with ``--path``.

build
~~~~~~~~
cmd::

    simplipfy language build

Builds a new language by copying the english language and adjusting the necessary keys. Results in a blueprint
that has to be translated from english to the new language. Can also be used to generate missing files in existing languages.

Command hash
-------------

    simplipfy hash ...

This is used to generate the hash of the python packages developed within this project. It is used to assert
packages are up to date before a release.

simplipfy
~~~~~~~~~~
cmd::

    simplipfy hash simplipfy

Hashes the python package simplipfy at ```.../inskale/simpliPFy/simplipfy``

lcapy-inskale
~~~~~~~~~~~~~
cmd::

    simplipfy hash lcapy-inskale

Hashes the python package lcapy-inskale at ```.../inskale/lcapy-inskale/lcapyInskale``

schemdraw
~~~~~~~~~~
cmd::

    simplipfy hash schemdraw

Hashes the python package simplipfyInskale at ```.../inskale/Schemdraw/schemdrawInskale``

--version
~~~~~~~~~~
cmd::

    simplipfy --version

Print version info of the script.

Scripts in cli folder
----------------------
Those scripts offer more flexibility when called if you want to alter paths. This might cause reference or file not
found errors.

buildBundles.py
~~~~~~~~~~~~~~~~
With the ``-src`` flag you can specify the topmost folder to scan for ``.bundleLast`` files is set to
``.../inskale/Pyodide/src`` by default.

buildDocs.py
~~~~~~~~~~~~~~~~
Build the front- and backend documentation in ``.../inskale/simpliPFy/docs/_build``.
Use the ``--upload`` flag to upload the docs to ``/docs`` on the webserver.

generateSVGFiles.py
~~~~~~~~~~~~~~~~~~~~
With the ``-path`` argument you can specify the folder for which the svg files are generated. Is set to
``.../inskale/Pyodide/Circuits`` by default. The specified folder has to follow the structure defined at -insert link-

makeDist.py
~~~~~~~~~~~~~~~~
With the ``-src`` argument you can specify the folder that is used as source, is set to ``.../inskale/Pyodide``
With the ``-dst`` argument you can specify the folder that is used as destination, is set to ``.../inskale/Pyodide/dist``

release.py
~~~~~~~~~~~
Build bundles, svg-files, dist and copy them via ftp to the webserver
``--target dev`` -> ``/dev`` on the webserver
``--target simplipfy`` -> ``/simplipfy`` on the webserver

startServer.py
~~~~~~~~~~~~~~~
takes no arguments, starts the server at ``localhost:8000``
