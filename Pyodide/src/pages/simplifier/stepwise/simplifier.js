/**
 * Key function for generating a new circuit step in simplifier mode.
 * This will set up all the necessary elements for the next step.
 * @param stepObject {StepObject} - The step object containing all the information for the next step.
 * @param generalizeActive {boolean}
 * @param netlistContainsWires {boolean}
 */
async function nextSimplifierStep(stepObject, generalizeActive, netlistContainsWires) {
    state.pictureCounter++;  // increment before usage in the below functions

    // Create the new elements for the current step
    appendToAllValuesMap(stepObject);  // Before setupCircuitContainer because values are needed for labels
    const [circuitContainer, svgContainer] = setupCircuitContainer(stepObject, generalizeActive, netlistContainsWires);

    const [newCalcBtn, newVCBtn] = setupExplanationButtons();
    let electricalElements = getElementsFromSvgContainer(svgContainer);
    electricalElements = removeSourceFromElements(electricalElements);
    const nextElementsContainer = setupNextElementsContainer(electricalElements);
    const contentCol = document.getElementById("content-col");

    if (state.pictureCounter === 1) {
        let simplHeading = createSimplHeading();
        contentCol.appendChild(simplHeading);
        scrollContainerToTop(simplHeading);
    }
    contentCol.append(circuitContainer);

    // Create the texts and buttons for the detailed calculation explanation
    let [stepCalculationText, stepVoltageCurrentText] = generateTexts(stepObject);
    checkAndAddExplanationButtons(stepCalculationText, contentCol, stepVoltageCurrentText);

    // The order of function-calls is important
    makeElementsClickable(electricalElements, nextElementsContainer);
    prepareNextElementsContainer(contentCol, nextElementsContainer);
    const div = createExplanationBtnContainer(newCalcBtn);
    div.appendChild(newVCBtn);

    setupStepButtonsFunctionality(div);
    appendTotalValues(stepObject, electricalElements);
    if(state.pictureCounter !== 1){
        scrollContainerToTop(circuitContainer);
    }

    if (onlyOneElementLeft(electricalElements)) congratsAndVCDisplay(electricalElements, contentCol, stepObject);// no more simplifications possible

    await pageManager.pages.stepwisePage.typesetPage();

    // At the end, so the help button exists
    if (state.pictureCounter === 1) {
        highlightHelpButton();
    }

    if (state.gamification && state.pictureCounter === 1) {
        const duration = state.simplifierBaseTime;
        addSpeedModeTimeBar(duration, () => {
            speedModeTimeoutHandler();
        });
    }

    if (state.gamification && state.pictureCounter > 1 && state.speedMode?.paused) {
        resumeSpeedMode();
    }
}

// ####################################################################################################################
// ############################################# Helper functions #####################################################
// ####################################################################################################################
/**
 * Removes the source (where id starts with 'V') from the list of electrical elements,
 * so it will not be selectable as an element to be simplified.
 * @param electricalElements
 */
function removeSourceFromElements(electricalElements) {
    let withOutSource = [];
    withOutSource = electricalElements.filter(element => !element.getAttribute('id').startsWith("V"));
    return withOutSource;
}

function MJtoText(mjStr) {
    if (mjStr === undefined || mjStr === null) return "";
    if (mjStr.includes("\\Omega")) {
        mjStr = mjStr.replaceAll("\\Omega", "Ω");
    }
    if (mjStr.includes("\\mu")) {
        mjStr = mjStr.replaceAll("\\mu", "µ");
    }
    // search in mjStr for generic "\\text{x}" and replace with x
    if (mjStr.includes("\\text")) {
        while (/\\text{(.*?)}/.test(mjStr)) {
            mjStr = mjStr.replace(/\\text{(.*?)}/g, (match, p1) => p1);
        }
    }
    mjStr = mjStr.replaceAll(" ", "");
    return mjStr;
}

function addComponentValues(component) {
    if (component.Z.name !== null && component.Z.name !== undefined) {
        if (component.hasConversion) {
            // A conversion means the complex Z value used in the backend can be transformed to raw R, L or C
            state.allValuesMap.set(component.Z.name, component.Z.val);
        } else {
            // No conversion means the impedance is complex and we have to use Z.impedance
            state.allValuesMap.set(component.Z.name, component.Z.impedance);
        }
        if (state.step0Data.componentTypes === "RLC") {
            // Add complex values to map if circuit is RLC
            state.allValuesMap.set(`Z_{${component.Z.name}}`, component.Z.cpxVal);
            state.allValuesMap.set(`Zpolar_{${component.Z.name}}`, toPolar(component.Z.impedance, component.Z.phase));
            state.allValuesMap.set(component.U.name, toPolar(component.U.val, component.U.phase));
            state.allValuesMap.set(component.I.name, toPolar(component.I.val, component.I.phase));
        } else {
            state.allValuesMap.set(component.U.name, component.U.val);
            state.allValuesMap.set(component.I.name, component.I.val);
        }
    }
}

function addTotalValues(stepObject) {
    if (stepObject.simplifiedTo.hasConversion) {
        state.allValuesMap.set(stepObject.simplifiedTo.Z.name, stepObject.simplifiedTo.Z.val);
        // Rges Lges Cges
        state.allValuesMap.set(`${stepObject.simplifiedTo.Z.name[0]}${languageManager.currentLang.simplifier.totalSuffix}`, stepObject.simplifiedTo.Z.val);
    } else {
        state.allValuesMap.set(stepObject.simplifiedTo.Z.name, stepObject.simplifiedTo.Z.impedance);
        state.allValuesMap.set(stepObject.simplifiedTo.Z.name.replace('Z', 'Zpolar'), toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase));
        // Zges
        state.allValuesMap.set(`Z${languageManager.currentLang.simplifier.totalSuffix}`, stepObject.simplifiedTo.Z.val);
        state.allValuesMap.set(`Zpolar${languageManager.currentLang.simplifier.totalSuffix}`, toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase));
    }
    if (state.step0Data.componentTypes === "RLC") {
        // If RLC, then add everything in polar form
        state.allValuesMap.set(stepObject.simplifiedTo.U.name, toPolar(stepObject.simplifiedTo.U.val, stepObject.simplifiedTo.U.phase));
        state.allValuesMap.set(stepObject.simplifiedTo.I.name, toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase));
        // Add total current
        state.allValuesMap.set(`I${languageManager.currentLang.simplifier.totalSuffix}`, toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase));
    } else {
        state.allValuesMap.set(stepObject.simplifiedTo.U.name, stepObject.simplifiedTo.U.val);
        state.allValuesMap.set(stepObject.simplifiedTo.I.name, stepObject.simplifiedTo.I.val);
        // Add total current
        state.allValuesMap.set(`I${languageManager.currentLang.simplifier.totalSuffix}`, stepObject.simplifiedTo.I.val);
    }
}

