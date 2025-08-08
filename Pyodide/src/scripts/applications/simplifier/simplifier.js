/**
 * Key function for generating a new circuit step in simplifier mode.
 * This will set up all the necessary elements for the next step.
 * @param stepObject {(Step0Object|StepObject)} - The step object containing all the information for the next step.
 */
async function nextSimplifierStep(stepObject, generalizeActive, netlistContainsWires) {
    state.pictureCounter++;  // increment before usage in the below functions

    // Create the new elements for the current step
    appendToAllValuesMap(stepObject);  // Before setupCircuitContainer because values are needed for labels
    const {circuitContainer, svgContainer} = setupCircuitContainer(stepObject, generalizeActive, netlistContainsWires);

    const {newCalcBtn, newVCBtn} = setupExplanationButtons();
    let electricalElements = getElementsFromSvgContainer(svgContainer);
    electricalElements = removeSourceFromElements(electricalElements);
    const nextElementsContainer = setupNextElementsContainer(electricalElements);
    const contentCol = document.getElementById("content-col");
    contentCol.append(circuitContainer);

    // Create the texts and buttons for the detailed calculation explanation
    let {stepCalculationText, stepVoltageCurrentText} = generateTexts(stepObject);
    checkAndAddExplanationButtons(stepCalculationText, contentCol, stepVoltageCurrentText);

    // The order of function-calls is important
    makeElementsClickable(electricalElements, nextElementsContainer);
    prepareNextElementsContainer(contentCol, nextElementsContainer);
    const div = createExplanationBtnContainer(newCalcBtn);
    div.appendChild(newVCBtn);

    setupStepButtonsFunctionality(div);
    appendTotalValues(stepObject, electricalElements);
    scrollContainerToTop(circuitContainer);
    congratsAndVCDisplayIfFinished(electricalElements, contentCol, stepObject);
    await MathJax.typesetPromise();

    // At the end, so the help button exists
    if (state.pictureCounter === 1) {
        highlightHelpButton();
    }

    if (state.gamification && state.pictureCounter === 1) {
        const duration = state.simplifierSolveTimeMs;
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
        state.allValuesMap.set(`${stepObject.simplifiedTo.Z.name[0]}${languageManager.currentLang.totalSuffix}`, stepObject.simplifiedTo.Z.val);
    } else {
        state.allValuesMap.set(stepObject.simplifiedTo.Z.name, stepObject.simplifiedTo.Z.impedance);
        state.allValuesMap.set(stepObject.simplifiedTo.Z.name.replace('Z', 'Zpolar'), toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase));
        // Zges
        state.allValuesMap.set(`Z${languageManager.currentLang.totalSuffix}`, stepObject.simplifiedTo.Z.val);
        state.allValuesMap.set(`Zpolar${languageManager.currentLang.totalSuffix}`, toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase));
    }
    if (state.step0Data.componentTypes === "RLC") {
        // If RLC, then add everything in polar form
        state.allValuesMap.set(stepObject.simplifiedTo.U.name, toPolar(stepObject.simplifiedTo.U.val, stepObject.simplifiedTo.U.phase));
        state.allValuesMap.set(stepObject.simplifiedTo.I.name, toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase));
        // Add total current
        state.allValuesMap.set(`I${languageManager.currentLang.totalSuffix}`, toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase));
    } else {
        state.allValuesMap.set(stepObject.simplifiedTo.U.name, stepObject.simplifiedTo.U.val);
        state.allValuesMap.set(stepObject.simplifiedTo.I.name, stepObject.simplifiedTo.I.val);
        // Add total current
        state.allValuesMap.set(`I${languageManager.currentLang.totalSuffix}`, stepObject.simplifiedTo.I.val);
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
    let msg;
    let sourceInfo;
    let sfx = languageManager.currentLang.totalSuffix;
    if ([circuitMapper.selectorIds.cap, circuitMapper.selectorIds.ind, circuitMapper.selectorIds.mixedId].includes(state.currentCircuitMap.selectorGroup)) {
        sfx += "," + languageManager.currentLang.effectiveSuffix;
    }
    if (currentCircuitIsSymbolic()) {
        sourceInfo = `$$ ${languageManager.currentLang.voltageSymbol}_{${sfx}}=${renameVSrc(getSourceVoltageVal())} $$`;
    } else {
        if (sourceIsAC()) {
            sourceInfo = `$$ ${languageManager.currentLang.voltageSymbol}_{${sfx}}=${getSourceVoltageVal()} $$
                          $$ f = ${getSourceFrequency()}$$`;
        } else {
            sourceInfo = `$$ ${languageManager.currentLang.voltageSymbol}_{${sfx}}=${getSourceVoltageVal()} $$`;
        }
    }

    // Give a note what voltage is used and that voltage/current is available
    msg = `
        <p class="mx-auto" style="max-width: 400px">${languageManager.currentLang.msgVoltAndCurrentAvailable}.<br></p>
        <p class="mx-auto" style="max-width: 400px">${languageManager.currentLang.msgShowVoltage}<br>${sourceInfo}</p>
        <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
        <button class="btn btn-primary mx-1 disabled" id="check-btn">check</button>
    `;
    return msg;
}

