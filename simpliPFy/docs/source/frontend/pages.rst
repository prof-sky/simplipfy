Pages
===============

Overview
-----------------

`simpliPFy <https://www.simplipfy.org>`_  is a single page application. This is due to the loading times of
`Pyodide <https://pyodide.org/en/stable/>`_. Pyodide is used in for the calculations and simplifications. Pyodide is a
Python interpreter ported to Webassembly. It is easiest to avoid reloading Pyodide by not changing the webpage while
navigating. For intuitivity the simplipfy.org appears to have pages. This is realised by containers in the index.html
file. ::

    <!--####################################################################################################
    ####################################        Landing page       #########################################
    #####################################################################################################-->
    <div class="container-fluid m-0 p-0 text-center justify-content-center" id="landing-page-container"></div>

In the comment the page name is noted to structure the index.html. The container beneath represents a page.
To show a page the style attribute is set to ``block``. To hide a page the style attribute is set to ``none``.

The logic of the pages is encapsulated in the ``Pages`` class. A Page needs to do the following basic things:

- show
- hide
- update Language
- update Color ( change from dark to light mode or vise versa)

A ``Page`` displays some content. The content on a ``Page`` has some functions in common with the Pages, like
changing color and language. Therefore the ``Pages`` and ``Content`` share the same base class ``FunctionsInterface``.
In JavaScript there are no Interfaces but the class shall be treated as one. It does not make sense to create
instances of the ``FunctionsInterface`` class. But it "asserts" that each child has common functions that can be called.
(If you update the picture below make sure it has as viewbox attribute to assert the whole picture is shown)

.. raw:: html

   <div class="svg-lightbox">
     <img src="/_static/PageStructure.svg" alt="diagram" class="lightbox-trigger">
     <div class="lightbox-modal">
       <span class="close-btn">&times;</span>
       <img class="lightbox-content" src="/_static/PageStructure.svg">
     </div>
   </div>

A ``Page`` is made up of ``Content``. Because ``Content`` and ``Page`` share the same base functions like ``updateLang()`` and
``updateColor()`` a Page does not need to know how the Content it displays behaves on changes it simply calls the
implementation of the ``Content``. This asserts consistency throughout the code if ``updateLang()`` on a ``Page``
is called that means ``updateLang()`` is called on each ``Content`` the ``Page`` displays. The ``FunctionsInterface``
may be extended if there are actions that make sense on a ``Page`` and the ``Content`` it displays. The diagram
may be outdated if you need the functions on each class see the API-Documentation.

Implement new Page
-----------------------

At ``.../Inskale/Pyodide/src/pages/template`` are templates for:

- page implementation
- content implementation
- modal implementation

Implement the specified functions, add new ones if necessary or usefull for the implementation of the ``Page``.
Always see the base implementation maybe this does all you need. Always call the base implementation to assert
class internal values are set i necessary.

Setup
~~~~~~~~
use the super.beforeSetup() and the super.afterSetup as shown in the template::

    setup() {
        if (!super.beforeSetup()) return;
        //class specific setup of content
        super.afterSetup();
    }


setup adds the html code element of the page to the index.html
super.beforeSetup asserts:

- that the setup wasn't already started
- the page div is hidden.

super.afterInit asserts:

- that the eventlisteners are added to the page (only possible after the setup)
- that the internal values of the class represent that the class was setup

Initialize
~~~~~~~~~~~~

use the super.beforeInit() and the super.afterInit as shown in the template::

    async initialize() {
        if (!super.beforeInit()) return awaitVal(() => this.isInitialized, () => {}); //this could create an endless wait if a class is not setup and the init is not called again
        // class specific init of content
        super.afterInit();
    }

initialize generates or updates elements that wait for other values, files or data and therefore is async.
If called twice returns a promise which resolves when the page is initialized and therefore ready to be displayed.

super.beforeInit asserts:

- that the init wasn't already started
- the page is setup (if not calls the setup with a warning)

super.afterInit asserts:

- that the internal values of the class represent that the class was initialized
- updates the color of the page
- updates the language of the page