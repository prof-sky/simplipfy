Definitions
============
To avoid cluttering the window with variables the definitions used in this project are defined in files at
``.../Inskale/Pyodide/src/scripts/definitions`` and appended to an object called definitions shown with the example
of the allowed directory names of a circuit file::

    /** @type {{allowedDirNames: Object<string,string>}} */
    window.definitions = window.definitions || {};
    window.definitions.allowedDirNames = {
        quickstart: "quickstart",
        resistor: "resistor",
        symbolic: "symbolic",
        capacitor: "capacitor",
        inductor: "inductor",
        mixed: "mixed",
        kirchhoff: "kirchhoff",
        wheatstone: "wheatstone",
        magnetic: "magnetic"
    }

With the exception of the class ``ColorDefinitions``.