function setupNextElementsContainer(filteredPaths) {
    const nextElementsContainer = document.createElement('div');
    nextElementsContainer.className = 'next-elements-container';
    nextElementsContainer.id = "nextElementsContainer";
    nextElementsContainer.classList.add("text-center", "py-1", "mb-3");
    nextElementsContainer.style.color = colors.currentForeground;
    if (onlyOneElementLeft(filteredPaths)) {
        nextElementsContainer.innerHTML = getFinishMsg();
    } else {
        nextElementsContainer.innerHTML = `
        <h3>${languageManager.currentLang.nextElementsHeading}</h3>
        <ul class="px-0" id="next-elements-list"></ul>
        <button class="btn btn-secondary mx-1 ${state.pictureCounter === 1 ? "disabled" : ""}" id="reset-btn">reset</button>
        <button class="btn btn-primary mx-1 ${state.lives === 0 ? "disabled" : ""}"" id="check-btn">check</button>
    `;
    }
    return nextElementsContainer;
}

function setupCircuitContainer(stepObject, generalizeActive, netlistContainsWires) {
    const circuitContainer = document.createElement('div');
    circuitContainer.classList.add("circuit-container", "row", "justify-content-center", "my-2");
    const svgContainer = setupSvgDivContainerAndData(stepObject, generalizeActive, netlistContainsWires);
    circuitContainer.appendChild(svgContainer)
    return {circuitContainer, svgContainer};
}

function addInfoHelpButton(svgDiv) {
    let infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.id = "open-info-gif-btn";
    infoBtn.classList.add("btn", "btn-primary");
    infoBtn.style.position = "absolute";
    infoBtn.style.top = "5px";
    infoBtn.style.left = "5px";
    infoBtn.style.float = "left";
    infoBtn.style.color = colors.keyYellow;
    infoBtn.style.border = `1px solid ${colors.keyYellow}`;
    infoBtn.style.background = "none";
    infoBtn.style.fontWeight = "bold";
    infoBtn.innerText = "?";
    infoBtn.setAttribute("data-bs-toggle", "modal");
    infoBtn.setAttribute("data-bs-target", "#infoGif");
    infoBtn.onclick = () => {infoBtn.blur()};  // make sure focus is removed when opening modal
    svgDiv.insertAdjacentElement("afterbegin", infoBtn);
}

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