function appendToAllValuesMap(stepObject) {
    for (let component of stepObject.allComponents) {
        addComponentValues(component);
    }
}

function appendTotalValues(stepObject, electricalElements) {
    if (onlyOneElementLeft(electricalElements)) {
        addTotalValues(stepObject);
    }
}

function createExplanationBtnContainer(element) {
    const div = document.createElement("div");
    div.id = `explBtnContainer${state.pictureCounter}`
    div.classList.add("container", "justify-content-center");
    div.appendChild(element);
    return div;
}

function getFinishMsg() {
    return Containers.SimplifierFinish.innerHTML
}

function setupNextElementsContainer(filteredPaths) {
    /** @type HTMLDivElement */
    const nextElementsContainer = document.createElement('div');
    nextElementsContainer.className = 'next-elements-container';
    nextElementsContainer.id = "nextElementsContainer";
    nextElementsContainer.classList.add("text-center", "py-1", "mb-3");
    nextElementsContainer.style.color = colors.current.foreground;
    if (onlyOneElementLeft(filteredPaths)) {
        nextElementsContainer.innerHTML = getFinishMsg();
    } else {
        nextElementsContainer.innerHTML = `
        <h3>${languageManager.currentLang.simplifier.nextElementsHeading}</h3>
        <ul class="px-0" id="next-elements-list"></ul>
        <button class="btn btn-warning m-1 ${state.lives === 0 ? "disabled" : ""}"" id="check-btn-parallel">${languageManager.currentLang.simplifier.checkBtnParallel}</button>
        <button class="btn btn-warning m-1 ${state.lives === 0 ? "disabled" : ""}"" id="check-btn-series">${languageManager.currentLang.simplifier.checkBtnSeries}</button> 
        <br>
        <button class="btn btn-secondary m-1 ${state.pictureCounter === 1 ? "disabled" : ""}" id="reset-btn">reset</button>
       
    `;
    }
    return nextElementsContainer;
}

/**
 * @returns {Array<HTMLDivElement>} Array has fixed length of two
 * */
function setupCircuitContainer(stepObject, generalizeActive, netlistContainsWires) {
    const circuitContainer = Containers.Circuit;
    const svgContainer = setupSvgDivContainerAndData(stepObject, generalizeActive, netlistContainsWires);
    circuitContainer.appendChild(svgContainer)
    return [circuitContainer, svgContainer];
}

function addInfoHelpButton(svgDiv) {
    /** @type {HTMLButtonElement} */
    let infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.id = "open-info-gif-btn";
    infoBtn.classList.add("btn", "btn-primary");
    infoBtn.style.position = "absolute";
    infoBtn.style.top = "5px";
    infoBtn.style.left = "5px";
    infoBtn.style.float = "left";
    infoBtn.style.color = colors.definitions.keyYellow;
    infoBtn.style.border = `1px solid ${colors.definitions.keyYellow}`;
    infoBtn.style.background = "none";
    infoBtn.style.fontWeight = "bold";
    infoBtn.innerText = "?";
    infoBtn.onclick = () => {
        infoBtn.blur();
        modalSm.show(new SimplifierInfoModal())
    };  // make sure focus is removed when opening modal
    svgDiv.insertAdjacentElement("afterbegin", infoBtn);
}

/**
 *
 * @param svgDiv {HTMLDivElement}
 * @returns {boolean}
 */
function divContainsZLabels(svgDiv) {
    let symbols = svgDiv.querySelectorAll(".element-label");
    let containsZ = false;
    for (let symbol of symbols) {
        if (symbol.classList[symbol.classList.length - 1].includes("Z")) {
            containsZ = true;
            break;
        }
    }
    return containsZ;
}

/**

/**
 * @param stepObject {StepObject}
 * @param generalizeActive {boolean}
 * @param netlistContainsWires {boolean}
 * @returns {HTMLDivElement}
 * */
function setupSvgDivContainerAndData(stepObject, generalizeActive, netlistContainsWires) {
    let svgData = stepObject.svgOrGsvgData;
    let svgDiv = new StepwisePageSvgDiv(svgData)

    let containsZ = divContainsZLabels(svgDiv.div);

    if (svgDiv.div.id === "svgDiv1" || containsZ) {
        // First svg, set valuesShown to false
        // Also set to zero if labels contain Z because they can't be toggled
        state.valuesShown.set(svgDiv.div.id, false);
    } else {
        // Set valuesShown to the previous state
        state.valuesShown.set(svgDiv.div.id, state.valuesShown.get(`svgDiv${state.pictureCounter - 1}`));
    }

    // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
     if (state.pictureCounter === 1) {
        addInfoHelpButton(svgDiv.div);
     }

     // Group the value and generalize switch together in one div
     let functionalDiv = document.createElement("div");
     functionalDiv.id = "functionalDiv";
     functionalDiv.style.position = "absolute";
     functionalDiv.style.display = "flex";
     functionalDiv.style.flexDirection = "column";
     functionalDiv.style.alignItems = "flex-end";
     functionalDiv.style.top = "5px";
     functionalDiv.style.right = "5px";
     functionalDiv.style.gap = "6px";
     svgDiv.div.appendChild(functionalDiv);

     if (!currentCircuitIsSymbolic()) addVoltageOverlay(svgDiv.div);

    if(state.pictureCounter > 1){
        // Disable switch input of the previous circuit
        const oldSwitchInput = document.getElementById(`generalizeSwitch${state.pictureCounter - 1}`);
        if (oldSwitchInput) {
            oldSwitchInput.disabled = true;  // Disable the switch
        }
    }

    if (!currentCircuitIsSymbolic()) {
        // Add name value toggle only for non-symbolic circuits (no need to toggle between R1 and R1...:) )
        addNameValueToggleBtn(svgDiv.div, functionalDiv);
    }

    addGeneralizeSwitch(stepObject, svgDiv.div, generalizeActive, netlistContainsWires, functionalDiv);
    return svgDiv.div;
}

function addVoltageOverlay(svgDiv) {
    let overlay = document.createElement("div");
    overlay.id = "voltage-overlay";
    overlay.style.color = colors.current.foreground;
    if (sourceIsAC()) {
        overlay.innerHTML = `\\( ${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${languageManager.currentLang.simplifier.totalSuffix}, ${languageManager.currentLang.simplifier.effectiveSuffix}} = ${getSourceVoltageVal()}, ` +
                            `f = ${getSourceFrequency()}\\)`;
    } else {
        overlay.innerHTML = `\\( ${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${languageManager.currentLang.simplifier.totalSuffix}} = ${getSourceVoltageVal()} \\)`;
    }
    svgDiv.appendChild(overlay);
}

