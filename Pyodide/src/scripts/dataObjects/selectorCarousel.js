/**
 * @typedef {HTMLButtonElement & {
 *   dataset: DOMStringMap & {
 *     bsSlideTo: string
 *   }
 * }} CarouselIndicatorButton
 */

/** Builds and manages the carousel that is displayed in each accordion item e.g. on the learn page (in code {@link SelectPage}) */
class SelectorCarousel {
    /** @type {HTMLDivElement} */
    parentDiv;
    /** @type {HTMLDivElement} */
    overviewBtnDiv;
    /** @type {HTMLButtonElement} */
    overviewBtn;
    /** @type {HTMLDivElement} */
    indicatorsDiv;
    /** @type {HTMLDivElement} */
    carousel;
    /** @type {bootstrap.Carousel} */
    bootstrapCarousel;
    /** @type {HTMLDivElement} */
    innerCarousel;
    /** @type {HTMLDivElement} */
    prevBtn;
    /** @type {HTMLDivElement} */
    nextBtn;
    /** @type {HTMLDivElement} */
    imgOverlay;
    /** @type {HTMLButtonElement} */
    startBtn;
    /** @type {HTMLDivElement} */
    circuitNameContainer;
    /** @type {CircuitSet} */
    circuitSet;
    /** @type {HTMLDivElement} */
    overViewModalBody;
    /** @type {Selector} */
    parent;

    get identifier(){
        return this.circuitSet.identifier;
    }

    get circuitMaps(){
        return this.circuitSet.circuitMaps;
    }

    get overviewItemElement(){
        return`
        <div class="carousel-item justify-content-center inheritColors">
            <div class="img-overlay">
                <button class="btn btn-warning px-5 circuitStartBtn">
                </button>
            </div>
            <div class="svg-selector mx-auto inheritColors" style="border-color: currentColor"></div>
        </div>`;
    }

    /** @returns {HTMLDivElement} */
    get overviewBtnElement(){
        let tmp = document.createElement("template");
        tmp.innerHTML = `
        <div class="container vcCheckBox inheritColors" 
             style="text-align: left; max-width: 350px; padding: 0; color:${colors.current.headingForeground};">
            <button type="button" 
                    class="btn my-1 btn-primary modalOverviewBtn inheritBackground coloredHeading"
                    style="color: ${colors.current.headingForeground}; border: 1px solid currentColor;">
                ${languageManager.currentLang.selector.overviewModalBtn}
            </button>
        </div>`
        return tmp.content.firstElementChild;
    }

    get indicatorContainerElement(){
        let tmp = document.createElement("template");
        tmp.innerHTML = `
        <div class="carousel-indicators" style="position: relative; bottom: auto; margin-top: 1px; margin-bottom: 1px;" 
        data-bs-theme="${colors.current.bsColorSchemeForIndicatorBtns}"></div>`
        return tmp.content.firstElementChild;
    }

    /** @returns {HTMLElement} */
    circuitNameContainerElement(text) {
        let  tmp = document.createElement("template");
        tmp.innerHTML = `<h5 class="inheritColors" style="margin-top: 10px;">${text}</h5>`
        return tmp.content.firstElementChild;
    }

    indicatorBtn(idx) {
        let tmp = document.createElement("template")
        tmp.innerHTML = `<button type="button" class="my-auto indicatorBtn" data-bs-target="#${this.parentDiv.id}-carousel" data-bs-slide-to="${idx}"></button>`;
        return tmp.content.firstElementChild
    }

