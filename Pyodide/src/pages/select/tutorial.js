class TutorialSelector extends Selector {
    identifier = window.definitions.selectorIDs.quickstart
    /** @type {Map<string, SkeletonCarousel>} */
    carousels = new Map();
    /** @type {CounterManager} */
    counters;

    constructor() {
        let idLangMap = new Map([
            ["quick-tutorial-heading", () => languageManager.currentLang.selector.selectorHeadings.quick]
        ])
        super(tutorialFiles, SelectPage, idLangMap);
        this.mainID = "quick-tutorial-container"
        this.circuitFiles = tutorialFiles;
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

        this.carousel.init(this.carousel.templateItemInnerHtml);

        return contentDiv;
    }

    async init() {
        if (!this.circuitFiles.loaded) {
            console.log("Tutorial circuits not loaded yet - waiting with init until loaded");
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
            const lastInCircuitSet = state.currentCircuitMap.index >= state.currentCircuitMap.parent.length - 1

            let selectorGroup = state.currentCircuitMap.selectorGroup;
            this.carousels.get(selectorGroup).nextBtn.click();
            state.currentCircuitMap = state.currentCircuitMap.nextCircuitMap();

            // avoid changing page when loading page is shown and a different page was requested while loading simplipfy
            // loading page is only shown when it is the last circuit in the circuit set of this carousel
            let showSimpPage = true;

            if (lastInCircuitSet){
                showSimpPage = await pageManager.tellWhenReady(
                    pageManager.pages.loadingPyodidePage,
                    () => state.backendReady && state.solversReady
                )
                state.currentSelector = pageManager.pages.selectPage.content.accordion.selector;
                state.currentCircuitMap = state.currentSelector.circuitFiles.getCircuitSet(window.definitions.selectorIDs.resistor).circuitMaps[0];
            }

            if (showSimpPage) SimplifierPage.showSimplifierPage(state.currentCircuitMap);
        });
        return nextCircuitBtn;
    }
}