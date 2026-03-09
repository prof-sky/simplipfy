let accordions = 0

/**
 * A selector is a wrapper for the combination of an accordion that has a carousel in each of its
 * elements. To use the bootstrap functionality of an accordion it needs unique ids. The selector class
 * generates unique ids on creation to avoid id collision.

 * The selector uses two classes to delegate functionality:
 * - SelectorCarousel
 * - CounterManager
 */

class Selector extends Content{

    idLangMap = new Map();
    /** @type {Map<string, HTMLDivElement>} */
    items =  new Map();
    /** @type {CounterManager} */
    counters;
    /** @type {Map<string, SelectorCarousel>} */
    carousels = new Map();
    /** @type {CircuitFilesManager} */
    circuitFiles;

    /**
     *
     * @param circuitFiles {CircuitFilesManager}
     * @param pageToShowAnimationOn {typeof Page}
     * @param idLangMap {Map<string, function>} filed ids to update with the language manager call to get language value
     */
    constructor(circuitFiles,pageToShowAnimationOn, idLangMap = undefined){
        if (!idLangMap){
            idLangMap = new Map([
                //["some-id", () => "languageManager.currentLang.somePage.someString"]
            ])
        }

        super(idLangMap, `acc-${accordions}`)
        this.accordionID = accordions;
        accordions++

        this.circuitFiles = circuitFiles
        this.counters = new CounterManager(this, pageToShowAnimationOn)

        this.accordionItem;
    }

    get accordionDiv(){
        return `
        <div class="accordion accordion-flush mt-5 mx-auto" style="max-width: 500px; color: ${colors.current.foreground}; background-color: ${colors.current.bsBackground}; opacity: 0.6"></div>`;
    }

    get accordionItem(){
        let tmp = document.createElement("template");
        tmp.innerHTML = `
        <div class="accordion-item inheritColors">
            <h2 class="accordion-header inheritColors" style="display: flex; justify-content: space-between; font-size: x-large;">
                    <button
                            style="color: ${colors.current.headingForeground};" 
                            class="accordion-button collapsed inheritBackground coloredHeading" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            aria-expanded="false"
                    >
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>
                        <span class="button-text">start</span>
                    </button>
                    <div class="my-auto counter-element d-inline-flex inheritColors" style="font-size: x-large;min-width: 50px;text-wrap: auto;">
                        <span class="inheritColors">-</span>
                        <span class="inheritColros">/</span>
                        <span class="inheritColors">-</span>
                    </div>
            </h2>
            <div class="accordion-collapse collapse inheritColors">
                <div class="accordion-body inheritColors">
                    <p class="inheritColors d-flex justify-content-center">${languageManager.currentLang.selector.loadingContent}</p>
                </div>
            </div>
        </div>
        `;
        return tmp.content.firstElementChild;
    }

    createNextCircuitBtn(){
        let nextCircuitBtn = document.createElement("button");
        nextCircuitBtn.id = "nextCircuitBtn";
        nextCircuitBtn.classList.add("btn", "btn-primary", "mt-3", "mx-auto");
        nextCircuitBtn.style.backgroundColor = colors.definitions.keyYellow;
        nextCircuitBtn.style.border = "none";
        nextCircuitBtn.style.color = colors.definitions.keyDark;
        nextCircuitBtn.style.width = "fit-content";
        nextCircuitBtn.innerHTML = languageManager.currentLang.simplifier.nextCircuit;

        nextCircuitBtn.addEventListener("click", async () => {

            let selectorGroup = state.currentCircuitMap.selectorGroup;
            this.carousels.get(selectorGroup).nextBtn.click();
            state.currentCircuitMap = state.currentCircuitMap.nextCircuitMap();
            SimplifierPage.showSimplifierPage(state.currentCircuitMap);
        });
        return nextCircuitBtn;
    }

    /**
     *
     * @param string {string}
     */
    #placeHolder(string){
        let placeholder = ""
        for (let i = 0; i < string.length; i++) {
            placeholder += "█"
        }