function setupSvgDivContainerAndData(stepObject, generalizeActive, netlistContainsWires) {
    const svgDiv = document.createElement('div');
    svgDiv.id = `svgDiv${state.pictureCounter}`;
    svgDiv.classList.add("svg-container", "p-2");
    svgDiv.style.border = `1px solid ${colors.currentForeground}`;
    svgDiv.style.borderRadius = "6px";
    svgDiv.style.width = "350px";
    svgDiv.style.maxWidth = "350px;";
    svgDiv.style.position = "relative";

    // Svg manipulation - set width and color for dark mode
    let svgData = stepObject.svgData;
    svgData = setSvgWidthTo(svgData, "100%");
    svgData = setSvgColorMode(svgData);
    svgDiv.innerHTML = svgData;
    let containsZ = divContainsZLabels(svgDiv);

    if (svgDiv.id === "svgDiv1" || containsZ) {
        // First svg, set valuesShown to false
        // Also set to zero if labels contain Z because they can't be toggled
        state.valuesShown.set(svgDiv.id, false);
    } else {
        // Set valuesShown to the previous state
        state.valuesShown.set(svgDiv.id, state.valuesShown.get(`svgDiv${state.pictureCounter - 1}`));
    }

    fillLabels(svgDiv);
    hideSourceLabel(svgDiv);
    hideSvgArrows(svgDiv);
    colorArrowsColorful(svgDiv);
    // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
    if (state.pictureCounter === 1) {
        addInfoHelpButton(svgDiv);
        if (!currentCircuitIsSymbolic()) addVoltageOverlay(svgDiv);
        // Add generalize button to specific circuit groups
        if (state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.res ||
            state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.cap ||
            state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.ind ||
            state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.mixedId ||
            state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.simplifier // scanned QR code
        ) {
            addGeneralizeSwitch(svgDiv, generalizeActive, netlistContainsWires);
        }
    } else {
        // Disable switch input
        const switchInput = document.getElementById(`generalizeSwitch1`); // only 1
        if (switchInput) {
            switchInput.disabled = true;  // Disable the switch
        }
    }
    if (!currentCircuitIsSymbolic()) {
        // Add name value toggle only for non-symbolic circuits (no need to toggle between R1 and R1...:) )
        addNameValueToggleBtn(svgDiv);
    }
    return svgDiv;
}

function addVoltageOverlay(svgDiv) {
    let overlay = document.createElement("div");
    overlay.id = "voltage-overlay";
    overlay.style.color = colors.currentForeground;
    if (sourceIsAC()) {
        overlay.innerHTML = `$$ ${languageManager.currentLang.voltageSymbol}_{${languageManager.currentLang.totalSuffix}, ${languageManager.currentLang.effectiveSuffix}} = ${getSourceVoltageVal()}, ` +
                            `f = ${getSourceFrequency()}$$`;
    } else {
        overlay.innerHTML = `$$ ${languageManager.currentLang.voltageSymbol}_{${languageManager.currentLang.totalSuffix}} = ${getSourceVoltageVal()} $$`;
    }
    svgDiv.appendChild(overlay);
}

function fillLabels(svgDiv) {
    // Initial values in svg are always ###.### ## because it will give us enough space
    // to display values without overlapping, so we need to label the elements with the correct names now
    let labels = svgDiv.querySelectorAll(".element-label");
    for (let label of labels) {
        if (label.nodeName === "path") continue;
        label.style.fill = colors.currentForeground;
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
            && (state.currentCircuitMap.selectorGroup !== circuitMapper.selectorIds.kirchhoff)) {
            // If RLC, show U/I values if values are shown
            span.innerHTML = MJtoText(state.allValuesMap.get(label.classList[label.classList.length - 1]));
        } else {
            // If RLC, don't show U/I values
            span.innerHTML = label.classList[label.classList.length - 1];
        }
    }
}