    // Build carousel wrapper
    createCarousel() {
        let template = document.createElement("template");
        template.innerHTML = `
            <div id="${this.parentDiv.id}-carousel" class="carousel slide" data-interval="false">
                <div class="carousel-inner">
                
                </div>
                <button id="${this.parentDiv.id}-prev-btn" 
                        class="carousel-control-prev" 
                        type="button" 
                        data-bs-target="#${this.parentDiv.id}-carousel" 
                        data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="background-color: ${colors.current.prevNextBtnBackgroundColor};"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button id="${this.parentDiv.id}-next-btn" 
                        class="carousel-control-next" 
                        type="button" 
                        data-bs-target="#${this.parentDiv.id}-carousel" 
                        data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="background-color: ${colors.current.prevNextBtnBackgroundColor};"></span>
                    <span class="visually-hidden">Next</span>
                </button>
                <div id="${this.parentDiv.id}-overlay" class="img-overlay" style="display: flex;justify-content: center;align-items: center; border-color: ${colors.definitions.keyYellow};">
                    <button id="${this.parentDiv.id}-overlay-btn" 
                    class="btn btn-warning px-5 circuitStartBtn disabled" 
                    style="display: block"
                    data-identifier="${this.identifier}"
                    >
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>
                        <span class="button-text">start</span>
                    </button>
                </div>
            </div>`;

        return template.content.firstElementChild
    }

    hideImgOverlay(){
        let parent = this.parentDiv;
        let btn = parent.querySelector(".img-overlay").querySelector("button");
        /** @type {NodeListOf<HTMLElement>} */
        let selectors = parent.querySelectorAll(".svg-selector");
        /** @type {NodeListOf<HTMLElement>} */
        let overlays = parent.querySelectorAll(".volt-freq-overlay");
        let svgs = parent.querySelectorAll("svg");

        btn.style.display = "none";
        selectors.forEach( s => (s.style.borderColor = colors.current.svgStrokeColor));
        overlays.forEach(s => (s.style.display = "none"))
        svgs.forEach(s => (s.style.opacity = "1"))
    }

    showImgOverlay(){
        let parent = this.parentDiv;
        let btn = parent.querySelector(".img-overlay").querySelector("button");
        /** @type {NodeListOf<HTMLElement>} */
        let selectors = parent.querySelectorAll(".svg-selector");
        /** @type {NodeListOf<HTMLElement>} */
        let overlays = parent.querySelectorAll(".volt-freq-overlay");
        let svgs = parent.querySelectorAll("svg");

        btn.style.display = "inline";
        selectors.forEach(s => (s.style.borderColor = colors.definitions.keyYellow));
        overlays.forEach(s => (s.style.display = "block"))
        svgs.forEach(s => (s.style.opacity = "0.7"))
    }

    toggleImgOverlay() {
        let parent = this.parentDiv;
        let btn = parent.querySelector(".img-overlay").querySelector("button");

        if (btn.style.display === "inline") {
            this.hideImgOverlay();
        } else {
            this.showImgOverlay();
        }
    }

    /** @param circuitMaps {Array<CircuitMap>} */
    generateOverviewGrid(circuitMaps) {
        let grid = document.createElement("div");
        grid.classList.add("row");
        let idx = 0;
        for (let circuit of circuitMaps) {
            let col = document.createElement("div");
            col.classList.add("col-md-4", "col-sm-6", "col-12", "mb-4", "text-center", "justify-content-center");
            col.innerHTML = `
                <div id="overviewModal-${this.identifier}-${idx}" class="svg-selector mx-auto"></div>
                <button id="overviewModal-${this.identifier}-${idx}-modalBtn" class="btn btn-warning text-dark px-5 circuitStartBtnModal">start</button>
                `;
            col.setAttribute("data-identifier", this.identifier)
            col.setAttribute("data-index", String(idx))
            grid.appendChild(col);
            idx++;
        }
        return grid;
    }

    getIdMainCarousel(event){
        return event.target.parentElement.parentElement.querySelector(".carousel-inner").querySelector(".active").querySelector("div").id
    }

    /**
     * @param event {Event}
     */
    startBtnFn(event){
        event.stopPropagation()
        let index = Number(this.innerCarousel.querySelector(".active").dataset.index);
        this.startCircuit(index)
    }

    startCircuit(index){
        state.currentCircuitIndex = index;
        state.currentSelector = this.parent;
        const cm = this.circuitMaps[index];

        if (!cm.trackingId) state.trackingData = new EmptyQrTrackingData();
        else state.trackingData = new QrTrackingData(cm.trackingId, "Scanner Carousel", undefined, cm.selectorGroup);

        SimplifierPage.showSimplifierPage(cm);
    }