function fillLabels(svgDiv) {
    // Initial values in svg are always ###.### ## because it will give us enough space
    // to display values without overlapping, so we need to label the elements with the correct names now
    let labels = svgDiv.querySelectorAll(".element-label");
    for (let label of labels) {
        if (label.nodeName === "path") continue;
        label.style.fill = colors.current.foreground;
        let span = label.querySelector("tspan");
        if (state.valuesShown.get(svgDiv.id)) {
            span.innerHTML = MJtoText(state.allValuesMap.get(label.classList[label.classList.length - 1]));
        } else {
            span.innerHTML = label.classList[label.classList.length - 1];
        }
    }
    // For U and I labels decide with RLC or not
    labels = svgDiv.querySelectorAll(".arrow");
    for (let label of labels) {
        if (label.nodeName === "path") continue;
        let span = label.querySelector("tspan");
        // If RLC circuit or kirchhoff, don't show U/I values
        if ((state.step0Data.componentTypes !== "RLC")
            && state.valuesShown.get(svgDiv.id)
            && (state.currentCircuitMap.selectorGroup !== window.definitions.selectorIDs.kirchhoff)) {
            // If RLC, show U/I values if values are shown
            span.innerHTML = MJtoText(state.allValuesMap.get(label.classList[label.classList.length - 1]));
        } else {
            // If RLC, don't show U/I values
            span.innerHTML = label.classList[label.classList.length - 1];
        }
    }
}

function addGeneralizeSwitch(stepObject, svgDiv, generalizeActive, netlistContainsWires, functDiv) {
    if (state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.quickstart) return;
    const switchDiv = document.createElement("div");
    switchDiv.classList.add("form-check", "form-switch");
    switchDiv.id = `generalizeSwitchDiv${state.pictureCounter}`;
    // switchDiv.style.position = "absolute";
    // switchDiv.style.top = "45px";
    // switchDiv.style.right = "0px";

    const switchInput = document.createElement("input");
    switchInput.classList.add("form-check-input");
    switchInput.type = "checkbox";
    switchInput.id = `generalizeSwitch${state.pictureCounter}`;
    switchInput.checked = generalizeActive; // set according to netlist comment

    switchDiv.appendChild(switchInput);
    functDiv.appendChild(switchDiv);

    if (generalizeActive && !netlistContainsWires) {
        // Can not disable generalization if there are no wires in the netlist, not reversible
        switchInput.checked = true;
        switchInput.disabled = true;  // Disable the switch
    }

    // disable the switch of the last circuit
    if(onlyOneElementLeft(removeSourceFromElements(getElementsFromSvgContainer(svgDiv)))){
            switchInput.disabled = true;  // Disable the switch
    }

    if(stepObject.gSvgData === undefined){
        switchInput.checked = false;  // Uncheck the switch
        console.log("Generalize is not possible");
    }
    if(stepObject.svgData === undefined){
        switchInput.checked = true;  // Check the switch
        switchInput.disabled = true;  // Disable the switch
        console.log("Undoing generalize is not possible");
    }

    // If original circuit is generalized the switch should be disabled
    if (state.step0Data.isGeneralized) {
            switchInput.checked = true;
            switchInput.disabled = true;  // Disable the switch
    }
    if (state.pictureCounter > 1 && document.getElementById(`generalizeSwitch${state.pictureCounter - 1}`).checked === true){
        switchInput.checked = true;
        switchInput.disabled = true;
    }
    // Add event listener to the input
    let eventTimer = null;
    switchInput.addEventListener("mouseover", () =>{
        clearTimeout(eventTimer);
        eventTimer = setTimeout(() =>{
            modalSm.show(new ExplainGeneralizeModal());
        },1700);
    })

    switchInput.addEventListener("mouseleave",  () =>{
       clearTimeout(eventTimer);
       eventTimer = null;
    })

    let touchTimer = null;
    switchInput.addEventListener("touchstart",  () =>{
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() =>{
            modalSm.show(new ExplainGeneralizeModal());
        },1700)
    });

    ['touchend', 'touchcancel', 'touchmove'].forEach(evt =>
        switchInput.addEventListener(evt, () => {
            clearTimeout(touchTimer);
            touchTimer = null;
        })
    );

    switchDiv.addEventListener("click", async () =>{
        clearTimeout(eventTimer);
        eventTimer = null;
        if (switchInput.disabled) {
            UserMessage.warning(languageManager.currentLang.alerts.generalizeDisabled);
        }
    })

    switchInput.addEventListener("change", async () => {
        const bootstrapSpinnerId = "bootstrap-spinner-gen-btn";
        const svg = svgDiv.querySelector("svg");

        svg.style.opacity = 0.5;
        svgDiv.appendChild(BootstrapSpinner.create(bootstrapSpinnerId));

        const removeSpinner = () => {svgDiv.removeChild(document.getElementById(bootstrapSpinnerId));}

        clearTimeout(eventTimer);
        eventTimer = null;
        clearTimeout(touchTimer);
        touchTimer = null;
        let obj = (await state.solvers.stepwise.getStep(stepObject.step)).data;

        if (obj === undefined || obj === null) {
            console.warn("Could not generalize this circuit!");
            switchInput.checked = false;  // Uncheck the switch
            switchInput.disabled = true;  // Disable the switch
            UserEmojiMessage.warning(languageManager.currentLang.alerts.canNotGeneralize);
            await state.apis.drawingConfig.unlock("# --generalize-false");

            removeSpinner();
            svg.style.opacity = 1;
            return;
        }
        obj = new StepObject(obj)

        let svgData;
        if (switchInput.checked) {
            // await state.apis.drawingConfig.lock("# --generalize-true");
            svgData = obj.gSvgData;
            pushCircuitEventMatomo(circuitActions.ToggleGeneralizeOn);
        } else {
            // await state.apis.drawingConfig.unlock("# --generalize-false");
            svgData = obj.svgData;
            pushCircuitEventMatomo(circuitActions.ToggleGeneralizeOff);
        }

        let newSvg = new StepwisePageSvgDiv(svgData);
        newSvg.makeElementsClickable();
        svg.replaceWith(newSvg.div.querySelector("svg"));
        newSvg.highlightElements(state.selectedElements);
        removeSpinner();
    });
}

