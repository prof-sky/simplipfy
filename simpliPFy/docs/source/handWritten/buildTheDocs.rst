Build the documentation
=========================
Run ::

    sphinx-apidoc -f -o .\docs .\simplipfy\

to build the API documentation. This uses the Docstrings in the simplipfy module.
Then run ::

    .\docs\make.bat html .\docs .\docs\_build

to build the HTML documentation and combine the handwritten files with the API. The make.bat
file has a copy directive included and otherwise is identical to ``sphinx-build -b html .\docs .\docs\_build``. The copy
directive asserts that the readme.rst and ``.\docs\source\handWritten\about.rst`` don`t diverge.