    /**
     *
     * @param id
     * @param identifier
     * @returns {HTMLElement}
     */
    carouselItem(id, identifier) {
        let template = document.createElement("template");
        template.innerHTML = `<div class="carousel-item justify-content-center inheritColors">
                <div id="${this.parentDiv.id}-${id}" class="svg-selector mx-auto inheritColors"></div>
            </div>`;
        template.content.firstElementChild.setAttribute("data-identifier", identifier);
        template.content.firstElementChild.setAttribute("data-index", id);
        return template.content.firstElementChild
    }

    addVoltFreqOverlay(circuitMap) {
        // Add voltage and frequency overlay for R, L, C and mixed Circuits
        if ([window.definitions.selectorIDs.quickstart, window.definitions.selectorIDs.symbolic, window.definitions.selectorIDs.wheatstone].includes(circuitMap.selectorGroup)){
            return new DocumentFragment()
        } else {
            if (circuitMap.frequency === undefined || circuitMap.frequency === null) {
                return this.createVoltOverlay(circuitMap);
            } else {
                return this.createVoltFreqOverlay(circuitMap);
            }
        }
    }

    /**
     * @param circuitMap {CircuitMap}
     * @param svg {SVGElement}
     * */
    setupOverviewModalCircuit(circuitMap, svg) {
        const index = circuitMap.index;
        if (circuitMap.selectorGroup !== window.definitions.selectorIDs.quickstart) {
            let elem = this.overViewModalBody.children[circuitMap.index];

            let gridElement = elem.querySelector(`div`);
            let overviewStartBtn = elem.querySelector(`button`);

            gridElement.appendChild(svg)
            overviewStartBtn.addEventListener("click", async (event) => {
                this.bootstrapCarousel.to(index);
                modalXl.hide();
                this.startCircuit(index)
            });
        }
    }

    getCircuitFileName(idx){
        idx = Number(idx);
        let fileNameParts = this.circuitMaps[idx].circuitName
        fileNameParts = fileNameParts.split(".")

        let fileName = fileNameParts[0];
        for (let i = 1; i < fileNameParts.length-2; i++) {
            fileName += "." + fileNameParts[i];
        }

        if (fileName === " " || fileName === "") return languageManager.currentLang.selector.taskStandardName + " " + (idx+1);

        return fileName
    }

    carouselSlideChanged(event, indicators){
        indicators.children[event.from].classList.remove("active");
        indicators.children[event.to].classList.add("active");
        indicators.parentElement.querySelector("h5").textContent = this.getCircuitFileName(event.to);
    }

    /** @param parentDiv {HTMLDivElement} Container that is filled with carousel
     * @param circuitSet {CircuitSet} the circuitSet that is shown in the carousel
     * @param parentSelector
     */
    constructor(parentDiv, circuitSet, parentSelector){
        this.parent = parentSelector;
        //parentDiv is accordion body
        if (parentDiv.id === ""){
            console.warn("parent has no id - may result in unexpected behaviour");
        }

        this.circuitSet = circuitSet;
        this.parentDiv = parentDiv;
    }

    templateItem(){
        let placeHolderSvg = document.createElement("template");
        placeHolderSvg.innerHTML =`
                <div class="carousel-item justify-content-center inheritColors active">
                    <div class="svg-selector mx-auto inheritColors" style="border-color: rgb(255, 193, 7);"><svg xmlns="http://www.w3.org/2000/svg" xml:lang="en" height="344.4pt" width="100%" viewBox="0 -20 380 344.4"></svg></div>
                </div>`
        return placeHolderSvg.content.firstElementChild;
    }

    /** @returns {string} */
    templateItemInnerHtml() {
        const lineLength = 40;
        const height = 20;
        let y = 0;
        let innerHtml = "";
        let text = languageManager.currentLang.selector.loadingContent;
        const lines = Math.ceil(text.length / lineLength);

        for (let lineNumber = 0; lineNumber < lines; lineNumber++) {
            let lineText;
            if (text.length > lineLength) {
                lineText = text.substring(lineNumber*lineLength, lineLength*(lineNumber+1));
            }
            else {
                lineText = text.substring(lineNumber*lineLength);
            }
            let textNode = `<text x="50%" y="${y+height*lineNumber}" text-anchor="middle" fill="white" font-family="monospace">${lineText}</text>`;
            innerHtml += textNode;
        }

        return innerHtml;
    }