function insertAndFinishSVG(svgDiv, newSvg) {
    let overlay = svgDiv.querySelector("#voltage-overlay");
    //overlay.insertAdjacentHTML("beforebegin", svgData);
    overlay.insertAdjacentElement("beforebegin", newSvg);
    let containsZ = divContainsZLabels(svgDiv);

    if (svgDiv.id === "svgDiv1" || containsZ) {
        // First svg, set valuesShown to false
        // Also set to zero if labels contain Z because they can't be toggled
        state.valuesShown.set(svgDiv.id, false);
    } else {
        // Set valuesShown to the previous state
        state.valuesShown.set(svgDiv.id, state.valuesShown.get(`svgDiv${state.pictureCounter - 1}`));
    }

    // Clickable again
    let electricalElements = getElementsFromSvgContainer(svgDiv);
    electricalElements = removeSourceFromElements(electricalElements);
    const nextElementsContainer = document.getElementById("nextElementsContainer");
    makeElementsClickable(electricalElements, nextElementsContainer);

    // Cleanup
    if (notLastPicture()){
        state.selectedElements = [];
        let nextElementsList = document.getElementById("next-elements-list");
        nextElementsList.innerHTML = "";
    }
}

function replaceSVGwithAnimation(svgDiv, svgData) {
    const oldSvg = svgDiv.querySelector("svg");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = svgData;
    const newSvg = tempDiv.querySelector("svg");
    newSvg.setAttribute("width", "100%");

    let elements = getElementsFromSvgContainer(svgDiv); // all paths with an ID
    elements = removeSourceFromElements(elements);
    let sharedIds = getIDsfromElements(elements);

    const allOldElements = oldSvg.querySelectorAll("[id]");
    const animatingIds = new Set(sharedIds);

    for (const el of allOldElements) {
        if (!animatingIds.has(el.id)) {
            el.style.visibility = "hidden";
        }
    }

    // Hide element labels
    let elementLabels = oldSvg.querySelectorAll(".element-label");
    for (let label of elementLabels) {
        label.style.visibility = "hidden";
    }

    for (const id of sharedIds) {
        const oldEl = oldSvg.querySelector(`#${id}`);
        const newEl = newSvg.querySelector(`#${id}`);
        if (oldEl && newEl && oldEl.tagName === "path" && newEl.tagName === "path") {
            const from = oldEl.getAttribute("d");
            const to = newEl.getAttribute("d");

            const interpolator = flubber.interpolate(from, to);
            let progress = 0;
            const animate = () => {
                if (progress >= 1) {
                    oldEl.setAttribute("d", to);
                    return;
                }
                oldEl.setAttribute("d", interpolator(progress));
                progress += 0.02;
                requestAnimationFrame(animate);
            };
            animate();
        }
    }

    setTimeout(() => {
        oldSvg.remove();
        insertAndFinishSVG(svgDiv, newSvg);
    }, 1000);
}

function getIDsfromElements(elements) {
    let ids = [];
    for (let element of elements) {
        if (element.getAttribute('id') !== null && element.getAttribute('id') !== undefined) {
            ids.push(element.getAttribute('id'));
        }
    }
    return ids;
}

function addNameValueToggleBtn(svgDiv, functDiv) {
    const nameValueToggleBtn = document.createElement("button");
    nameValueToggleBtn.type = "button";
    nameValueToggleBtn.id = `toggle-view-${state.pictureCounter}`;
    nameValueToggleBtn.classList.add("btn", "btn-secondary", "toggle-view");
    nameValueToggleBtn.style.color = colors.current.foreground;
    nameValueToggleBtn.style.border = `1px solid ${colors.current.foreground}`;
    nameValueToggleBtn.style.background = "none";
    if (state.valuesShown.get(svgDiv.id)) {
        nameValueToggleBtn.innerText = window.definitions.toggleSymbol.valuesShown;
    } else {
        nameValueToggleBtn.innerText = window.definitions.toggleSymbol.namesShown;
    }
    nameValueToggleBtn.onclick = () => {
        clearTimeout(eventTimer);
        eventTimer = null;
        clearTimeout(touchTimer);
        touchTimer = null;
        toggleNameValue(svgDiv, nameValueToggleBtn)};
    functDiv.appendChild(nameValueToggleBtn);

    let eventTimer= null;
    nameValueToggleBtn.addEventListener("mouseover", () =>{
        clearTimeout(eventTimer);
        eventTimer = setTimeout(() =>{
            modalSm.show(new ExplainValueModal());
        },1700);
    })

    nameValueToggleBtn.addEventListener("mouseleave", () =>{
        clearTimeout(eventTimer);
        eventTimer = null;
    })

    let touchTimer= null;
    nameValueToggleBtn.addEventListener("touchstart", () =>{
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() =>{
            modalSm.show(new ExplainValueModal());
        },1700)
    });

    ['touchend', 'touchcancel', 'touchmove'].forEach(evt =>
        nameValueToggleBtn.addEventListener(evt, () => {
            clearTimeout(touchTimer);
            touchTimer = null;
        })
    );
}

function toggleElements(svgDiv) {
     toggleElementSymbols(svgDiv);
    if (state.step0Data.componentTypes !== "RLC" && state.currentCircuitMap.selectorGroup !== window.definitions.selectorIDs.kirchhoff) {
        // Don't show U/I values in complex circuits
        toggleUISymbols(svgDiv);
    }
}

function toggleUISymbols(svgDiv) {
    let texts = svgDiv.querySelectorAll("text.current-label, text.voltage-label");
    for (let text of texts) {
        toggleText(text, svgDiv);
    }
}

function toggleElementSymbols(svgDiv) {
    let texts = svgDiv.querySelectorAll(".element-label");
    for (let text of texts) {
        if (text.classList.contains("V1")) continue;  // Source label stays hidden
        toggleText(text, svgDiv);
    }
}

function toggleText(text, svgDiv) {
    let span = text.querySelector("tspan");
    if (state.valuesShown.get(svgDiv.id)) {
        span.innerHTML = MJtoText(state.allValuesMap.get(text.classList[text.classList.length - 1]));
    } else {
        span.innerHTML = text.classList[text.classList.length - 1];
    }
}

function toggleNameValue(svgDiv, nameValueToggleBtn) {
    let containsZ = divContainsZLabels(svgDiv);
    if (containsZ) {
        UserMessage.info(languageManager.currentLang.alerts.notToggleable);
        return;
    }

    state.valuesShown.set(svgDiv.id, !state.valuesShown.get(svgDiv.id));
    toggleElements(svgDiv);
    // Toggle button icons
    if (state.valuesShown.get(svgDiv.id)) {
        nameValueToggleBtn.innerText = window.definitions.toggleSymbol.namesShown;
    } else {
        nameValueToggleBtn.innerText = window.definitions.toggleSymbol.valuesShown;
    }
}

function setupBboxRect(bbox, bboxId) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', bbox.x);
    rect.setAttribute('y', bbox.y);
    rect.setAttribute('width', bbox.width);
    rect.setAttribute('height', bbox.height);
    rect.setAttribute('id', bboxId);
    rect.classList.add('bounding-box');
    rect.style.pointerEvents = "none";  // to make selecting the element behind it possible
    rect.style.fill = colors.definitions.keyYellow;
    rect.style.fillOpacity = "0.3";
    return rect;
}

