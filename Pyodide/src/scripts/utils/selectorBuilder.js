class SelectorBuilder {
    constructor() {
    }

    // ############################# Necessary function for outside ###############################

    buildAccordionSelectors() {
        let accordion = document.createElement("div");
        accordion.classList.add("accordion", "accordion-flush", "mt-5");
        accordion.id =  "selector-accordion";

        for (let circuitSet of circuitMapper.circuitSets) {
            if (circuitSet.identifier === circuitMapper.selectorIds.quick) continue; // already built
            let item = this.buildAccordionItem(circuitSet.identifier);
            let modal = this.buildOverviewModal(circuitSet);
            accordion.appendChild(item);
            document.body.appendChild(modal);  // needs to be on the top level to work
        }

        return accordion;
    }

    buildAccordionItem(identifier) {
        let accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="flush-heading-${identifier}" style="display: flex; justify-content: space-between; background-color: ${colors.currentBsBackground}">
                <button id="${identifier}-acc-btn" style="color: ${colors.keyYellow}; background-color: ${colors.currentBsBackground}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-${identifier}" aria-expanded="false" aria-controls="flush-collapse-${identifier}">
                    ${languageManager.currentLang.selectorHeadings[identifier]}
                </button>
                <div id="${identifier}-selector-counter" class="my-auto" style="background-color: ${colors.currentBsBackground}; color: ${colors.keyGreyedOut}; font-size: large"></div>
            </h2>
            <div id="flush-collapse-${identifier}" class="accordion-collapse collapse" aria-labelledby="flush-heading-${identifier}" data-bs-parent="#selector-accordion" style="">
                <div class="accordion-body">
                    <div class="container vcCheckBox" style="text-align: left; max-width: 350px; padding: 0; color:${colors.currentForeground};">
                        <button onclick="document.getElementById('${identifier}-overviewModal').blur()" id="${identifier}-overviewModalBtn" type="button" 
                            class="btn my-1 btn-primary modalOverviewBtn" data-bs-toggle="modal" data-bs-target="#${identifier}-overviewModal">
                                ${languageManager.currentLang.overviewModalBtn}
                        </button>
                    </div>
                    ${this.createCarousel(identifier)}
                </div>
            </div>`;
        return accordionItem;
    }

    buildOverviewModal(circuitSet) {
        let id = circuitSet.identifier;
        let modal = document.createElement("div");
        modal.classList.add("modal", "fade", "modal-xl");
        modal.id = `${id}-overviewModal`;
        modal.tabIndex = "-1";
        modal.setAttribute("aria-labelledby", `${id}-overviewModalLabel`);
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header" style="background: ${colors.currentBackground}; color: white;">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background: ${colors.currentBackground}; color: white;">
                        ${this.generateOverviewGrid(circuitSet)}
                    </div>
                    <div class="modal-footer justify-content-center" style="background: ${colors.currentBackground}">
                        <button id="${id}-overviewCloseBtn" type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${languageManager.currentLang.closeBtn}
                        </button>
                    </div>
                </div>
            </div>
                `;
        return modal;
    }

    generateOverviewGrid(circuitSet) {
        let grid = document.createElement("div");
        grid.classList.add("row");
        for (let circuit of circuitSet.set) {
            let col = document.createElement("div");
            col.classList.add("col-md-4", "col-sm-6",  "col-12",  "mb-4", "text-center", "justify-content-center");
            col.innerHTML = `
                <div id="${circuit.circuitDivID}-overviewModal" class="svg-selector mx-auto"></div>
                <button id="${circuit.btn}-modalBtn" onclick="document.getElementById('${circuit.btn}-modalBtn').blur()" class="btn btn-warning text-dark px-5 circuitStartBtnModal">start</button>
                `;
            grid.appendChild(col);
        }
        return grid.outerHTML;
    }

    buildSelectorsForAllCircuitSets() {
        // Build the quick selector outside accordion
        this.buildSelector(circuitMapper.selectorIds.quick);

        let accordion = this.buildAccordionSelectors();

        const quickCarousel = document.getElementById("quick-carousel");
        quickCarousel.insertAdjacentElement("afterend", accordion);
        this.updateSelectorCounters();
        // Activate reset btn in settings
        const resetBtn = document.getElementById("reset-counters-btn");
        if (resetBtn) {
            resetBtn.disabled = false;
        }
    }

    updateSelectorCounters() {
        for (let circuitSet of circuitMapper.circuitSets) {
            // set number of done circuits/available circuits
            let availableCircuits = circuitSet.set.length;
            let identifier = circuitSet.identifier;
            // Search in storage for done circuits
            // Storage will store e.g.: doneCircuits-res = ["00_hetznecker.txt", "01_ohm.txt"]
            let doneCircuits = localStorage.getItem(`doneCircuits-${identifier}`);
            if (doneCircuits) {
                doneCircuits = JSON.parse(doneCircuits);
            } else {
                doneCircuits = [];
            }
            if (state[`doneCircuits-${identifier}`] !== undefined && state[`doneCircuits-${identifier}`] !== null) {
                // Check if something changed
                if (state[`doneCircuits-${identifier}`] === doneCircuits) {
                    continue; // nothing changed, so no need to update
                }
            }
            // Update
            state[`doneCircuits-${identifier}`] = doneCircuits;
            // Check names of done circuits with available circuits
            let doneCount = 0;
            if (identifier === circuitMapper.selectorIds.wheatstone) {
                availableCircuits = state.options.length; // Wheatstone selector has different available circuits
                for (let i = 0; i < state.options.length; i++) {
                    let optionName = "option_" + i;
                    if (doneCircuits.includes(optionName)) {
                        doneCount++;
                    }
                }
            } else {
                for (const circuit of circuitSet.set) {
                    if (doneCircuits.includes(circuit.circuitFile)) {
                        doneCount++;
                    }
                }
            }
            // Set counter text
            let counterText = `${doneCount}/${availableCircuits}`;
            let counterElement = document.getElementById(`${identifier}-selector-counter`);
            if (counterElement) {
                counterElement.textContent = counterText;
                counterElement.style.color = doneCount === availableCircuits ? colors.keyYellow : colors.keyGreyedOut;
                if (doneCount === availableCircuits) {
                    let animationShown = localStorage.getItem(`${identifier}-animation-shown`);
                    if (animationShown !== "true") {
                        localStorage.setItem(`${identifier}-animation-shown`, "true");
                        if (pageManager.simplifierPage.style.display === "block") {
                            if (availableCircuits > 0) {
                                this.showFinishedSelectorAnimation(identifier);
                            }
                        }
                    }
                } else {
                    localStorage.setItem(`${identifier}-animation-shown`, "false");
                }
            } else {
                console.warn(`Counter element for ${identifier} not found.`);
            }
        }
    }

    resetCircuitCounters() {
        // delete animation-shown and done-Circuits from localStorage
        for (let circuitSet of circuitMapper.circuitSets) {
            let identifier = circuitSet.identifier;
            localStorage.removeItem(`${identifier}-animation-shown`);
            localStorage.removeItem(`doneCircuits-${identifier}`);
        }
    }

// ################################ Helper functions ###########################################

    buildSelector(identifier) {
        const pgrBar = document.getElementById("pgr-bar-container");
        const heading = this.createHeadingContainer(identifier);
        const carousel = this.createCarouselContainer();

        carousel.innerHTML = this.createCarousel(identifier);

        pgrBar.insertAdjacentElement("afterend", heading);
        heading.insertAdjacentElement("afterend", carousel);
    }


    createHeadingContainer(identifier) {
        const heading = document.createElement("p");
        heading.id = `${identifier}-heading`;
        heading.classList.add("pt-3", "big-heading");
        return heading;
    }

    createCarouselContainer() {
        const carousel = document.createElement("div");
        carousel.classList.add("container-fluid", "h-50", "mb-5", "selector-container");
        return carousel;
    }

    createCarousel(identifier) {
        const carouselElements = this.createCarouselElements(identifier);
        return `
            <div id="${identifier}-carousel" class="carousel slide" data-interval="false">
                <div class="carousel-inner">
                    ${carouselElements}                    
                </div>
                <button id="${identifier}-prev-btn" class="carousel-control-prev" type="button" data-bs-target="#${identifier}-carousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="background-color: ${colors.prevNextBtnBackgroundColor};"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button id="${identifier}-next-btn" class="carousel-control-next" type="button" data-bs-target="#${identifier}-carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="background-color: ${colors.prevNextBtnBackgroundColor};"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
            `;
    }

    createCarouselElements(identifier) {
        let carouselElementString = "";
        for (const circuitSet of circuitMapper.circuitSets) {
            if (circuitSet.identifier !== identifier) continue;
            // Create selector for the circuitSet with identifier
            for (const circuit of circuitSet.set) {
                // For each circuit inside the set, create the carousel element
                carouselElementString += this.createCarouselItemForCircuit(circuit);
            }
        }

        // Make the first element active
        carouselElementString = carouselElementString.replace("carousel-item justify", "carousel-item active justify");

        return carouselElementString;
    }

    adaptSelectorFrameColor() {
        // Adapt border color if darkmode changed before selector is built
        if (!document.getElementById("darkmode-switch").checked) {
            const svgSelectors = document.getElementsByClassName("svg-selector");
            for (const svgSelector of svgSelectors) {
                svgSelector.style.borderColor = colors.currentForeground;
            }
        }
    }

    createCarouselItemForCircuit(circuit) {
        // The only difference between the quickstart and the rest is the button overlay
        // For the Quickstart, the button doesn't get loading stripes since it can be started immediately
        if (circuit.selectorGroup === circuitMapper.selectorIds.quick) {
            return this.itemForQuickStart(circuit);
        } else {
            return this.itemForRest(circuit);
        }
    }

    itemForQuickStart(circuit) {
        return `<div class="carousel-item justify-content-center">
                    <div id="${circuit.btnOverlay}" class="img-overlay">
                        <button id="${circuit.btn}" class="btn btn-warning text-dark px-5 circuitStartBtn">
                            <span class="button-text">start</span>
                        </button>
                    </div>
                    <div id="${circuit.circuitDivID}" class="svg-selector mx-auto">
                    </div>
                </div>`;
    }

    itemForRest(circuit) {
        return `<div class="carousel-item justify-content-center">
                    <div id="${circuit.btnOverlay}" class="img-overlay">
                        <button id="${circuit.btn}" class="btn btn-warning text-dark px-5 circuitStartBtn">
                            <div class="fill-layer"></div>
                            <div class="progress-stripes"></div>
                            <span class="button-text">start</span>
                        </button>
                    </div>
                    <div id="${circuit.circuitDivID}" class="svg-selector mx-auto">
                    </div>
                </div>`;
    }

// ######################### Setup #######################################
    async setupSelector(circuitSet, pageManager, uploadSelector=false) {
        return new Promise(async (resolve) => {
            try {
                for (const [idx, circuit] of circuitSet.set.entries()) {
                    await this.setupSpecificCircuitSelector(circuit, pageManager, uploadSelector);
                    this._showFirstCircuitAsSelected(idx, circuitSet);
                }
                if (moreThanOneCircuitInSet(circuitSet)) {
                    this.setupNextAndPrevButtons(circuitSet, uploadSelector);
                } else {
                    this.hideNextAndPrevButtons(circuitSet, uploadSelector);
                }
                resolve();
            } catch (error) {
                console.error(`Error setting up circuit selector for ${circuitSet.identifier}:`, error);
                showMessage(error, "error", false);
                pushErrorEventMatomo(errorActions.circuitSelectorSetupError, `(${circuitSet.identifier})` + error);
            }
        });
    }

    _showFirstCircuitAsSelected(idx, circuitSet) {
        if ((idx === 0)) {
            if (circuitSet.set[0] !== undefined && circuitSet.set[0] !== null) {
                this.showCircuitAsSelected(document.getElementById(circuitSet.set[0].circuitDivID),
                    document.getElementById(circuitSet.set[0].btnOverlay));
            }
        }
    }

    async setupSpecificCircuitSelector(circuitMap, pageManager, uploadSelector=false) {
        const circuitDiv = document.getElementById(circuitMap.circuitDivID);
        const startBtn = document.getElementById(circuitMap.btn);
        const btnOverlay = document.getElementById(circuitMap.btnOverlay);

        // Fill div with svg
        try {
            let isValidSyntax, svgData, errMsgs, warnMsgs;
            if (uploadSelector) {
                // TODO check if a svg file is uploaded else generate it
                // generate svg for uploaded circuits
                circuitDiv.style.minHeight = "100px";
                circuitDiv.innerHTML = `<p style="color: ${colors.currentForeground};">${circuitMap.circuitFile}</p>`;
                // create step 0 data
                let dirName = state.selectedZipDirName;
                // OLD: await state.stepSolverAPI.initStepSolver(circuitMap.circuitFile, conf.userCircuitsPath + `${dirName}/${circuitMap.sourceDir}`, paramMap);
                // let obj = await state.stepSolverAPI.createStep0();
                // Use force draw instead of stepSolverAPI to not get collision errors
                // Read netlist from user circuits path

                let netlist = await state.pyodideAPI.readFile(conf.userCircuitsPath + `${state.selectedZipDirName}/${circuitMap.sourceDir}/${circuitMap.circuitFile}`);
                let paramMap = createParamMap();
                let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);
                [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.pyodideAPI.forceDrawing(rawNetlist, paramMap, optionsString);
            } else {
                // load svg
                svgData = await state.pyodideAPI.readFile(circuitMap.overViewSvgFile, "utf8");
            }

            svgData = setSvgWidthTo(svgData, "100%");
            svgData = setSvgColorMode(svgData);
            circuitDiv.innerHTML = svgData;
            this.addVoltFreqOverlay(circuitDiv, circuitMap);
            hideSvgArrows(circuitDiv);
            hideLabels(circuitDiv);

            // Setup specific circuit in overview modal
            this.setupOverviewModalCircuit(circuitMap, circuitDiv, pageManager, uploadSelector);

            this.setupSelectionCircuit(circuitDiv, startBtn, btnOverlay);
            // Disable start buttons for all selector groups except quickstart when pyodide is not ready
            if (circuitMap.selectorGroup !== circuitMapper.selectorIds.quick) {
                if (!state.pyodideReady) {
                    startBtn.disabled = true;
                } else {
                    startBtn.style.backgroundColor = colors.keyYellow;
                }
            } else {
                startBtn.style.backgroundColor = colors.keyYellow;
            }
            startBtn.addEventListener("click", () =>
                this.circuitSelectorStartButtonPressed(circuitMap));
        } catch (error) {
            console.error(`Error loading ${circuitMap.overViewSvgFile}:`, error);
            showMessage(error, "error", false);
            pushErrorEventMatomo(errorActions.loadingOverviewError, `(${circuitMap.selectorGroup})` + error);
        }
    }

    enableStartBtns() {
        let startBtns = document.getElementsByClassName("circuitStartBtn");
        for (const startBtn of startBtns) {
            startBtn.disabled = false;
        }
        startBtns = document.getElementsByClassName("circuitStartBtnModal");
        for (const startBtn of startBtns) {
            startBtn.disabled = false;
        }
    }

    addVoltFreqOverlay(circuitDiv, circuitMap) {
        // Add voltage and frequency overlay for R, L, C and mixed Circuits
        if ([circuitMapper.selectorIds.quick, circuitMapper.selectorIds.symbolic, circuitMapper.selectorIds.wheatstone].includes(circuitMap.selectorGroup)){
            // nothing here
        } else {
            if (circuitMap.frequency === undefined || circuitMap.frequency === null) {
                circuitDiv.insertBefore(this.createVoltOverlay(circuitMap), circuitDiv.firstChild);
            } else {
                circuitDiv.insertBefore(this.createVoltFreqOverlay(circuitMap), circuitDiv.firstChild);
            }
        }
    }

    createVoltOverlay(circuitMap) {
        let div = document.createElement("div");
        div.id = `${circuitMap.btnOverlay}-volt-freq`;
        div.classList.add("volt-freq-overlay");
        div.innerHTML = `<p style="color: ${colors.currentForeground}; position:absolute; top:20px; right: 0; ">${circuitMap.voltage}</p>`;
        return div;
    }

    createVoltFreqOverlay(circuitMap) {
        let div = document.createElement("div");
        div.id = `${circuitMap.btnOverlay}-volt-freq`;
        div.classList.add("volt-freq-overlay");
        div.innerHTML = `<p style="color: ${colors.currentForeground}; position:absolute; top:20px; right: 0; ">${circuitMap.voltage}</p>
                         <p style="color: ${colors.currentForeground}; position:absolute; top:40px; right: 0; ">${circuitMap.frequency}</p>`;
        return div;
    }

    setupOverviewModalCircuit(circuitMap, circuitDiv, pageManager, uploadSelector=false) {
        if (circuitMap.selectorGroup !== circuitMapper.selectorIds.quick) {
            let gridElement;
            let overviewStartBtn;
            let modal;
            if (uploadSelector) {
                gridElement = document.getElementById(`${circuitMap.circuitDivID}-upload-overviewModal`);
                overviewStartBtn = document.getElementById(`${circuitMap.btn}-upload-modalBtn`);
                modal = document.getElementById(`${circuitMap.selectorGroup}-upload-overviewModal`);
            } else {
                gridElement = document.getElementById(`${circuitMap.circuitDivID}-overviewModal`);
                overviewStartBtn = document.getElementById(`${circuitMap.btn}-modalBtn`);
                modal = document.getElementById(`${circuitMap.selectorGroup}-overviewModal`);
            }

            gridElement.innerHTML = circuitDiv.innerHTML;  // copy svg without arrows to modal
            if (!state.pyodideReady) {
                overviewStartBtn.disabled = true;
            }
            overviewStartBtn.addEventListener("click", () => {
                // we need the bootstrap modal instance in order to close it
                var modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
                modalInstance.hide();
                this.circuitSelectorStartButtonPressed(circuitMap);
            });
        }
    }

    resetSelectorSelections(circuitSet) {
        for (const circuit of circuitSet) {
            this.resetSelection(circuit);
        }
    }

    setupNextAndPrevButtons(circuitSet, uploadSelector=false) {
        let next;
        let prev;
        if (uploadSelector) {
            next = document.getElementById(`${circuitSet.identifier}-upload-next-btn`);
            prev = document.getElementById(`${circuitSet.identifier}-upload-prev-btn`);
        } else {
            next = document.getElementById(`${circuitSet.identifier}-next-btn`);
            prev = document.getElementById(`${circuitSet.identifier}-prev-btn`);
        }
        next.addEventListener("click", () => {
            this.resetSelectorSelections(circuitSet.set);
        })
        prev.addEventListener("click", () => {
            this.resetSelectorSelections(circuitSet.set);
        })
    }

    hideNextAndPrevButtons(circuitSet, uploadSelector=false) {
        let next;
        let prev;
        if (uploadSelector) {
            next = document.getElementById(`${circuitSet.identifier}-upload-next-btn`);
            prev = document.getElementById(`${circuitSet.identifier}-upload-prev-btn`);
        } else {
            next = document.getElementById(`${circuitSet.identifier}-next-btn`);
            prev = document.getElementById(`${circuitSet.identifier}-prev-btn`);
        }
        if (next !== null && prev !== null) {
            next.hidden = true;
            prev.hidden = true;
        }
    }

    async circuitSelectorStartButtonPressed(circuitMap, fromQrScan=false) {
        clearSimplifierPageContainer();
        showSpinnerLoadingCircuit();
        state.currentCircuitMap = circuitMap;
        state.pictureCounter = 0;
        state.allValuesMap = new Map();
        state.currentCircuitFromUserZip = false;
        state.currentCircuitFromQrScan = false;

        // If upload page is shown, it is a user circuit
        if (pageManager.uploadPage.style.display === "block") {
            state.currentCircuitFromUserZip = true;
        }
        // If tool page is shown, it is a scanned circuit
        if (pageManager.toolPage.style.display === "block") {
            state.currentCircuitFromQrScan = true;
        } // Used for QR Code scanning with hash in URL
        if (fromQrScan) {
            state.currentCircuitFromQrScan = true;
        }

        if (circuitMap.selectorGroup === circuitMapper.selectorIds.kirchhoff) {
            pushPageViewMatomo(circuitMap.selectorGroup + "/" + circuitMap.circuitFile);
            startKirchhoff();
        } else if (circuitMap.selectorGroup === circuitMapper.selectorIds.wheatstone) {
            pushPageViewMatomo(circuitMap.selectorGroup + "/" + circuitMap.circuitFile);
            if (state.currentCircuitFromUserZip) {
                state.options = getWheatstoneValues();
            }
            startWheatstone(); //TODO isUserCircuit, change state.options or work on concept how to use user values, ...
        } else {
            pushPageViewMatomo(circuitMap.selectorGroup + "/" + circuitMap.circuitFile)
            startSimplifier();
        }

        pageManager.disableSettings();
        pageManager.showSimplifierPage();
    }

    showCircuitAsSelected(circuit, btnOverlay) {
        circuit.style.borderColor = colors.keyYellow;
        circuit.style.opacity = "0.5";
        btnOverlay.style.display = "block";
        if (!(btnOverlay.id.includes(circuitMapper.selectorIds.quick)
            || btnOverlay.id.includes(circuitMapper.selectorIds.symbolic)
            || btnOverlay.id.includes(circuitMapper.selectorIds.wheatstone))) {
            let overlay = document.getElementById(`${btnOverlay.id}-volt-freq`);
            if (overlay) overlay.style.opacity = "0.5";
        }
    }
    showCircuitAsUnselected(circuit, btnOverlay) {
        circuit.style.borderColor = colors.currentForeground;
        circuit.style.opacity = "1";
        btnOverlay.style.display = "none";
        if (!(btnOverlay.id.includes(circuitMapper.selectorIds.quick)
                || btnOverlay.id.includes(circuitMapper.selectorIds.symbolic)
            || btnOverlay.id.includes(circuitMapper.selectorIds.wheatstone))) {
            let overlay = document.getElementById(`${btnOverlay.id}-volt-freq`);
            if (overlay) overlay.style.opacity = "1";
        }
    }

    setupSelectionCircuit(circuit, startBtn, startBtnOverlay) {
        circuit.addEventListener("click", () => {this.showCircuitAsSelected(circuit, startBtnOverlay)})
        startBtnOverlay.addEventListener("click", () => {this.showCircuitAsUnselected(circuit, startBtnOverlay)})
    }

    resetSelection(circuitMap) {
        const circuit = document.getElementById(circuitMap.circuitDivID);
        const overlay = document.getElementById(circuitMap.btnOverlay);
        circuit.style.borderColor = colors.currentForeground;
        circuit.style.opacity = "1";
        overlay.style.display = "none";
        if (!((circuitMap.selectorGroup === circuitMapper.selectorIds.quick) || (circuitMap.selectorGroup === circuitMapper.selectorIds.symbolic))) {
            document.getElementById(`${circuitMap.btnOverlay}-volt-freq`).style.opacity = "1";
        }
    }

    // ############################# Uploader builder ###############################

    buildUploadSelectors() {
        let accordion = this.buildUploadAccordionSelectors();
        let uploadInput = document.getElementById("upload-div");
        uploadInput.insertAdjacentElement("afterend", accordion);
    }

    buildUploadAccordionSelectors() {
        let accordion = document.createElement("div");
        accordion.classList.add("accordion", "accordion-flush", "mt-5", "mx-auto");
        accordion.style.maxWidth = "500px";
        accordion.id =  "upload-accordion";

        for (let circuitSet of circuitMapper.circuitSets) {
            if (circuitSet.identifier === circuitMapper.selectorIds.quick) continue; // already built
            let item = this.buildUploadAccordionItem(circuitSet.identifier);
            let modal = this.buildUploadOverviewModal(circuitSet);
            accordion.appendChild(item);
            document.body.appendChild(modal);  // needs to be on the top level to work
        }

        return accordion;
    }

    buildUploadAccordionItem(identifier) {
        let accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="flush-heading-upload-${identifier}">
                <button id="${identifier}-acc-btn" style="color: ${colors.currentHeadingsForeground}; background-color: ${colors.currentBsBackground}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-upload-${identifier}" aria-expanded="false" aria-controls="flush-collapse-upload-${identifier}">
                    ${languageManager.currentLang.selectorHeadings[identifier]}
                </button>
            </h2>
            <div id="flush-collapse-upload-${identifier}" class="accordion-collapse collapse" aria-labelledby="flush-heading-upload-${identifier}" data-bs-parent="#upload-accordion" style="">
                <div class="accordion-body" style="background-color: ${colors.currentBsBackground}">
                    <div class="container vcCheckBox" style="text-align: left; max-width: 350px; padding: 0; color:${colors.currentHeadingsForeground};">
                        <button onclick="document.getElementById('${identifier}-upload-overviewModal').blur()" id="${identifier}-upload-overviewModalBtn" type="button" 
                            class="btn my-1 btn-primary modalOverviewBtn" data-bs-toggle="modal" data-bs-target="#${identifier}-upload-overviewModal" style="color: ${colors.currentHeadingsForeground};border: 1px solid ${colors.currentHeadingsForeground};">
                                ${languageManager.currentLang.overviewModalBtn}
                        </button>
                    </div>
                    ${this.createUploadCarousel(identifier)}
                </div>
            </div>`;
        return accordionItem;
    }

    createUploadCarousel(identifier) {
        const carouselElements = this.createUploadCarouselElements(identifier);
        return `
            <div id="${identifier}-upload-carousel" class="carousel slide" data-interval="false">
                <div class="carousel-inner">
                    ${carouselElements}                    
                </div>
                <button id="${identifier}-upload-prev-btn" class="carousel-control-prev" type="button" data-bs-target="#${identifier}-upload-carousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="background-color: ${colors.prevNextBtnBackgroundColor};"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button id="${identifier}-upload-next-btn" class="carousel-control-next" type="button" data-bs-target="#${identifier}-upload-carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="background-color: ${colors.prevNextBtnBackgroundColor};"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
            `;
    }

    createUploadCarouselElements(identifier) {
        let carouselElementString = "";
        for (const circuitSet of circuitMapper.circuitSets) {
            if (circuitSet.identifier !== identifier) continue;
            // Create selector for the circuitSet with identifier
            for (const circuit of circuitSet.set) {
                // For each circuit inside the set, create the carousel element
                carouselElementString += this.createCarouselItemForCircuit(circuit);
            }
        }

        // Make the first element active
        carouselElementString = carouselElementString.replace("carousel-item justify", "carousel-item active justify");

        return carouselElementString;
    }

    buildUploadOverviewModal(circuitSet) {
        let id = circuitSet.identifier;
        let modal = document.createElement("div");
        modal.classList.add("modal", "fade", "modal-xl");
        modal.id = `${id}-upload-overviewModal`;
        modal.tabIndex = "-1";
        modal.setAttribute("aria-labelledby", `${id}-upload-overviewModalLabel`);
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header" style="background: ${colors.currentBackground}; color: white;">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background: ${colors.currentBackground}; color: white;">
                        ${this.generateUploadOverviewGrid(circuitSet)}
                    </div>
                    <div class="modal-footer justify-content-center" style="background: ${colors.currentBackground}">
                        <button id="${id}-overviewCloseBtn" type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${languageManager.currentLang.closeBtn}
                        </button>
                    </div>
                </div>
            </div>
                `;
        return modal;
    }

    generateUploadOverviewGrid(circuitSet) {
        let grid = document.createElement("div");
        grid.classList.add("row");
        for (let circuit of circuitSet.set) {
            let col = document.createElement("div");
            col.classList.add("col-md-4", "col-sm-6",  "col-12",  "mb-4", "text-center", "justify-content-center");
            col.innerHTML = `
                <div id="${circuit.circuitDivID}-upload-overviewModal" class="svg-selector mx-auto"></div>
                <button id="${circuit.btn}-upload-modalBtn" onclick="document.getElementById('${circuit.btn}-modalBtn').blur()" class="btn btn-warning text-dark px-5 circuitStartBtnModal">start</button>
                `;
            grid.appendChild(col);
        }
        return grid.outerHTML;
    }

    showFinishedSelectorAnimation(identifier) {
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.pointerEvents = "none";
        container.style.opacity = "0";
        container.style.transition = "opacity 1s ease";
        container.style.padding = "100%"; // full screen blurred
        container.style.backdropFilter = "blur(10px)";

        const star = document.createElement("div");
        star.innerHTML = `<svg id="star-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="250px" viewBox="0 -0.5 33 33" version="1.1">
                            <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                            <title>star</title>
                            <desc>Created with Sketch.</desc>
                            <defs></defs>
                            <g id="Vivid.JS" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="Vivid-Icons" transform="translate(-903.000000, -411.000000)" fill="#FFC107">
                                    <g id="Icons" transform="translate(37.000000, 169.000000)">
                                        <g id="star" transform="translate(858.000000, 234.000000)">
                                            <g transform="translate(7.000000, 8.000000)" id="Shape">
                                                <polygon points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22"></polygon>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>`;

        const text = document.createElement("div");
        text.textContent = languageManager.currentLang.selectorHeadings[identifier];
        text.style.fontSize = "48px";
        text.style.color = colors.currentHeadingsForeground;
        text.style.fontWeight = "bold";
        text.style.marginTop = "20px";
        text.style.position = "absolute";
        text.style.top = "60%";

        // Append elements to container
        container.appendChild(star);
        container.appendChild(text);
        document.body.appendChild(container);

        // Fade in
        setTimeout(() => {
            container.style.opacity = "1";
        }, 250);

        // Fade out
        setTimeout(() => {
            container.style.opacity = "0";
        }, 3000);

        // Remove
        setTimeout(() => {
            container.remove();
        }, 4000);

        let duration = 3;

        let end = Date.now() + (duration * 1000 - 500); // Just a bit shorter :)
        let confettiColors = ['#ffc107', '#ffc107'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: confettiColors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: confettiColors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        // Check if this was the last selector
        this.checkAllDone();
    }

    checkAllDone() {
        let allDone = true;
        for (let circuitSet of circuitMapper.circuitSets) {
            if (circuitSet.identifier === circuitMapper.selectorIds.quick) continue;
            let doneCircuits = localStorage.getItem(`doneCircuits-${circuitSet.identifier}`);
            if (doneCircuits) {
                doneCircuits = JSON.parse(doneCircuits);
            } else {
                doneCircuits = [];
            }
            if (circuitSet.identifier === circuitMapper.selectorIds.wheatstone) {
                // Check options
                if (doneCircuits.length < state.options.length) {
                    allDone = false;
                    break;
                }
            } else {
                // Rest of the circuit sets
                if (doneCircuits.length < circuitSet.set.length) {
                    allDone = false;
                    break;
                }
            }
        }
        if (allDone) {
            if (document.readyState === "loading") {
                window.addEventListener("DOMContentLoaded", () => {
                    this.addSmoothStarsOverLogo();
                });
            } else {
                this.addSmoothStarsOverLogo();
            }
        }
    }

    addSmoothStarsOverLogo() {
        const logo = document.getElementById("nav-logo");

        const wrapper = document.createElement("span");
        wrapper.id = "smooth-stars-wrapper";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        logo.parentNode.insertBefore(wrapper, logo);
        wrapper.appendChild(logo);

        function createStar() {
            const star = document.createElement("span");
            star.textContent = Math.random() > 0.5 ? "✦" : "★";

            const size = Math.random() * 6 + 6;
            const duration = Math.random() * 1000 + 1500;

            const x = Math.random() * wrapper.offsetWidth;
            const startY = wrapper.offsetHeight - 2;

            // horizontale Verschiebung zufällig ±10px
            const horizontalShift = (Math.random() - 0.5) * 20; // von -10 bis +10 px

            Object.assign(star.style, {
                position: "absolute",
                left: `${x}px`,
                top: `${startY}px`,
                fontSize: `${size}px`,
                color: "#ffc107",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 0,
                transform: "translateX(0px) translateY(0px) scale(0.5)",
                transition: `opacity ${duration * 0.3}ms ease-in, transform ${duration}ms ease-out`
            });

            wrapper.appendChild(star);

            // Animation starten: opacity auf 1, vertikal + horizontal verschieben, skalieren
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    star.style.opacity = 1;
                    star.style.transform = `translateX(${horizontalShift}px) translateY(-40px) scale(1)`;
                });
            });

            // Fade-out starten kurz vor Ende, opacity runter, transform bleibt gleich
            setTimeout(() => {
                star.style.opacity = 0;
            }, duration * 0.8);

            // Entfernen
            setTimeout(() => {
                star.remove();
            }, duration);
        }

        setInterval(() => {
            createStar();
        }, 700);
    }
}