function addGeneralizeSwitch(svgDiv, generalizeActive, netlistContainsWires) {
    const switchDiv = document.createElement("div");
    switchDiv.classList.add("form-check", "form-switch");
    switchDiv.id = `generalizeSwitchDiv${state.pictureCounter}`;
    switchDiv.style.position = "absolute";
    switchDiv.style.top = "45px";
    switchDiv.style.right = "0px";

    const switchInput = document.createElement("input");
    switchInput.classList.add("form-check-input");
    switchInput.type = "checkbox";
    switchInput.id = `generalizeSwitch${state.pictureCounter}`;
    switchInput.checked = generalizeActive; // set according to netlist comment

    switchDiv.appendChild(switchInput);
    svgDiv.insertAdjacentElement("afterbegin", switchDiv);

    if (generalizeActive && !netlistContainsWires) {
        // Can not disable generalization if there are no wires in the netlist, not reversible
        switchInput.checked = true;
        switchInput.disabled = true;  // Disable the switch
    }

    // Add event listener to the input
    switchInput.addEventListener("change", async () => {
        if (switchInput.checked) {
            await state.drawingConfigAPI.lock("# --generalize-true");
            pushCircuitEventMatomo(circuitActions.ToggleGeneralizeOn);
        } else {
            await state.drawingConfigAPI.unlock("# --generalize-false");
            pushCircuitEventMatomo(circuitActions.ToggleGeneralizeOff);
        }
        let obj;
        if (state.pictureCounter === 1) {
            // Create for step 0
            obj = await state.simplifierAPI.createStep0();
        } else {
            return;
        }
        if (obj === undefined || obj === null) {
            console.warn("Could not generalize this circuit!");
            switchInput.checked = false;  // Uncheck the switch
            switchInput.disabled = true;  // Disable the switch
            setTimeout(() => {showMessage(languageManager.currentLang.alertCanNotGeneralize, "info", false)},0);
            await state.drawingConfigAPI.unlock("# --generalize-false");
            return;
        }
        obj.__proto__ = StepObject.prototype;
        // Replace the svg
        // Svg manipulation - set width and color for dark mode
        let svgData = obj.svgData;
        svgData = setSvgWidthTo(svgData, "100%");
        svgData = setSvgColorMode(svgData);

        // Show with animation for resistors, because we can :)
        if (state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.res) {
            replaceSVGwithAnimation(svgDiv, svgData);
        }
        // Show without animation for rest because capacitors and inductors are layered with invisible resistors for
        // better click handling, so animation is harder
        else if (state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.cap ||
                   state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.ind ||
                   state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.mixedId ||
                    state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.simplifier // no difference in scanned QR codes
        ) {
            replaceSVGwithoutAnimation(svgDiv, svgData);
        }
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

    fillLabels(svgDiv);
    hideSourceLabel(svgDiv);
    hideSvgArrows(svgDiv);
    colorArrowsColorful(svgDiv);

    // Clickable again
    let electricalElements = getElementsFromSvgContainer(svgDiv);
    electricalElements = removeSourceFromElements(electricalElements);
    const nextElementsContainer = document.getElementById("nextElementsContainer");
    makeElementsClickable(electricalElements, nextElementsContainer);

    // Cleanup
    state.selectedElements = [];
    let nextElementsList = document.getElementById("next-elements-list");
    nextElementsList.innerHTML = "";
}

function replaceSVGwithoutAnimation(svgDiv, svgData) {
    // Remove old svg
    const oldSvg = svgDiv.querySelector("svg");
    oldSvg.remove();
    // Insert new SVG
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = svgData;
    const newSvg = tempDiv.querySelector("svg");
    newSvg.setAttribute("width", "100%");
    insertAndFinishSVG(svgDiv, newSvg);
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

function addNameValueToggleBtn(svgDiv) {
    const nameValueToggleBtn = document.createElement("button");
    nameValueToggleBtn.type = "button";
    nameValueToggleBtn.id = `toggle-view-${state.pictureCounter}`;
    nameValueToggleBtn.classList.add("btn", "btn-secondary", "toggle-view");
    nameValueToggleBtn.style.position = "absolute";
    nameValueToggleBtn.style.top = "5px";
    nameValueToggleBtn.style.right = "5px";
    nameValueToggleBtn.style.color = colors.currentForeground;
    nameValueToggleBtn.style.border = `1px solid ${colors.currentForeground}`;
    nameValueToggleBtn.style.background = "none";
    if (state.valuesShown.get(svgDiv.id)) {
        nameValueToggleBtn.innerText = toggleSymbolDefinition.valuesShown;
    } else {
        nameValueToggleBtn.innerText = toggleSymbolDefinition.namesShown;
    }
    nameValueToggleBtn.onclick = () => {toggleNameValue(svgDiv, nameValueToggleBtn)};
    svgDiv.insertAdjacentElement("afterbegin", nameValueToggleBtn);
}

function toggleElements(svgDiv) {
     toggleElementSymbols(svgDiv);
    if (state.step0Data.componentTypes !== "RLC" && state.currentCircuitMap.selectorGroup !== circuitMapper.selectorIds.kirchhoff) {
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
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertNotToggleable, "info");
        },0);
        return;
    }

    state.valuesShown.set(svgDiv.id, !state.valuesShown.get(svgDiv.id));
    toggleElements(svgDiv);
    // Toggle button icons
    if (state.valuesShown.get(svgDiv.id)) {
        nameValueToggleBtn.innerText = toggleSymbolDefinition.namesShown;
    } else {
        nameValueToggleBtn.innerText = toggleSymbolDefinition.valuesShown;
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
    rect.style.fill = colors.keyYellow;
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
    if (currentCircuitIsSymbolic()) {
        listItem.innerHTML = `\\(${pathElement.getAttribute('id') || 'no id'}\\)`;
    } else {
        listItem.innerHTML = `\\(${pathElement.getAttribute('id') || 'no id'} = ${value}\\)`;
    }
    listItem.setAttribute('data-bbox-id', bboxId);
    nextElementsList.appendChild(listItem);
    state.selectedElements.push(pathElement.getAttribute('id') || 'no id');
}

function setupVoltageCurrentBtn() {
    const vcBtn = document.createElement("button");
    vcBtn.id = `vcBtn${state.pictureCounter}`
    vcBtn.classList.add("btn", "explBtn", "my-3", "mx-2");
    vcBtn.style.color = colors.currentForeground;
    vcBtn.style.borderColor = colors.currentForeground;
    vcBtn.textContent = languageManager.currentLang.showVoltageBtn;
    vcBtn.disabled = true;
    return vcBtn;
}

function setupCalculationBtn() {
    const calcBtn = document.createElement("button");
    calcBtn.id = `calcBtn${state.pictureCounter}`
    calcBtn.classList.add("btn", "explBtn", "my-3", "mx-2");
    calcBtn.style.color = colors.currentForeground;
    calcBtn.style.borderColor = colors.currentForeground;
    calcBtn.textContent = languageManager.currentLang.showCalculationBtn;
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
    await MathJax.typesetPromise();
}

async function checkAndSimplifyNext(div){
    const contentCol = document.getElementById("content-col");
    const nextElementsContainer = document.getElementById("nextElementsContainer");
    const svgDiv = document.getElementById(`svgDiv${state.pictureCounter}`);

    if (state.selectedElements.length <= 1) {
        setTimeout(() =>
            showMessage(languageManager.currentLang.alertChooseAtLeastTwoElements, "warning"),
        0);
        document.getElementById("check-btn").innerHTML = "check";
    } else {
        let elapsed;
        if (state.gamification) {
            elapsed = pauseSpeedMode();
        }

        let now = performance.now();
        let obj = await state.simplifierAPI.simplifyNCpts(state.selectedElements);
        obj.__proto__ = StepObject.prototype;
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
            state.speedMode.duration += state.simplifierAddTimeMs * electricElements.length;
            // Update remaining time
            state.speedMode.remaining = Math.max(0, state.speedMode.duration);
        }
        if (state.gamification && state.speedMode && state.speedMode?.paused && !obj.canBeSimplified) {
            // remaining time is time from before
            state.speedMode.duration -= elapsed;
            state.speedMode.remaining = Math.max(0, state.speedMode.duration);
            resumeSpeedMode();
        }
    }

    resetNextElements(svgDiv, nextElementsContainer);
    await MathJax.typesetPromise();
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
    } else {
        setTimeout(() =>
            showMessage(languageManager.currentLang.alertCanNotSimplify, "warning")
            , 0);
        pushCircuitEventMatomo(circuitActions.ErrCanNotSimpl);
        document.getElementById("check-btn").innerHTML = "check";
        subtract1Live();
    }
}

