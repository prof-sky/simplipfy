Host
====

Host SimpliPFy generally
~~~~~~~~~~~~~~~~~~~~~~~~~
To host SimpliPFy you need a webserver that serves files. The files you need to serve are located in::

    path/into/cloned/repo/Pyodide

| or directly from GitHub at:
| `https://github.com/prof-sky/simplipfy/tree/main/Pyodide <https://github.com/prof-sky/simplipfy/tree/main/Pyodide>`_
| if you copy those files onto a webserver the webpage will work.

Host SimpliPFy with Python simple http server
~~~~~~~~~~~~~~~~~~~~~~~~~
To host simplipfy locally with python have to go to the Pyodide Folder and execute ``StartServer.ps1``
found at::

    path/into/cloned/repo/Pyodide/Scripts

this executes a simple http server on port 8000 with gzip compression.SimpliPFy is then hosted on::

    http:\\localhost:8000

It is important to go to ``http:\\`` and not ``https:\\`` because the simple http server does not support the https protocol.
To automate starting the server the ``StartServerProcess.ps1`` and ``StopServerProcess.ps1`` may be helpful.
``StartServerProcess.ps1`` starts a process and retrieves the process id and saves it into ``server.pid``, which
``StopServerProcess.ps1`` uses to stop the process if the process is still running. ``StartServerProcess.ps1`` calls
``StopServerProcess.ps1`` when ``server.pid`` is in the directory.

Host SimpliPFy with GitHub Page
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Most recent version
""""""""""""""""""""
| To host via GitHub Pages go to:
| `https://github.com/prof-sky/simplipfy/tree/main <https://github.com/prof-sky/simplipfy/tree/main>`_
This is the most recent version. Fork it to your own account under a name that fits for you. Note that the most recent
version is more likely to contain unknown bugs but might fix bugs you encountered in earlier versions. Clone the
repository onto your PC and configure the GitHub Page with the commands::

    git clone https://<yourGHUserName>/<repositoryName>.git
    git submodule init
    git submodule update --recursive --remote
    git subtree push --prefix Pyodide origin gh-pages

After GitHub finished the Page build process your self-hosted version of SimpliPFy is available under
``<yourUserName>/github.io/<repositoryName>`` or simply use the link on the main page of your repository under
``deployments``.

More stable version
""""""""""""""""""""
| More stable releases are found here:
| `https://github.com/prof-sky/simplipfy/releases <https://github.com/prof-sky/simplipfy/releases>`_
Choose the most recent tag and download the source code. Place the folder where you want it and extract it. Navigate
into the folder within your file system. Navigate into the subfolder Pyodide. Then push the contents of the Pyodide
folder into a new repository on your GitHub account. This can be achieved by following those git commands
Make sure you are in the Pyodide folder and open the git bash console::

    git init -b main
    git add .
    git commit . -m "self host simplipfy"
    git remote add origin <repo address e.g. https://github.com/<yourGHUserName>/<yourProjectOnGH>.git>
    git push origin main

Go to your repository on GitHub and navigate to ``Settings (Repository Settings)``. There choose the submenu ``Pages``.
Under ``Build and deployment`` set ``Source`` to ``Deploy from branch`` and configure ``Branch`` to ``main/root``
and save. After GitHub finished the Page build process your self-hosted version of SimpliPFy is available under
``<yourUserName>/github.io/<repositoryName>`` or simply use the link on the main page of your repository under ``deployments``.