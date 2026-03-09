Server
=======
The simpliPfy.org project was developed and released using a simple http server. All scripts that release the
development or release versions access the webserver via ftp using the python ftp library.

Structure
----------
The folder structure on the webserver is:

    - dev
    - docs
    - matomo
    - simplipfy

dev:
The current development branch for testing accessible on dev.simplipfy.org

simplipfy:
The main release accessible on www.simplipfy.org

docs:
The documentation accessible on docs.simplipfy.org

matomo:
Data privacy conform, anonymous user tracking for site insights and optimizations with matomo