        return placeholder;
    }

    setIDs(element, key){
        let headings = languageManager.currentLang.selector.selectorHeadings
        element.id = `acc-${this.accordionID}-item-${key}`

        let accordionHeader = element.querySelector(".accordion-header")
        accordionHeader.id = `acc-${this.accordionID}-item-${key}-header`;

        let btn = accordionHeader.querySelector("button")
        btn.innerHTML = this.#placeHolder(headings[key]);
        btn.setAttribute("data-bs-toggle", "collapse");
        btn.setAttribute("data-bs-target", `#acc-${this.accordionID}-item-${key}-collapse`);
        btn.setAttribute("aria-controls", `acc-${this.accordionID}-item-${key}-collapse`);

        let collapsePart = element.querySelector(".accordion-collapse")
        collapsePart.setAttribute("data-bs-parent", `#acc-${this.accordionID}`)
        collapsePart.id = `acc-${this.accordionID}-item-${key}-collapse`


        let body = element.querySelector(".accordion-body");
        body.id = `acc-${this.accordionID}-item-${key}-body`;
    }

    /** @returns {HTMLDivElement} */
    setup() {
        let accordionDiv = document.createElement("template")
        accordionDiv.innerHTML = this.accordionDiv;
        accordionDiv.content.firstElementChild.id = `acc-${this.accordionID}`


        let ids = window.definitions.selectorIDs
        for (let _id of Object.values(ids)) {
            if (_id === definitions.selectorIDs.quickstart) continue;

            /** @type {HTMLDivElement} */
            let item = this.accordionItem;
            this.items.set(_id, item);

            this.setIDs(item, _id);

            accordionDiv.content.firstElementChild.appendChild(item);
        }

        return accordionDiv.content.firstElementChild;
    }

    addDoneToClassList(identifier, idx){
        let carouselItem = this.carousels.get(identifier).indicatorsDiv.children[idx]
        if (carouselItem.classList.contains('active')) {
            carouselItem.classList.remove('active');
            carouselItem.classList.add("done");
            carouselItem.classList.add('active');
        }
        else {
            carouselItem.classList.add("done");
        }
    }

    async init(){
        if (!this.circuitFiles.loaded) {
            console.log("Circuits not loaded yet - waiting until init loaded");
            awaitVal(() => this.circuitFiles.loaded, () => this.init.bind(this));
            return;
        }

        //hide unused selectors
        let circuitSetKeys = this.circuitFiles.keys
        for (let key of this.items.keys()){
            if (!circuitSetKeys.includes(key)){
                let item = this.items.get(key);
                item.style.display = "none";
            }
        }

        // circuits need to be pre generated for this to work before pyodide has loaded
        for (let circuitSet of this.circuitFiles.circuitSets) {
            let identifier = circuitSet.identifier

            if (identifier === window.definitions.selectorIDs.quickstart) continue;

            let item = this.items.get(identifier);
            let body = item.querySelector(".accordion-body");
            this.carousels.set(circuitSet.identifier, new SelectorCarousel(body, circuitSet, this));
            let carousel = this.carousels.get(circuitSet.identifier);
            await carousel.init()

            this.counters.add(item.querySelector(".counter-element"), identifier);
            this.counters.update(identifier);
            carousel.selectCircuitInCarousel();
        }
        this.counters.hasAllElements = true;

        document.getElementById(this.mainID).style.opacity = "1";

        if (state.pyodideReady){
            document.getElementById(this.mainID).querySelectorAll(".circuitStartBtn").forEach( btn => {
                btn.classList.remove("disabled");
                btn.style.backgroundColor = colors.definitions.keyYellow;
            })
        }
    }

    saveFinishedCircuit(updateCounter=true){
        let identifier = state.currentCircuitMap.selectorGroup;
        let hash = this.circuitFiles.hash
        let saveName = state.currentCircuitMap.saveName;

        // Add circuit filename to storage doneCircuits-identifier
        let doneCircuits = storageManager.circuitsDone.loadValue(hash, identifier)
        if (doneCircuits.includes(saveName)) return; // already finished once

        this.addDoneToClassList(identifier, state.currentCircuitIndex)
        storageManager.circuitsDone.setValue(hash, identifier, saveName)

        if (updateCounter) this.counters.update(identifier);
    }

    /**
     *
     * @param identifier {window.definitions.selectorIDs}
     */
    updateCounter(identifier){
        this.counters.update(identifier);
    }

    updateColor() {
        let acc = document.getElementById(this.mainID)
        acc.style.color = colors.current.foreground;
        acc.style.backgroundColor = colors.current.bsBackground;

        document.getElementById(this.mainID).querySelectorAll(".coloredHeading").forEach(
            heading => {
                heading.style.color = colors.current.headingForeground;
            })

        for (let carousel of this.carousels.values()) {
            carousel.updateColor();
        }
    }

    updateLang() {
        document.getElementById(this.mainID).querySelectorAll(".accordion-header").forEach((a) => {
            let [_1, _2, _3, identifier, _4] = a.id.split("-")
            let btn = a.querySelector("button")
            btn.innerText = languageManager.currentLang.selector.selectorHeadings[identifier]
        })

        for (let carousel of this.carousels.values()){
            let index = carousel.innerCarousel.querySelector(".active")?.dataset?.index;
            if (index === undefined) continue; // while setup the index cant be found, because the carousel items are not generated yet
            carousel.circuitNameContainer.innerHTML = carousel.getCircuitFileName(index);
        }
    }
}

/**
 * This Selector is set when an external element is solved to avoid updating information on the page.
 * It does nothing and asserts that function calls can be made and don't produce unexpected behaviour or errors.
 * Is used if a qr code is scanned or a circuit from the editor is solved for state.currentSelector
 * */
class ExternalInput extends Selector {
    constructor() {
        super(new CircuitFilesManager(), SelectPage);
    }

    init(){
    }

    updateLang() {
    }

    updateColor() {
    }

    saveFinishedCircuit(updateCounter = true) {
    }

    updateCounter(identifier) {
    }

    addDoneToClassList(identifier, idx) {
    }

    createNextCircuitBtn() {
        let hiddenBtn = document.createElement("div");
        hiddenBtn.id = "nextCircuitBtn";
        return hiddenBtn;
    }
}