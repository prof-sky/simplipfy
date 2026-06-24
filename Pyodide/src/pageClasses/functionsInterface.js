/**
 * Base class for all Pages and Content. Each element of a page shall be derived by this base class
 * to assert this function set is always callable.
 * Shall be treated as an interface creating instances of this class makes no sense.
 * @abstract
 */
class FunctionsInterface {
    /**
     * create the element that is added to the dom, if nothing is added to the dom return a DocumentFragment
     * @virtual
     * @returns {Element | DocumentFragment}
     */
    setup(){
    }

    /**
     * updates language specific strings
     * @virtual
     */
    updateLang(){
    }

    /**
     * updates elements that need special color and are not effected by the bootstrap mode change
     * @virtual
     */
    updateColor(){
    }

    /**
     * adds the event listeners to the element that was set up with this.setup()
     * @virtual
     */
    addEventListeners(){
    }

    /**
     * Executes code that depends on Pyodide fully loaded.
     * Is called after Pyodide is ready and makes changes to the element created with
     * this.setup() that can only be active or made after Pyodide is loaded. Is called by {@link PageManager} as soon as
     * Pyodide is ready.
     * @virtual
     */
    afterPyodideLoaded(){
    }

    /**
     * Is called after the Page is usable by PageManager and is the set-up of funny functionality but not necessary
     * for function of page.
     * @virtual
     */
    setupEasterEggs(){
    }
}