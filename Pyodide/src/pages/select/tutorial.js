class TutorialSelector extends Selector {
    identifier = window.definitions.selectorIDs.quickstart
    /** @type {Map<string, SkeletonCarousel>} */
    carousels = new Map();
    /** @type {CounterManager} */
    counters;

    /** @param circuitFiles {CircuitFilesManager} */
    constructor(circuitFiles) {
        let idLangMap = new Map([
            ["quick-tutorial-heading", () => languageManager.currentLang.selector.selectorHeadings.quick]
        ])
        super(circuitFiles, SelectPage)
        this.mainID = "quick-tutorial-container"
        this.circuitFiles = circuitFiles;
    }

    get carousel(){
        return this.carousels.get(this.identifier)
    }

    setup(){
        let tmp = document.createElement("template");
        tmp.innerHTML = `
        <div id="${this.mainID}" class="mb-5" style="color: ${colors.current.foreground}; background-color: ${colors.current.bsBackground}">
            <div>
                <p id="quick-tutorial-heading" class="big-heading" style="color:${colors.current.headingForeground}">${languageManager.currentLang.selector.selectorHeadings.quick}</p>
                <div class="my-auto counter-element inheritColors" style="font-size: x-large;min-width: 50px;text-wrap: auto; display: none">
                    <span class="inheritColors">-</span>
                    <span class="inheritColros">/</span>
                    <span class="inheritColors">-</span>
                </div>
            </div>
            <div id="${this.mainID}-body" class="container-fluid h-50 selector-container inheritColors"></div>
        </div>`;

        let contentDiv = tmp.content.firstElementChild;
        let carouselDiv = contentDiv.querySelector(".selector-container")
        let carousel = new SkeletonCarousel(
            carouselDiv,
            this.circuitFiles,
            this.identifier,
            this);
        this.carousels.set(this.identifier, carousel)

        this.carousel.init();

        return contentDiv;
    }

    async init() {
        if (!this.circuitFiles.loaded) {
            console.log("Circuits not loaded yet - waiting with init till loaded");
            awaitVal(() => this.circuitFiles.loaded, () => this.init.bind(this));
            return;
        }

        await this.carousel.afterCircuitsLoaded();
        this.carousel.selectCircuitInCarousel(this.indicatorsDiv);

        this.counters = new CounterManager(this, SelectPage, []);
        this.counters.add(document.getElementById(this.mainID).querySelector(".counter-element"), this.identifier);
        this.counters.update(this.identifier);
    }

    updateColor() {
        let pageDiv = document.getElementById(this.mainID)
        pageDiv.style.color = colors.current.foreground
        pageDiv.style.backgroundColor = colors.current.bsBackground

        document.getElementById("quick-tutorial-heading").style.color = colors.current.headingForeground

        this.carousel.setDataBsScheme();
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

            let requestID = pageManager.requestID;
            if(selectorGroup !== state.currentCircuitMap.selectorGroup){
                state.currentSelector = pageManager.pages.selectPage.content.accordion.selector

                if (!state.pyodideReady || !state.solversReady){
                    pageManager.changePage(pageManager.pages.loadingPyodidePage, false, false)
                    requestID = pageManager.requestID;
                    await awaitVal(() => state.pyodideReady && state.solversReady, () => {})
                }
            }

            if (requestID === pageManager.requestID) SimplifierPage.showSimplifierPage(state.currentCircuitMap);
        });
        return nextCircuitBtn;
    }
}