function createNewHighlightedBoundingBox(pathElement, bboxId) {
    const bbox = pathElement.getBBox();
    const rect = setupBboxRect(bbox, bboxId);
    pathElement.parentNode.insertBefore(rect, pathElement.nextSibling);
}

function removeElementFromList(bboxId, pathElement) {
    const listItem = document.querySelector(`li[data-bbox-id="${bboxId}"]`);
    if (listItem) {
        listItem.remove();
        let id = pathElement.getAttribute('id');
        if (id.startsWith("V")) {
            // For voltage source remove _Circle from id, since id in selectedElements is V1
            id = id.split("_")[0];
        }
        state.selectedElements = state.selectedElements.filter(e => e !== id);
    }
}

function removeExistingBoxAndText(existingBox, bboxId, pathElement) {
    existingBox.remove();
    removeElementFromList(bboxId, pathElement);
}

function addElementValueToTextBox(pathElement, bboxId, nextElementsList) {
    const value = pathElement.getAttribute('class') || 'na';
    const listItem = document.createElement('li');
    const id = pathElement.getAttribute('id') || 'no id'
    if (currentCircuitIsSymbolic()) {
        listItem.innerHTML = `\\(${id}\\)`;
    } else {
        listItem.innerHTML = `\\(${id} = ${value}\\)`;
    }
    listItem.setAttribute('data-bbox-id', bboxId);
    nextElementsList.appendChild(listItem);
    state.selectedElements.push(id);
}

/** @returns {HTMLButtonElement} */
function setupVoltageCurrentBtn() {
    /** @type {HTMLButtonElement} */
    const vcBtn = document.createElement("button");
    vcBtn.id = `vcBtn${state.pictureCounter}`
    vcBtn.classList.add("btn", "explBtn", "my-3", "mx-2", "pseudo-disabled");
    vcBtn.style.color = colors.current.foreground;
    vcBtn.style.borderColor = colors.current.foreground;
    vcBtn.textContent = languageManager.currentLang.simplifier.showVoltageBtn;
    return vcBtn;
}

/** @returns {HTMLButtonElement} */
function setupCalculationBtn() {
    /** @type {HTMLButtonElement} */
    const calcBtn = document.createElement("button");
    calcBtn.id = `calcBtn${state.pictureCounter}`
    calcBtn.classList.add("btn", "explBtn", "my-3", "mx-2");
    calcBtn.style.color = colors.current.foreground;
    calcBtn.style.borderColor = colors.current.foreground;
    calcBtn.textContent = languageManager.currentLang.simplifier.showCalculationBtn;
    calcBtn.disabled = true;
    return calcBtn;
}

async function chooseElement(pathElement, nextElementsList) {

    const bboxId = `bbox-${pathElement.getAttribute('id')}`;
    const existingBox = document.getElementById(bboxId);

    if (existingBox) {
        removeExistingBoxAndText(existingBox, bboxId, pathElement);
    } else {
        createNewHighlightedBoundingBox(pathElement, bboxId);
        addElementValueToTextBox(pathElement, bboxId, nextElementsList);
    }
    await pageManager.pages.stepwisePage.typesetPage();
}

async function checkAndSimplifyNext(div){
    const contentCol = document.getElementById("content-col");
    const nextElementsContainer = document.getElementById("nextElementsContainer");
    const svgDiv = document.getElementById(`svgDiv${state.pictureCounter}`);

    if (state.selectedElements.length <= 1) {
        UserEmojiMessage.warning(languageManager.currentLang.alerts.chooseAtLeastTwoElements);
        document.getElementById("check-btn-parallel").innerHTML = languageManager.currentLang.simplifier.checkBtnParallel;
        document.getElementById("check-btn-series").innerHTML = languageManager.currentLang.simplifier.checkBtnSeries;
    }

    let elapsed;
    if (state.gamification) {
        elapsed = pauseSpeedMode();
    }

    let now = performance.now();
    let obj = (await state.solvers.stepwise.simplifyNCpts(state.selectedElements,state.relation)).data;
    checkAndSimplify(obj, contentCol, div);

    // adjust start time for duration of calulation
    let elapsedTime = performance.now() - now;
    if (state.speedMode && state.speedMode?.startTime) {
        state.speedMode.startTime += elapsedTime;
    }

    // Only add time if elements can be simplified, otherwise directly resume
    // Also check for speed mode because this will not be executed for the last picture, speedMode will be null
    if (state.gamification && obj.canBeSimplified && state.speedMode) {
        // Get number of elements in the current circuit
        const svgDiv = document.getElementById(`svgDiv${state.pictureCounter}`);
        let electricElements = getElementsFromSvgContainer(svgDiv);
        // Add 500ms per Element
        state.speedMode.duration -= elapsed;
        state.speedMode.duration += state.simplifierAddTime * electricElements.length;
        // Update remaining time
        state.speedMode.remaining = Math.max(0, state.speedMode.duration);
    }
    if (state.gamification && state.speedMode && state.speedMode?.paused && !obj.canBeSimplified) {
        // remaining time is time from before
        state.speedMode.duration -= elapsed;
        state.speedMode.remaining = Math.max(0, state.speedMode.duration);
        resumeSpeedMode();
    }

    resetNextElements(svgDiv, nextElementsContainer);
    await pageManager.pages.stepwisePage.typesetPage();
}

function checkAndSimplify(stepObject, contentCol, div) {
    if (stepObject.canBeSimplified) {
        if (notLastPicture()) {
            contentCol.append(div);
            enableLastCalcButton();
        }
        // Remove event listeners from old picture elements
        removeOldEventListeners();
        nextSimplifierStep(stepObject);
    }
    else {
        if (stepObject.simplifierState === "notSeries"){
            UserEmojiMessage.warning(languageManager.currentLang.alerts.isNotSeries);
            pushCircuitEventMatomo(circuitActions.ErrIsNotSeries);
        }
        else if (stepObject.simplifierState === "notParallel"){
            UserEmojiMessage.warning(languageManager.currentLang.alerts.isNotParallel);
            pushCircuitEventMatomo(circuitActions.ErrIsNotParallel);
        }
        else if (stepObject.simplifierState === "notInRelation"){
            UserEmojiMessage.warning(languageManager.currentLang.alerts.canNotSimplify);
            pushCircuitEventMatomo(circuitActions.ErrCanNotSimpl);
        }
        else if (stepObject.simplifierState === "undefined"){
            UserEmojiMessage.warning(languageManager.currentLang.alerts.somethingIsWrong);
            pushCircuitEventMatomo(circuitActions.Aborted);
        }
        document.getElementById("check-btn-parallel").innerHTML = languageManager.currentLang.simplifier.checkBtnParallel;
        document.getElementById("check-btn-series").innerHTML = languageManager.currentLang.simplifier.checkBtnSeries;
        subtract1Live();
    }
}

