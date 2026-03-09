Language Management
====================

Structure
---------
The language files and Language Manager is under ``.../Inskale/Pyodide/src/scripts/languages``. Each language gets a
Folder with the official language abbreviation. A list of those abbreviations can be found on `Wikipedia`_.

.. _Wikipedia: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes

Ideally each page gets its own language file. Due to legacy code this is not always the case.
All files in the language folder are concatenated into one file e.g. for english ``lang.en.js``.
This shortens loading times.

Adding a new language
----------------------

If you add a new Language you have to add its abbreviation to ``.../Inskale/Pyodide/src/scripts/definitions/languageSymbols.js``.
This is necessary because not all languages are loaded at startup. English is always loaded any other language is
loaded on demand.

The simplest way to add a new Language is to copy an existing language and rename the folder and files.
In the ``.../Inskale/Pyodide/src/scripts/languages/languageManager.js`` you habe to adjust:

    - setLang(lang)
    - setBrowserLang()

And add:

    - setLang<lang abbreviation>() [e.g. setLangEn()]

Adjust the layout ``.../Inskale/Pyodide/index.html`` at the div with the id ``<div id="lang-dropdown" class="dropdown">``.
Adjust this <li> element::

     <li>
        <a id="select-english" class="d-flex lang-selector" style="text-decoration: none; color:white">
            <img src="src/resources/navigation/uk.png" class="flag my-auto mx-2" alt="englishFlag">
            <p class="my-auto" style="font-size: 20px">English</p>
        </a>
     </li>

Adjust the following things:

    - change the id from ``select-english`` to select-<newLanguageName>
    - add an flag image to ``.../Inskale/Pyodide/src/resources/navigation`` and adjust the img src link
    - change ``English`` in the <p> tag to the new language name

And copy it into the <ul> tag under the last <li> element in ``index.html``.

Adjust the dropdown in the Navigation sidebar at ``.../Inskale/Pyodide/src/pages/navigation/sideBar.js``

    - add class member: ``this.select<newLangName> = document.getElementById("select-<newLanguageName>");`` this references the <li> element created earlier and added to the ``index.html`` so the ids have to match. The class member is for internal use to avoid having to rewrite ``document.getElement...`` quite some times.

    - add a event listener for the added <li> element ::

        this.select<newLangName>.addEventListener("click",async () => {
            await languageManager.setLang<newLangAbbreviation>();
            pageManager.updateLang();
        })

How it works
-------------
Each text you see on simplipfy.org is loaded from a language file. Those language files consist of Objects like this::

    landingEnTexts = {
    startBtn:
        "START",
    landingPageGreeting:
        "a free browser tool for learning<br>" +
        "how to simplify electrical circuits",
    keyFeature1heading:
        "Understanding",
    ...
    }

those Objects always include the language abbreviation to distinguish between languages and avoid variable clashing in
the global scope.

The language objects are all combined in ``lang.<language abbreviation>.js``::

    window.english = {
        landingPage: landingEnTexts,
        selector: selectorEnTexts,
        alerts: alertsEnTexts,
        ...
    }

Each file must have the same structure otherwise the language switching won't work.

The LanguageManager class
--------------------------
The LanguageManager class is in ``.../Inskale/Pyodide/src/scripts/languages/languageManager.js``. It can be used in the
project to retrieve language strings from the language files. It always returns the correct string for the currently set
language. Each page and content uses the language manager to get the current language strings on the page setup and on
language updates that are triggered by a language change. To get a language string use::

    languageManager.currentLang...

this is a getter and returns a proxy. This way each call to a language is guarded and if it fails because a string is
not defined it automatically falls back to english. Therefore always implement new strings in english then in other languages.
If the string also is not in the english lang files it will warn in the console and return ``! undefined !`` as a string.