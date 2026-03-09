.. _host:

Host
====

Host SimpliPFy generally
-------------------------
To host SimpliPFy you need a webserver that serves files. The files you need to serve are located in::

   .../inskale/Pyodide/dist

Host SimpliPFy with Python simple http server
----------------------------------------------
To host simplipfy locally with use the cli script with::

    simplipfy build localhost

this executes a simple http server on port 8000 with gzip compression.SimpliPFy is then hosted on::

    http:\\localhost:8000

It is important to go to ``http:\\`` and not ``https:\\`` because the simple http server does not support the https protocol.
Generally you can host simplipfy with any webserver. The current .htaccess files are buidl for a
apache webserver and work with the python simple http server and a apache web server.

GitHub Pages
-------------
<coming soon>
An easy way to self host simplipfy is to create a GitHub repository. Then download the link to the prebuild simplipfy page
from here<insert link> and push it into your repository on the main branch. In your GitHub repository go to settings ->
pages. On this site is a section called Source this has to be ``deploy from a branch`` and in the section
Branch select branch ``main`` and ``/root``, press save. Your own instance of simplipfy is available after GitHub build
your page. The page build usually takes about 2 - 4 minutes.
The link of your site is::

    https://<GitHub user name>.github.io/<repository name>/