function setupVCBtnFunctionality(vcText, contentCol, stepCalculationText) {
    const lastStepCalcBtn = document.getElementById(`calcBtn${state.pictureCounter - 1}`);
    const lastVCBtn = document.getElementById(`vcBtn${state.pictureCounter - 1}`);
    const explContainer = document.getElementById(`explBtnContainer${state.pictureCounter - 1}`);

    lastVCBtn.addEventListener("click", async () => {
        if (lastVCBtn.classList.contains("pseudo-disabled")) {
            UserMessage.info(languageManager.currentLang.simplifier.voltCurrentWillBeEnabled);
            return;
        }

        if (lastVCBtn.textContent === languageManager.currentLang.simplifier.showVoltageBtn) {
            // Open voltage/current explanation
            lastVCBtn.textContent = languageManager.currentLang.simplifier.hideVoltageBtn;
            explContainer.insertAdjacentElement("afterend", vcText);
            if (lastStepCalcBtn.textContent === languageManager.currentLang.simplifier.hideCalculationBtn) {
                lastStepCalcBtn.textContent = languageManager.currentLang.simplifier.showCalculationBtn;
                contentCol.removeChild(stepCalculationText);
            }
            await pageManager.pages.stepwisePage.typesetPage();
            pushCircuitEventMatomo(circuitActions.ViewVcExplanation)
        } else {
            // Close voltage/current explanation
            lastVCBtn.textContent = languageManager.currentLang.simplifier.showVoltageBtn;
            contentCol.removeChild(vcText);
        }
    })
}

function setupCalcBtnFunctionality(stepCalculationText, contentCol, vcText) {
    const lastStepCalcBtn = document.getElementById(`calcBtn${state.pictureCounter - 1}`);
    const explContainer = document.getElementById(`explBtnContainer${state.pictureCounter - 1}`);
    let lastVCBtn;
    lastVCBtn = document.getElementById(`vcBtn${state.pictureCounter - 1}`);

    lastStepCalcBtn.addEventListener("click", async () => {
        if (lastStepCalcBtn.textContent === languageManager.currentLang.simplifier.showCalculationBtn) {
            // Open calculation explanation
            lastStepCalcBtn.textContent = languageManager.currentLang.simplifier.hideCalculationBtn;
            if (lastVCBtn.textContent === languageManager.currentLang.simplifier.hideVoltageBtn) {
                // If voltage/current explanation is open, close it
                lastVCBtn.textContent = languageManager.currentLang.simplifier.showVoltageBtn;
                contentCol.removeChild(vcText);
            }
            // Add explanation text after container
            explContainer.insertAdjacentElement("afterend", stepCalculationText);
            await pageManager.pages.stepwisePage.typesetPage();
            pushCircuitEventMatomo(circuitActions.ViewZExplanation);
        } else {
            // Close calculation explanation
            lastStepCalcBtn.textContent = languageManager.currentLang.simplifier.showCalculationBtn;
            contentCol.removeChild(stepCalculationText);
        }
    })
}

function onlyOneElementLeft(electricalElements) {
    return electricalElements.length === 1;
}

function enableVoltageCurrentBtns() {
    for (let i = 1; i < state.pictureCounter; i++) {
        const vcBtn = document.getElementById(`vcBtn${i}`);
        vcBtn.classList.remove("pseudo-disabled");
    }
}

function elementsLeftToBeSimplified(filteredPaths) {
    return !onlyOneElementLeft(filteredPaths);
}

function prepareNextElementsContainer(contentCol, nextElementsContainer) {
    // Delete the old one if existent
    if (document.getElementById("nextElementsContainer") != null) {
        contentCol.removeChild(document.getElementById("nextElementsContainer"));
    }
    contentCol.appendChild(nextElementsContainer);
    // After appending, enable the button
    if(document.getElementById("check-btn-series") != null && document.getElementById("check-btn-parallel") != null) {
        enableCheckBtnParallel();
        enableCheckBtnSeries();
    }

}

function checkAndAddExplanationButtons(stepCalculationText, contentCol, stepVoltageCurrentText) {
    if (state.pictureCounter > 1) {
        setupCalcBtnFunctionality(stepCalculationText, contentCol, stepVoltageCurrentText);
        setupVCBtnFunctionality(stepVoltageCurrentText, contentCol, stepCalculationText);
    }
}

/**
 * @returns {Array<HTMLParagraphElement> | Array<string>} Array has fixed length of two
 * */
function generateTexts(stepObject) {
    if (stepObject.step === "step0") return ["", ""];
    let stepCalculationText = generateTextForZ(stepObject);
    stepCalculationText.style.color = colors.current.foreground;

    let stepVoltageCurrentText = generateTextForVoltageCurrent(stepObject);
    stepVoltageCurrentText.style.color = colors.current.foreground;
    return [stepCalculationText, stepVoltageCurrentText];
}

function finishCircuit(contentCol) {
    showVariableConfetti();
    enableVoltageCurrentBtns();
    showArrows(contentCol);
    pushCircuitEventMatomo(circuitActions.Finished);
}

function setupStepButtonsFunctionality(div) {
    document.getElementById("reset-btn").addEventListener('click', async () => {
        if (this.wasAborted) pushCircuitEventMatomo(circuitActions.Aborted, state.pictureCounter);
        await SimplifierPage.showSimplifierPage(state.currentCircuitMap)

        // Can only be after step 1 because the first step can't be reset, so no need to check
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
    });

    if (document.getElementById("check-btn-parallel") != null && document.getElementById("check-btn-series") != null) {
        // Check btn parallel clicked, set spinner inside and simplify next step
        document.getElementById("check-btn-parallel").addEventListener('click', async () => {
            if (state.checkBtnParallelAlreadyClicked) return;
            state.checkBtnParallelAlreadyClicked = true;

            const btn = document.getElementById("check-btn-parallel");
            btn.classList.add("disabled");
            btn.innerHTML = "<span class='spinner-border spinner-border-sm'></span>";
            state.relation = "parallel";
            try {
                await checkAndSimplifyNext(div);
            } finally {
                state.checkBtnParallelAlreadyClicked = false;
                state.relation = "null";
                btn.classList.remove("disabled");
                btn.innerHTML = languageManager.currentLang.simplifier.checkBtnParallel;
            }
        });
        // Check btn series clicked, set spinner inside and simplify next step
        document.getElementById("check-btn-series").addEventListener('click', async () => {
            if (state.checkBtnSeriesAlreadyClicked) return;
            state.checkBtnSeriesAlreadyClicked = true;

            const btn = document.getElementById("check-btn-series");
            btn.classList.add("disabled");
            btn.innerHTML = "<span class='spinner-border spinner-border-sm'></span>";
            state.relation = "series";
            try {
                await checkAndSimplifyNext(div);
            } finally {
                state.checkBtnSeriesAlreadyClicked = false;
                state.relation = "null";
                btn.classList.remove("disabled");
                btn.innerHTML = languageManager.currentLang.simplifier.checkBtnSeries;
            }
        });
    }
}