function setupVCBtnFunctionality(vcText, contentCol, stepCalculationText) {
    const lastStepCalcBtn = document.getElementById(`calcBtn${state.pictureCounter - 1}`);
    const lastVCBtn = document.getElementById(`vcBtn${state.pictureCounter - 1}`);
    const explContainer = document.getElementById(`explBtnContainer${state.pictureCounter - 1}`);

    lastVCBtn.addEventListener("click", async () => {
        if (lastVCBtn.textContent === languageManager.currentLang.showVoltageBtn) {
            // Open voltage/current explanation
            lastVCBtn.textContent = languageManager.currentLang.hideVoltageBtn;
            explContainer.insertAdjacentElement("afterend", vcText);
            if (lastStepCalcBtn.textContent === languageManager.currentLang.hideCalculationBtn) {
                lastStepCalcBtn.textContent = languageManager.currentLang.showCalculationBtn;
                contentCol.removeChild(stepCalculationText);
            }
            await MathJax.typesetPromise();
            pushCircuitEventMatomo(circuitActions.ViewVcExplanation)
        } else {
            // Close voltage/current explanation
            lastVCBtn.textContent = languageManager.currentLang.showVoltageBtn;
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
        if (lastStepCalcBtn.textContent === languageManager.currentLang.showCalculationBtn) {
            // Open calculation explanation
            lastStepCalcBtn.textContent = languageManager.currentLang.hideCalculationBtn;
            if (lastVCBtn.textContent === languageManager.currentLang.hideVoltageBtn) {
                // If voltage/current explanation is open, close it
                lastVCBtn.textContent = languageManager.currentLang.showVoltageBtn;
                contentCol.removeChild(vcText);
            }
            // Add explanation text after container
            explContainer.insertAdjacentElement("afterend", stepCalculationText);
            await MathJax.typesetPromise();
            pushCircuitEventMatomo(circuitActions.ViewZExplanation);
        } else {
            // Close calculation explanation
            lastStepCalcBtn.textContent = languageManager.currentLang.showCalculationBtn;
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
        vcBtn.disabled = false;
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
    enableCheckBtn();
}

function checkAndAddExplanationButtons(stepCalculationText, contentCol, stepVoltageCurrentText) {
    if (state.pictureCounter > 1) {
        setupCalcBtnFunctionality(stepCalculationText, contentCol, stepVoltageCurrentText);
        setupVCBtnFunctionality(stepVoltageCurrentText, contentCol, stepCalculationText);
    }
}

function generateTexts(stepObject) {
    if (stepObject.step === "step0") return {stepCalculationText: "", stepVoltageCurrentText: ""};
    let stepCalculationText = generateTextForZ(stepObject);
    stepCalculationText.style.color = colors.currentForeground;

    let stepVoltageCurrentText = generateTextForVoltageCurrent(stepObject);
    stepVoltageCurrentText.style.color = colors.currentForeground;
    return {stepCalculationText, stepVoltageCurrentText};
}

function finishCircuit(contentCol) {
    showVariableConfetti();
    enableVoltageCurrentBtns();
    showArrows(contentCol);
    pushCircuitEventMatomo(circuitActions.Finished);
}

function setupStepButtonsFunctionality(div) {
    document.getElementById("reset-btn").addEventListener('click', () => {
        // Can only be after step 1 because the first step can't be reset, so no need to check
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        resetSimplifierPage(true);
        if (state.gamification) {
            // Reset speed mode
            stopSpeedModeTimer();
            let speedModeBar = document.getElementById("speedModeBar");
            if (speedModeBar) {
                speedModeBar.remove();
            }
        }
    });
    // Check btn clicked, set spinner inside and simplify next step
    document.getElementById("check-btn").addEventListener('click', async () => {
        if (state.checkBtnAlreadyClicked) return;
        state.checkBtnAlreadyClicked = true;

        const btn = document.getElementById("check-btn");
        btn.classList.add("disabled");
        btn.innerHTML = "<span class='spinner-border spinner-border-sm'></span>";

        try {
            await checkAndSimplifyNext(div);
        } finally {
            state.checkBtnAlreadyClicked = false;
            btn.classList.remove("disabled");
            btn.innerHTML = "check";
        }
    });
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

function setupExplanationButtons() {
    const newCalcBtn = setupCalculationBtn();
    const newVCBtn = setupVoltageCurrentBtn();
    return {newCalcBtn, newVCBtn};
}

function makeElementsClickable(electricalElements, nextElementsContainer) {
    if (elementsLeftToBeSimplified(electricalElements)) {
        getAllElementsAndMakeClickable(nextElementsContainer, electricalElements);
    }
}

function congratsAndVCDisplayIfFinished(electricalElements, contentCol, stepObject) {
    if (onlyOneElementLeft(electricalElements)) {
        addFirstVCExplanation(stepObject);
        addSolutionsButton();
        finishCircuit(contentCol);
        if (!state.currentCircuitFromQrScan && !state.currentCircuitFromUserZip) {
            // Only add a "next circuit" button if not from QR scan
            let nextCircuitBtn = createNextCircuitButton();
            contentCol.appendChild(nextCircuitBtn);
            // Add finished circuit to localStorage
            saveFinishedCircuitAndUpdateSelectorCounters();
        }
        // Finish speedmode
        if (state.gamification) {
            stopSpeedModeTimer();
            let speedModeBar = document.getElementById("speedModeBar");
            speedModeBar?.remove();
        }

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
    let toggleBtnClone = clonedSvgData.querySelector("#toggle-view-1");
    if (toggleBtnClone !== null) {
        // Can be null for symbolic circuits
        clonedSvgData.removeChild(toggleBtnClone);
    }
    let generalizeSwitch = clonedSvgData.querySelector("#generalizeSwitchDiv1");
    if (generalizeSwitch !== null) {
        clonedSvgData.removeChild(generalizeSwitch);
    }
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
        if (solBtn.textContent === languageManager.currentLang.solutionsBtn) {
            // Open explanation
            solBtn.textContent = languageManager.currentLang.hideVoltageBtn;
            solBtnContainer.appendChild(div);
            await MathJax.typesetPromise();
            pushCircuitEventMatomo(circuitActions.ViewSolutions);
        } else {
            // Close explanation
            solBtn.textContent = languageManager.currentLang.solutionsBtn;
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
        if (totalCurrentBtn.textContent === languageManager.currentLang.firstVCStepBtn) {
            // Open explanation
            totalCurrentBtn.textContent = languageManager.currentLang.hideVoltageBtn;
            totalCurrentContainer.appendChild(text);
            await MathJax.typesetPromise();
            pushCircuitEventMatomo(circuitActions.ViewTotalExplanation);
        } else {
            // Close explanation
            totalCurrentBtn.textContent = languageManager.currentLang.firstVCStepBtn;
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
        if (key === null) continue;
        if (key === undefined) continue;
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
        let iKey = "I" + key.slice(1);
        let uKey = languageManager.currentLang.voltageSymbol + key.slice(1);
        let zKey = `Z_{${key}}`;
        tableData += `<tr>
            <td style="color: ${color}">$$${key} = ${value}$$</td>
            <td style="color: ${color}">$$\\underline{${zKey}} = ${zMap.get(zKey)}$$</td>
            <td style="color: ${color}">$$\\underline{${zKey}} = ${zPMap.get(zKey)}$$</td>
            <td style="color: ${color}">$$\\underline{${uKey}} = ${uMap.get(uKey)}$$</td>
            <td style="color: ${color}">$$\\underline{${iKey}} = ${iMap.get(iKey)}$$</td>
            </tr>`;
    }
    if (state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.kirchhoff) {
        // Return table without total values since nothing is simplified
        return tableData;
    }
    // Total values
    let iTot = `I${languageManager.currentLang.totalSuffix}`;
    let uTot = `${languageManager.currentLang.voltageSymbol}${languageManager.currentLang.totalSuffix}`;
    let zTot = `Z${languageManager.currentLang.totalSuffix}`;
    tableData += `<tr>
        <td style="color: ${color}">-</td>
        <td style="color: ${color}">$$\\underline{Z_{${languageManager.currentLang.totalSuffix}}} = ${zMap.get(zTot)}$$</td>
        <td style="color: ${color}">$$\\underline{Z_{${languageManager.currentLang.totalSuffix}}} = ${zPMap.get(zTot)}$$</td>
        <td style="color: ${color}">$$\\underline{${languageManager.currentLang.voltageSymbol}_{${languageManager.currentLang.totalSuffix}}} = ${uMap.get(uTot)}$$</td>
        <td style="color: ${color}">$$\\underline{I_{${languageManager.currentLang.totalSuffix}}} = ${iMap.get(iTot)}$$</td>
        </tr>`;
    return tableData;
}

function createStandardTable(vMap, helperValueRegex, tableData, color, uMap, iMap) {
    for (let [key, value] of vMap.entries()) {
        if (helperValueRegex.test(key)) continue;
        let iKey = "I" + key.slice(1);
        let uKey = languageManager.currentLang.voltageSymbol + key.slice(1);
        tableData += `<tr>
            <td style="color: ${color}">$$${key} = ${value}$$</td>
            <td style="color: ${color}">$$${uKey} = ${renameVSrc(uMap.get(uKey))}$$</td>
            <td style="color: ${color}">$$${iKey} = ${renameVSrc(iMap.get(iKey))}$$</td>
            </tr>`;
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
    color = ((isDarkMode) ? colors.keyLight : colors.keyDark);
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
