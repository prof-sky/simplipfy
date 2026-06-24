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
