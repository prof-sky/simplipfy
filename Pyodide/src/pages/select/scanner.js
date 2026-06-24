class Scanner extends Selector{
    initStarted = false;

    static get dirName(){
        return "scanned";
    }

    static get identifier(){
        return "scanned";
    }

    constructor() {
        let idLangMap = new Map([
            ["someId", () => languageManager.currentLang.toolsPage.helpBtn]
        ]);
        super(scannerFiles, SelectPage, idLangMap);
    }

    /** @returns {ScannerCarousel} */
    get carousel(){
        return this.carousels.get(Scanner.identifier)
    }

    async init(){
        if (!this.circuitFiles.loaded || !serverFiles.loaded || !state.backendReady) {
            if (this.initStarted) return;
            this.initStarted = true;
            console.log("Scanner circuits not loaded yet - waiting with init until loaded");
            awaitVal(() => this.circuitFiles.loaded && serverFiles.loaded && state.backendReady, this.init.bind(this));
            return;
        }

        // can safely assume they are loaded now, otherwise the set would be an empty set with no connection to the scannerFiles
        this.carousel.circuitSet = this.circuitFiles.getCircuitSet(Scanner.identifier)

        let circuitMaps = this.circuitFiles.getCircuitSet(Scanner.identifier).circuitMaps;
        const carousel = this.carousel;

        for (let map of circuitMaps){
            await carousel.insertBeforePlaceholder(map);
        }

        carousel.lastElementInInnerCarousel.classList.add("active");

        /** @type CarouselIndicatorButton */
        const indiBtn = carousel.lastElementOf(carousel.indicatorsDiv.childNodes);
        indiBtn.classList.add("active");
        this.carousel.bootstrapCarousel.to(indiBtn.dataset.bsSlideTo)
    }

    setup() {
        let tmp = document.createElement("template");
        tmp.innerHTML = `<div id="${this.mainID}" class="mt-5">
        <p class="big-heading" style="color:${colors.definitions.keyYellow}">SCANNER</p>
        <div id="${this.mainID}-body" class="container-fluid h-50 selector-container inheritColors"></div>
        </div>`

        let contentDiv = tmp.content.firstElementChild;
        let carouselDiv = contentDiv.querySelector(".selector-container")
        let carousel = new ScannerCarousel(
            carouselDiv,
            this.circuitFiles,
            Scanner.identifier,
            this);
        this.carousels.set(Scanner.identifier, carousel)

        this.carousel.init();

        return contentDiv;
    }

    saveFinishedCircuit(updateCounter = true) {
        //problems with hash of circuit and saving of circuits may need reimplementation of saving loading
    }
}