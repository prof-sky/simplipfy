Getting started
===============

.. include:: gitRepos.rst

Setup local copy of git repository
------------------------------------
For the latest release copy from::

    git clone --recursive https://github.com/prof-sky/simplipfy.git

As a contributor from University of Applied science Pforzheim copy from::

    git clone --recursive https://gitlab.hs-pforzheim.de/stefan.kray/inskale.git

After June 30, 2026 the project will be open for contributions on GitHub.

Docker Image
-------------
If you dont want to setup a local interpreter and developing environment you can use the prebuild docker image.
You need a working installation of docker desktop and docker desktop needs to be running for the next steps.
Execute while in ``.../inskale``::

     docker build -t simplipfy:0.3 .

This builds the docker image on your PC and may take some time. After that execute::

    docker run -it -p 8080:80 -p 8000:8000 -p 7500:7500 -v "./:/src" simplipfy:0.3

This will start the docker container. When the starting process is finished you will enter the shell of the docker
container. The starting process does take some time due to installation of editable packages simpliPFy, lcapy-inskale,
schemdraw and simplipfyBuildTools. In the container there also is a apache server installed to test ftp uploads with cli
scripts. The apache server is accessible at host machine at localhost:8080.

    - localhost:8080/dev for development
    - localhost:8080/simplipfy for releases (minified files)
    - localhost:8080/docs for documentation
    - localhost:8000 for python http server (similar to localhost:8080/dev)
    - localhost:7500 for python http server (similar to localhost:8080/docs)

Files can also be hosted with a python simple http server. This cuts out the ftp upload to the apache server.
To reach the python simple http servers from the host machine they have to be bound to 0.0.0.0 like this::

    simplipfy build localhost --bind 0.0.0.0 # accessible at localhost:8000
    simplipfy docs localhost --bind 0.0.0.0 # accessible at localhost:7500

Don't change the ports inside the docker container otherwise you won't reach them from the host machine without
changing the ``docker run`` command. All changes made to the project are reflected into the container without a restart.
Restarting the container is time consuming due to installing editable python packages that are linked to the host machine.

For using the internal apache and ftp server in the docker image create a ``.env`` file at ``.../inskale/Pyodide/Scripts``
and add the following text to it::

    API_SECRET="some-secret"
    FTP_FOLDER="/simplipfy"
    FTP_FOLDER_RELEASE="/simplipfy"
    FTP_FOLDER_DEV="/dev"
    FTP_FOLDER_DOCS="/docs"
    FTP_PASS="ftp-pass"
    FTP_SERVER="127.0.0.1"
    FTP_USER="ftp-user"
    CI_COMMIT_SHA="test_commit_sha"
    CI_COMMIT_TAG="test_commit_tag"
    DB_NAME="some-db-name"
    DB_USER="some-db-user"
    DB_PASSWORD="some-db-password"

.. seealso::

    :ref:`CLI_Scripts`

.. _set_up_local_python_interpreter:

Set up local Python interpreter (for development)
----------------------------------------------------
This section explains how to setup a python interpreter that can execute the packages of this project. The Packages are
installed in the editable mode this allows for changes in the packages that take effect without a reinstall of the
package. First try `Using script`_ if that fails you can use `Manual steps`_ for the setup. If you want to run a python
script from this project use the venv that was setup in this section. The venv is located at .../inskale/simpliPFy/.venv
after the setup script was executed. If you use an ide set this venv as the standard interpreter, if possible.

Using script
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
The Script ``setupDevInterpreter.ps1`` creates a virtual environment in the folder .venv in the subfolder simpliPFy. The script is located in ``...\inskale\simpliPFy\setupDevInterpreter.ps1``. Execute the Script to setup
the dev Interpreter. The execution policy has to be unrestricted (``Set-ExecutionPolicy unrestricted``), you will need
administarator prvilileges to do so. And Python has to be installed and available in the system path variable.

Manual steps
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

It is recommended to use a virtual environment for the development of the project. This can be done using ``venv`` or ``conda``.
The process is automated with the script ``setupDevInterpreter.ps1`` in ``Inskale\simpliPFy`` using venv. The script creates
a virtual environment in ``Inskale\simpliPFy\.venv``. Navigate into ``path\to\project\Inskale\simpliPFy``.
Then create the venv with::

    python -m venv .venv

Then activate the virtual environment::

    .\.venv\Scripts\activate

This creates a virtual environment in the folder ``.venv`` at the current location. The virtual environment is
activated by running the script ``.\.venv\Scripts\Activate.ps1``. This changes the command line prompt and a green
``(.venv)`` should appear in front of the current line.
With the active venv navigate into the root of this project ``path\to\project\Inskale\``. The order of installing
the packages is important! To install the packages run::

    pip install -r requirements.txt
    pip install -e .\Schemdraw
    pip install -e .\lcapy-inskale
    pip install .\Pyodide\Packages\generalizenetlistdrawing-<look for current Version>.whl
    pip install -e .\simplipfy
    pip install -e .\Pyodide\Scripts

the ``-e`` flag is for editable mode. This means that the package is installed in a way that local changes are immediately
applied for the virtual environment interpreter.

.. _ref_build_python_packages:

Build python packages (simpliPFy, lcapy, schemdraw)
-----------------------------------------------------
in each package folder (lcapy-inskale, Schemdraw, simplipfy) is a `build<someName>.ps1`. Those files build the package
and the build package is moved to Pyodide/Packages. If the distribution has files that depend on the package version
those files are updated as well (simplipfy updates some files in Pyodide/ ).

Alias python interpreter (venv)
--------------------------------
To make it easier to use the interpreter created with ``setupDevInterpreter.ps1`` consider setting an alias.
For windows this works like this::

    Test-Path $PROFILE
    if returns False:
        New-Item -Path $PROFILE -ItemType File -Force
    notepad $PROFILE
    add:
        Set-Alias simplipfyVenv ...\inskale\simpliPFy\.venv\Scripts\python.exe
        Set-Alias simplipfyPip ...\inskale\simpliPFy\.venv\Scripts\pip.exe

now you can use the venv with::

    simplipfyVenv ...

and the pip of the venv with:

    simplipfyPip ...

and it is persistent to reboots of the terminal and the system