function removeOldEventListeners() {
    const svgDiv = document.getElementById(`svgDiv${state.pictureCounter}`);
    let electricElements = getElementsFromSvgContainer(svgDiv);
    for (let element of electricElements) {
        // Clone the node and replace its original with the clone, this removes all event listeners
        let clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
    }
}

function getAllElementsAndMakeClickable(nextElementsContainer, electricalElements) {
    const nextElementsList = nextElementsContainer.querySelector(`#next-elements-list`);
    electricalElements.forEach(element => setStyleAndEvent(element, nextElementsList));
}

/**
 * @returns {Array<HTMLButtonElement>} Array has fixed length of two
 */
function setupExplanationButtons() {
    const newCalcBtn = setupCalculationBtn();
    const newVCBtn = setupVoltageCurrentBtn();
    return [newCalcBtn, newVCBtn];
}

function makeElementsClickable(electricalElements, nextElementsContainer) {
    if (elementsLeftToBeSimplified(electricalElements)) {
        getAllElementsAndMakeClickable(nextElementsContainer, electricalElements);
    }
}

function congratsAndVCDisplay(electricalElements, contentCol, stepObject) {
    addFirstVCExplanation(stepObject);
    addSolutionsButton();
    finishCircuit(contentCol);
    state.currentSelector.saveFinishedCircuit(true);
    if (!state.currentCircuitFromQrScan && !state.currentCircuitFromEditor) {
        // Only add a "next circuit" button if not from QR scan
        let nextCircuitBtn = state.currentSelector.createNextCircuitBtn();
        contentCol.appendChild(nextCircuitBtn);
        // Add finished circuit to localStorage
    }
    // Finish speedmode
    if (state.gamification) {
        stopSpeedModeTimer();
        let speedModeBar = document.getElementById("speedModeBar");
        speedModeBar?.remove();
    }
}

function prepareAllValuesMap() {
    // Remove null values
    for (let k of state.allValuesMap.keys()) {
        if (k === null || k === undefined || k === "")
            state.allValuesMap.delete(k);
    }
    // Sort by key names
    state.allValuesMap = new Map([...state.allValuesMap.entries()].sort());
}

function cloneAndAdaptStep0Svg() {
    let originalStep0Svg = document.getElementById("svgDiv1");
    // check if in the original step the names are shown or the values
    let clonedSvgData;
    let toggleBtn = originalStep0Svg.querySelector("#toggle-view-1");
    if (toggleBtn !== null) {
        // We have a toggle btn so check which state it is in
        if (state.valuesShown.get("svgDiv1")) {
            // copy the svg with names shown
            originalStep0Svg.querySelector("#toggle-view-1").click();
            clonedSvgData = originalStep0Svg.cloneNode(true);
            // And click again so the original state is shown again
            originalStep0Svg.querySelector("#toggle-view-1").click();
        } else {
            clonedSvgData = originalStep0Svg.cloneNode(true);
        }
    } else {
        clonedSvgData = originalStep0Svg.cloneNode(true);
    }
    clonedSvgData.id = "clonedOverviewSvg";
    // Adapt svg data, remove info, toggle btn and generalize btn
    clonedSvgData.removeChild(clonedSvgData.querySelector("#open-info-gif-btn"));

    let functionalDiv = clonedSvgData.querySelector("#functionalDiv");
    clonedSvgData.removeChild(functionalDiv);

    let bboxes = clonedSvgData.getElementsByClassName("bounding-box");
    for (let bbox of bboxes) {
        bbox.style.display = "none";
    }
    clonedSvgData.style.width = "";  // let the table adjust itself to the screensize
    // remove volt overlay
    let overlay = clonedSvgData.querySelector("#voltage-overlay");
    if (overlay !== null) {
        clonedSvgData.removeChild(overlay);
    }
    return clonedSvgData;
}

function addSolutionsButton() {
    const solBtnContainer = createSolutionsBtnContainer();
    const solBtn = createSolutionsBtn();
    addBtnToContainer(solBtnContainer, solBtn);
    prepareAllValuesMap();
    let table = generateSolutionsTable();
    let clonedSvgData = cloneAndAdaptStep0Svg();
    clonedSvgData.appendChild(table);

    showArrows(clonedSvgData);
    let div = document.createElement("div");
    div.classList.add("circuit-container", "row", "justify-content-center");
    div.appendChild(clonedSvgData);

    solBtn.addEventListener("click", async () => {
        if (solBtn.textContent === languageManager.currentLang.simplifier.solutionsBtn) {
            // Open explanation
            solBtn.textContent = languageManager.currentLang.simplifier.hideVoltageBtn;
            solBtnContainer.appendChild(div);
            await pageManager.pages.stepwisePage.typesetPage();
            pushCircuitEventMatomo(circuitActions.ViewSolutions);
        } else {
            // Close explanation
            solBtn.textContent = languageManager.currentLang.simplifier.solutionsBtn;
            solBtnContainer.removeChild(div);
        }
    })
}

function addFirstVCExplanation(stepObject) {
    const totalCurrentContainer = createTotalCurrentContainer();
    const totalCurrentBtn = createTotalCurrentBtn();
    addBtnToContainer(totalCurrentContainer, totalCurrentBtn);
    let text = generateTextElement(stepObject);

    totalCurrentBtn.addEventListener("click", async () => {
        if (totalCurrentBtn.textContent === languageManager.currentLang.simplifier.firstVCStepBtn) {
            // Open explanation
            totalCurrentBtn.textContent = languageManager.currentLang.simplifier.hideVoltageBtn;
            totalCurrentContainer.appendChild(text);
            await pageManager.pages.stepwisePage.typesetPage();
            pushCircuitEventMatomo(circuitActions.ViewTotalExplanation);
        } else {
            // Close explanation
            totalCurrentBtn.textContent = languageManager.currentLang.simplifier.firstVCStepBtn;
            totalCurrentContainer.removeChild(text);
        }
    })
}

function addBtnToContainer(container, element) {
    document.getElementById("reset-btn").insertAdjacentElement("beforebegin", container);
    container.appendChild(element);
}

function generateTextElement(stepObject) {
    let text = document.createElement("p");
    text.innerHTML = generateTextForTotalCurrent(stepObject);
    return text;
}

