Common Issues and Fixes
=======================
If you encounter an error copy it into the search bar (strg+f). Error messages are fully written in this section this
should make them searchable.

error: 'lcapy-inskale' does not have a commit checked out
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
::

    error: 'lcapy-inskale' does not have a commit checked out
    fatal: updating files failed

is caused by the uninitialized submodule lcapy-inskale run the following git commands to solve this issue ::

    git submodule init
    git submodule update --recursive --remote

