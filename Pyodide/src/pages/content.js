/**
 * Base class for Content. Content is everything display on a Page. A Page can be made up of multiple contents.
 * Contents are not reusable because they have a fixed id. The Content implements the same functions as a Page to
 * outsorce the knowledge how to change color, language or setup of content from the page to the content.
 * @abstract
 * @extends FunctionsInterface
 */
class Content extends FunctionsInterface{
    /**
     * string is an id used for an element in the dom that displays a language string. The
     * language string is retrieved dynamically from the {@link LanguageManager} and put as innerHTML of the element
     * if {@link Content.updateLang} is called
     * @type {Map<string, function>}
     */
    idLangMap;
    /**
     * the id of the element in the dom that holds this content
     * @type {string}
     */
    mainID;

    /**
     * @param idLangMap {Map<string, function>} {@link Content.idLangMap} map of id and associated language string
     * @param mainID {string} id of the element in the dom that holds this content
     */
    constructor(idLangMap, mainID) {
        super();
        this.mainID = mainID;
        this.idLangMap = idLangMap;
    }

    /**
     * iterates over each id specified in {@link Content.idLangMap} and reassigns the current language string to the
     * innerHTML of the element retrieved from the dom with document.getElementById(id)
     */
    updateLang(){
        for (const [id, lang] of this.idLangMap.entries()){
            let elm = document.getElementById(id)
            elm.innerHTML = lang()
        }
    }

    /**
     * updates the color of elements, text or headings if necessary
     */
    updateColor() {
        // on default no color changes necessary
    }

    /**
     * adds event listeners to elements if necessary
     */
    addEventListeners(){
        // on default no event listeners to add
    }

    afterPyodideLoaded() {
        // on default nothing to do after pyodide is loaded
    }

    /**
     * adds the innerHTML to an HTML element that indicate the loading progress of Pyodide
     * @param startBtn {HTMLButtonElement}
     */
    showStartBtnProgressBar(startBtn) {
        startBtn.innerHTML = `
                            <div class="fill-layer"></div>
                            <div class="progress-stripes"></div>
                            <span class="button-text">start</span>`;
    }

    /**
     * removes the containers added with {@link Content.showStartBtnProgressBar} and activates the button
     * @param startBtn
     */
    showStartBtnEnabled(startBtn) {
        startBtn.innerHTML = "start";
        startBtn.classList.remove("disabled");
        startBtn.style.backgroundColor = colors.definitions.keyYellow;
    }

    /**
     * generate a start button that can display the loading progress of Pyodide
     * @param id {string} id of the element in the dom
     * @returns {HTMLButtonElement}
     */
    createStartBtn(id) {
        let startBtn = document.createElement("button");
        startBtn.type = "button";
        startBtn.id = id;
        startBtn.classList.add("btn", "btn-warning", "circuitStartBtn", "my-3", "mx-auto", "disabled");
        startBtn.style.display = "block";
        return startBtn;
    }

    setupEasterEggs(){

    }
}