function generateVZIUMaps() {
    let vMap = new Map();
    let iMap = new Map();
    let uMap = new Map();
    let zMap = new Map();
    let zPMap = new Map();
    for (let [key, value] of state.allValuesMap.entries()) {
        if (key === null || undefined) continue;

        if (key.startsWith('R') || key.startsWith('C') || key.startsWith('L')) {
            vMap.set(key, value);
        } else if (key.startsWith('U') || key.startsWith('V')) {
            uMap.set(key, value);
        } else if (key.startsWith('I')) {
            iMap.set(key, value);
        } else if (key.startsWith('Z')) {
            if (key.startsWith('Zpolar')) {
                zPMap.set(key.replace('polar', ''), value);
            } else {
                zMap.set(key, value);
            }
        }
    }
    return {vMap, zMap, zPMap, iMap, uMap};
}

function createRLCTable(vMap, helperValueRegex, tableData, color, zMap, zPMap, uMap, iMap) {
    for (let [key, value] of vMap.entries()) {
        if (helperValueRegex.test(key)) continue;
        let iKey;
        let uKey;
        if (key.includes(languageManager.currentLang.simplifier.totalSuffix)) {
            iKey = "I" + languageManager.currentLang.simplifier.totalSuffix;
            uKey = languageManager.currentLang.simplifier.voltageSymbol +  languageManager.currentLang.simplifier.totalSuffix;
        } else {
            iKey = "I" + key;
            uKey = languageManager.currentLang.simplifier.voltageSymbol + key;
        }
        let zKey = `Z_{${key}}`;
        tableData += `<tr>
            <td style="color: ${color}">\\(${key} = ${value}\\)</td>
            <td style="color: ${color}">\\(\\underline{${zKey}} = ${zMap.get(zKey)}\\)</td>
            <td style="color: ${color}">\\(\\underline{${zKey}} = ${zPMap.get(zKey)}\\)</td>
            <td style="color: ${color}">\\(\\underline{${`{${languageManager.currentLang.simplifier.voltageSymbol}}_{${key}}`}} = ${uMap.get(uKey)}\\)</td>
            <td style="color: ${color}">\\(\\underline{${`I_{${key}}`}} = ${iMap.get(iKey)}\\)</td>
            </tr>`;
    }
    if (state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.kirchhoff) {
        // Return table without total values since nothing is simplified
        return tableData;
    }
    // Total values
    let iTot = `I${languageManager.currentLang.simplifier.totalSuffix}`;
    let uTot = `${languageManager.currentLang.simplifier.voltageSymbol}${languageManager.currentLang.simplifier.totalSuffix}`;
    let zTot = `Z${languageManager.currentLang.simplifier.totalSuffix}`;
    tableData += `<tr>
        <td style="color: ${color}">-</td>
        <td style="color: ${color}">\\(\\underline{Z_\\text{${languageManager.currentLang.simplifier.totalSuffix}}} = ${zMap.get(zTot)}\\)</td>
        <td style="color: ${color}">\\(\\underline{Z_\\text{${languageManager.currentLang.simplifier.totalSuffix}}} = ${zPMap.get(zTot)}\\)</td>
        <td style="color: ${color}">\\(\\underline{${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${languageManager.currentLang.simplifier.totalSuffix}}} = ${uMap.get(uTot)}\\)</td>
        <td style="color: ${color}">\\(\\underline{I_\\text{${languageManager.currentLang.simplifier.totalSuffix}}} = ${iMap.get(iTot)}\\)</td>
        </tr>`;
    return tableData;
}

function createStandardTable(vMap, helperValueRegex, tableData, color, uMap, iMap) {
    for (let [key, value] of vMap.entries()) {
        let iKey;
        let uKey;
        if (helperValueRegex.test(key)) continue;
        if (key.includes(languageManager.currentLang.simplifier.totalSuffix)) {
            iKey = "I" + languageManager.currentLang.simplifier.totalSuffix;
            uKey = languageManager.currentLang.simplifier.voltageSymbol +  languageManager.currentLang.simplifier.totalSuffix;
        tableData += `<tr>
            <td style="color: ${color}">\\(${key[0]}_\\text{${languageManager.currentLang.simplifier.totalSuffix}} = ${value}\\)</td>
            <td style="color: ${color}">\\(${languageManager.currentLang.simplifier.voltageSymbol}_{\\text{${languageManager.currentLang.simplifier.totalSuffix}}} = ${renameVSrc(uMap.get(uKey))}\\)</td>
            <td style="color: ${color}">\\(I_\\text{${languageManager.currentLang.simplifier.totalSuffix}} = ${renameVSrc(iMap.get(iKey))}\\)</td>
            </tr>`;
        } else {
            iKey = "I" + key;
            uKey = languageManager.currentLang.simplifier.voltageSymbol + key;
        tableData += `<tr>
            <td style="color: ${color}">\\(${key} = ${value}\\)</td>
            <td style="color: ${color}">\\(${languageManager.currentLang.simplifier.voltageSymbol}_{\\text{${key}}} = ${renameVSrc(uMap.get(uKey))}\\)</td>
            <td style="color: ${color}">\\(I_\\text{${key}} = ${renameVSrc(iMap.get(iKey))}\\)</td>
            </tr>`;
        }
    }
    return tableData;
}

function sortMapByKeyIndices(vMap) {
    return new Map([...vMap.entries()].sort((a, b) => {
        const numA = a[0].match(/\d+/);
        const numB = b[0].match(/\d+/);

        if (!numA && !numB) return 0; // Both keys don't have numbers
        if (!numA) return 1; // a doesn't have a number -> at end
        if (!numB) return -1; // b doesn't have a number -> a stays

        return parseInt(numA[0]) - parseInt(numB[0]);
    }));
}

function generateSolutionsTable() {
    let table = document.createElement("div");
    table.classList.add("table-responsive");
    let isDarkMode = document.getElementById("darkmode-switch").checked;
    let tableData, color;
    color = ((isDarkMode) ? colors.keyLight : colors.definitions.keyDark);
    if (isDarkMode) {
        tableData = `<table id="solutionsTable" class="table table-dark"><tbody>`;
    } else {
        tableData = `<table id="solutionsTable" class="table table-light"><tbody>`;
    }

    let {vMap, zMap, zPMap, iMap, uMap} = generateVZIUMaps();
    // Sort map after key number (C1, R2, C3, ...)
    vMap = sortMapByKeyIndices(vMap);
    let helperValueRegex = /[A-Z]s\d*/;
    if (!currentCircuitIsSymbolic() && state.step0Data.componentTypes === "RLC") {
        tableData = createRLCTable(vMap, helperValueRegex, tableData, color, zMap, zPMap, uMap, iMap);
    } else {
        tableData = createStandardTable(vMap, helperValueRegex, tableData, color, uMap, iMap);
    }

    tableData += `</tbody></table></div>`;
    table.innerHTML = tableData;
    return table;
}