    async init(){
        this.overviewBtnDiv = this.overviewBtnElement;
        this.overviewBtn = this.overviewBtnDiv.querySelector("button")
        this.overViewModalBody = this.generateOverviewGrid(this.circuitMaps)
        this.overviewBtn.onclick = () => {
            modalXl.show(new OverviewModal(this.overViewModalBody));
        }
        this.parentDiv.appendChild(this.overviewBtnDiv);

        this.indicatorsDiv = this.indicatorContainerElement;
        this.parentDiv.appendChild(this.indicatorsDiv);

        this.carousel = this.createCarousel();
        this.bootstrapCarousel = new bootstrap.Carousel(this.carousel);

        this.imgOverlay = this.carousel.querySelector(".img-overlay")
        this.imgOverlay.addEventListener("click", (event) => {
            this.toggleImgOverlay()
        })
        this.imgOverlay.querySelector("button").onclick = (event) => this.startBtnFn(event)
        this.innerCarousel = this.carousel.querySelector(".carousel-inner")

        let overlayFkt = new OverlayFactory();
        let id = 0;
        for (let circuitMap of this.circuitMaps) {
            let carouselItem = this.carouselItem(id, this.identifier)
            this.innerCarousel.appendChild(carouselItem);
            let svg = (new SvgMagician(await circuitMap.svgData())).prepareForSelector().element;

            /** @type {HTMLElement} */
            let circuitDiv = carouselItem.querySelector(".svg-selector")
            circuitDiv.appendChild(svg);
            circuitDiv.style.position = "relative";
            circuitDiv.appendChild(overlayFkt.overlay(circuitMap));

            // Setup specific circuit in overview modal
            this.setupOverviewModalCircuit(circuitMap, svg.cloneNode(true));
            this.indicatorsDiv.appendChild(this.indicatorBtn(id));

            id++;
        }
        this.innerCarousel.firstElementChild.classList.add("active");

        //setup indicators
        this.indicatorsDiv.firstElementChild.classList.add("active");

        this.carousel.addEventListener("slid.bs.carousel", (event) => {
            this.carouselSlideChanged(event, this.indicatorsDiv, this.identifier);
        })

        this.parentDiv.appendChild(this.carousel);
        this.circuitNameContainer = this.circuitNameContainerElement(this.getCircuitFileName(0))
        this.parentDiv.appendChild(this.circuitNameContainer);
        this.parentDiv.querySelector(".image-overlay");
        let downloadingText = this.parentDiv.querySelector("p")
        if (downloadingText) downloadingText.remove();

        this.prevBtn = this.parentDiv.querySelector(".carousel-control-prev");
        this.nextBtn = this.parentDiv.querySelector(".carousel-control-next");

        this.startBtn = this.parentDiv.querySelector(".circuitStartBtn");
    }

    selectCircuitInCarousel() {
        /** @type {HTMLButtonElement} */
        let indicatorBtn = this.indicatorsDiv.querySelectorAll(":not(.done)")[0]
        if (!indicatorBtn) indicatorBtn = this.indicatorsDiv.firstElementChild;

        const idx = indicatorBtn.dataset.bsSlideTo;
        this.bootstrapCarousel.to(Number(idx));
    }

    updateOverviewBody(){
        this.overViewModalBody.querySelectorAll("svg").forEach(el => {
                el.innerHTML = el.innerHTML.replaceAll(colors.last.svgStrokeColor, colors.current.svgStrokeColor)
            }
        )
    }

    setDataBsScheme(){
        this.indicatorsDiv.setAttribute("data-bs-theme", colors.current.bsColorSchemeForIndicatorBtns);
    }

    updateColor(){
        this.setDataBsScheme();
        this.updateOverviewBody();
    }
}