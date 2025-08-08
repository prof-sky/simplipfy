async function setupWheatstoneSVGContainer() {
    const circuitContainer = document.createElement('div');
    circuitContainer.classList.add("circuit-container", "row", "justify-content-center", "mt-4", "mb-2");
    let svgData = await state.pyodideAPI.readFile(state.currentCircuitMap.overViewSvgFile, "utf8");
    const svgContainer = await setupWheatstoneSVG(svgData);
    circuitContainer.appendChild(svgContainer)
    return {circuitContainer, svgContainer};
}

async function setupWheatstoneSVG(svgData) {
    const svgDiv = document.createElement('div');
    svgDiv.id = `svgDiv${state.pictureCounter}`;
    svgDiv.classList.add("svg-container", "p-2");
    svgData = setSvgWidthTo(svgData, "100%");
    svgDiv.style.border = `1px solid ${colors.currentForeground}`;
    svgDiv.style.borderRadius = "6px";
    svgDiv.style.width = "350px";
    svgDiv.style.maxWidth = "350px;";
    svgDiv.style.position = "relative";

    // Svg manipulation
    svgData = setSvgColorMode(svgData);
    svgData = svgData.replaceAll("#ffc107", colors.currentForeground);  // recolor from selector
    svgDiv.innerHTML = svgData;
    svgDiv.querySelector("svg").style.scale = "1.3";
    svgDiv.querySelector("svg").style.zIndex = "-10";
    fillLabels(svgDiv);
    hideSvgArrows(svgDiv);
    adaptVoltmeter(svgDiv);
    adaptV1Label(svgDiv);

    // Add value over element labels
    addValueLabels(svgDiv);
    updateValueLabels(svgDiv);

    // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
    addWheatstoneCircuitNavigator(svgDiv);
    addWheatstoneInfoHelpButton(svgDiv);

    return svgDiv;
}

function adaptV1Label(svgDiv) {
    // Hide the V1 label and show the arrow
    let v1Label = svgDiv.querySelector("text.element-label.V1");
    let tspan = v1Label.querySelector("tspan");
    tspan.innerHTML = `${languageManager.currentLang.voltageSymbol}q`;
}

function adaptVoltmeter(svgDiv) {
    // Hide the voltmeter label and show the arrow
    let voltmeter = svgDiv.querySelector(".element-label.VMm");
    voltmeter.style.display = "none";

    let voltmeterArrow = svgDiv.querySelectorAll(".voltage-label.arrow.Um");
    for (let arrow of voltmeterArrow) {
        arrow.style.display = "block";
    }
    let voltmeterArrowLabel = svgDiv.querySelector("text.voltage-label.arrow.Um");
    let tspan = voltmeterArrowLabel.querySelector("tspan");
    tspan.innerHTML = `${languageManager.currentLang.voltageSymbol}m`;
}

function addValueLabels(svgDiv) {
    let R1 = svgDiv.querySelector(".element-label.R1");
    let r1Span = R1.querySelector("tspan");
    let R2 = svgDiv.querySelector(".element-label.R2");
    let r2Span = R2.querySelector("tspan");
    let R3 = svgDiv.querySelector(".element-label.R3");
    let r3Span = R3.querySelector("tspan");
    let R4 = svgDiv.querySelector(".element-label.R4");
    let r4Span = R4.querySelector("tspan");
    let V1 = svgDiv.querySelector(".element-label.V1");
    let v1Span = V1.querySelector("tspan");
    let Vmm = svgDiv.querySelector("text.voltage-label.arrow.Um");
    let vmmSpan = Vmm.querySelector("tspan");

    let cloned = r1Span.cloneNode(true);
    R1.insertBefore(cloned, r1Span);
    cloned = r2Span.cloneNode(true);
    R2.insertBefore(cloned, r2Span);
    cloned = r3Span.cloneNode(true);
    R3.insertBefore(cloned, r3Span);
    cloned = r4Span.cloneNode(true);
    R4.insertBefore(cloned, r4Span);
    cloned = v1Span.cloneNode(true);
    V1.insertBefore(cloned, v1Span);
    cloned = vmmSpan.cloneNode(true);
    Vmm.insertBefore(cloned, vmmSpan);
}

function updateValueLabels(svgDiv) {
    let R1 = svgDiv.querySelector(".element-label.R1");
    let r1Span = R1.querySelector("tspan");
    let R2 = svgDiv.querySelector(".element-label.R2");
    let r2Span = R2.querySelector("tspan");
    let R3 = svgDiv.querySelector(".element-label.R3");
    let r3Span = R3.querySelector("tspan");
    let R4 = svgDiv.querySelector(".element-label.R4");
    let r4Span = R4.querySelector("tspan");
    let V1 = svgDiv.querySelector(".element-label.V1");
    let v1Span = V1.querySelector("tspan");
    let Vmm = svgDiv.querySelector("text.voltage-label.arrow.Um");
    let vmmSpan = Vmm.querySelector("tspan");

    r1Span.innerHTML = state.options[state.currentOption].R1 + "Ω";
    r2Span.innerHTML = state.options[state.currentOption].R2 + "Ω";
    r3Span.innerHTML = state.options[state.currentOption].R3 + "Ω";
    r4Span.innerHTML = state.options[state.currentOption].R4 + "Ω";
    v1Span.innerHTML = state.options[state.currentOption].Uq + "V";
    vmmSpan.innerHTML = state.options[state.currentOption].Um + "V";
}

function addWheatstoneCircuitNavigator(svgDiv) {
    let prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.classList.add("btn", "btn-primary");
    prevBtn.style.position = "absolute";
    prevBtn.style.top = "5px";
    prevBtn.style.right = "48px";
    prevBtn.style.float = "right";
    prevBtn.style.color = colors.keyYellow;
    prevBtn.style.border = `1px solid ${colors.keyYellow}`;
    prevBtn.style.background = "none";
    prevBtn.style.fontWeight = "bold";
    prevBtn.style.zIndex = "10";
    prevBtn.innerText = "←";
    prevBtn.id = "wheat-prev-btn";
    svgDiv.insertAdjacentElement("afterbegin", prevBtn);

    let nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.classList.add("btn", "btn-primary");
    nextBtn.style.position = "absolute";
    nextBtn.style.top = "5px";
    nextBtn.style.right = "5px";
    nextBtn.style.float = "right";
    nextBtn.style.color = colors.keyYellow;
    nextBtn.style.border = `1px solid ${colors.keyYellow}`;
    nextBtn.style.background = "none";
    nextBtn.style.fontWeight = "bold";
    nextBtn.style.zIndex = "10";
    nextBtn.innerText = "→";
    nextBtn.id = "wheat-next-btn";
    svgDiv.insertAdjacentElement("afterbegin", nextBtn);

    if (state.currentOption === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = false;
    } else if (state.currentOption === (state.options.length - 1)) {
        prevBtn.disabled = false;
        nextBtn.disabled = true;
    }

    prevBtn.onclick = async () => {
        // Disable button when left end reached
        if (state.currentOption === 0) {
            prevBtn.setAttribute("disabled", "true");
        } else {
            prevBtn.removeAttribute("disabled");
            state.currentOption--;
            resetWheatstonePage(true);
        }
    };
    nextBtn.onclick = async () => {
        // Disable button when right end reached
        if (state.currentOption === (state.options.length - 1)) {
            nextBtn.setAttribute("disabled", "true");
        } else {
            nextBtn.removeAttribute("disabled");
            state.currentOption++;
            resetWheatstonePage(true);
        }
    };
}

function addWheatstoneInfoHelpButton(svgDiv) {
    let infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.classList.add("btn", "btn-primary", "open-info-gif-btn");
    infoBtn.style.position = "absolute";
    infoBtn.style.top = "5px";
    infoBtn.style.left = "5px";
    infoBtn.style.float = "left";
    infoBtn.style.color = colors.keyYellow;
    infoBtn.style.border = `1px solid ${colors.keyYellow}`;
    infoBtn.style.background = "none";
    infoBtn.style.fontWeight = "bold";
    infoBtn.style.zIndex = "10";
    infoBtn.innerText = "?";
    infoBtn.setAttribute("data-bs-toggle", "modal");
    infoBtn.setAttribute("data-bs-target", "#wheatstoneInfoModal");
    infoBtn.id = "open-info-gif-btn-1";
    infoBtn.onclick = () => {infoBtn.blur()};  // make sure focus is removed when opening modal
    svgDiv.insertAdjacentElement("afterbegin", infoBtn);
}

async function getWheatstoneValues() {
    let options = {};
    // TODO don't hardcode !!
    //let optionsFile = state.currentCircuitMap.circuitFile.replace(".txt", `_options.json`);
    let optionsFile = "00_wheat_options.json";
    let optionsPath;
    //if (state.currentCircuitFromUserZip) {
    //    optionsPath = conf.userCircuitsPath + `${state.selectedZipDirName}/${state.currentCircuitMap.sourceDir}` + "/" + optionsFile;
    //} else {
    optionsPath = `${conf.pyodideCircuitPath}/wheatstone/` + optionsFile;
    //}

    let content;
    try {
        content = await state.pyodideAPI.readFile(optionsPath);
        if (content === null || content === "" || content === undefined) {
            throw new Error("Options file is empty or not found");
        } else {
            options = JSON.parse(content);
        }
    } catch (error) {
        console.error("Error parsing options file: " + error);
        showMessage(error, "error", false);
        options = null;
        pushErrorEventMatomo(errorActions.optionsFileError, error);
    }
    for (let option of options) {
        if (option.R1 === undefined) {
            option.R1 = "?";
        }
        if (option.R2 === undefined) {
            option.R2 = "?";
        }
        if (option.R3 === undefined) {
            option.R3 = "?";
        }
        if (option.R4 === undefined) {
            option.R4 = "?";
        }
        if (option.Uq === undefined) {
            option.Uq = "?";
        }
        if (option.Um === undefined) {
            option.Um = "?";
        }
    }

    return options;
}

function setupButtonContainer() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'next-elements-container';
    buttonContainer.id = "nextElementsContainer";
    buttonContainer.classList.add("text-center", "py-1", "mb-3");
    buttonContainer.style.color = colors.currentForeground;
    buttonContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
            <button class="btn btn-primary mx-1" id="check-btn">check</button>
        </div>  
    `;
    buttonContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        resetWheatstonePage(true);
    });
    let checkBtn = buttonContainer.querySelector("#check-btn");
    checkBtn.addEventListener('click', async () => {
        checkBtn.innerHTML = "<span class='spinner-border spinner-border-sm'></span>";
        await checkWheatstoneInput();
        checkBtn.innerHTML = "check";
    });
    return buttonContainer;
}

async function resetWheatstonePage(calledFromResetBtn = false) {
    clearSimplifierPageContainer();
    showSpinnerLoadingCircuit();
    state.pictureCounter = 0;
    //resetExtraLiveModal();
    scrollBodyToTop();
    //resetLives();
    if (calledFromResetBtn) {
        startWheatstone();  // Draw the first picture again
    }
}

function createPopupInput() {
    let inputPopup = document.createElement("div");
    inputPopup.innerHTML = `<div id="input-popup" class="position-fixed top-50 start-50 translate-middle p-4 bg-light border rounded shadow"
                                 style="display: none; z-index: 1050; min-width: 200px;">
                                <label for="number-input" class="form-label">${languageManager.currentLang.inputPopupTitle}</label>
                                <input type="number" id="number-input" name="nr-input" min="10" max="100" class="form-control mb-2"/>
                                <div class="d-flex justify-content-center" style="gap: 5px">
                                    <button id="popup-cancel" class="btn btn-secondary btn-sm">X</button>
                                    <button id="popup-confirm" class="btn btn-primary btn-sm me-2" style="background-color: ${colors.keyYellow}; border: none; color: ${colors.keyDark}">OK</button>
                                </div>
                            </div>`;
    inputPopup.id = "input-popup-container";
    return inputPopup;
}

function createCells(table) {
    // top left
    let row1 = table.insertRow();
    let cell = row1.insertCell();
    if (state.options[state.currentOption].R1 === "?") {
        cell.innerHTML = `\\(R1=${state.options[state.currentOption].R1}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R1";
    } else {
        cell.innerHTML = `\\(R1=${state.options[state.currentOption].R1}\\Omega\\)`;
    }
    cell.id = "R1";
    cell.setAttribute("value", `${state.options[state.currentOption].R1}`);

    // top right
    cell = row1.insertCell();
    if (state.options[state.currentOption].R3 === "?") {
        cell.innerHTML = `\\(R3=${state.options[state.currentOption].R3}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R3";
    } else {
        cell.innerHTML = `\\(R3=${state.options[state.currentOption].R3}\\Omega\\)`;
    }
    cell.id = "R3";
    cell.setAttribute("value", `${state.options[state.currentOption].R3}`);

    // middle left
    let row2 = table.insertRow();
    cell = row2.insertCell();
    if (state.options[state.currentOption].R2 === "?") {
        cell.innerHTML = `\\(R2=${state.options[state.currentOption].R2}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R2";
    } else {
        cell.innerHTML = `\\(R2=${state.options[state.currentOption].R2}\\Omega\\)`;
    }
    cell.setAttribute("value", `${state.options[state.currentOption].R2}`);
    cell.id = "R2";

    // middle right
    cell = row2.insertCell();
    if (state.options[state.currentOption].R4 === "?") {
        cell.innerHTML = `\\(R4=${state.options[state.currentOption].R4}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R4";
    } else {
        cell.innerHTML = `\\(R4=${state.options[state.currentOption].R4}\\Omega\\)`;
    }
    cell.setAttribute("value", `${state.options[state.currentOption].R4}`);
    cell.id = "R4";

    // bottom left
    let row3 = table.insertRow();
    cell = row3.insertCell();
    if (state.options[state.currentOption].Um === "?") {
        cell.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}m=${state.options[state.currentOption].Um}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "Um";
    } else {
        cell.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}m=${state.options[state.currentOption].Um}V\\)`;
    }
    cell.setAttribute("value", `${state.options[state.currentOption].Um}`);
    cell.id = "Um";

    // bottom right
    cell = row3.insertCell();
    if (state.options[state.currentOption].Uq === "?") {
        cell.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}q=${state.options[state.currentOption].Uq}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "Uq";
    } else {
        cell.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}q=${state.options[state.currentOption].Uq}V\\)`;
    }
    cell.setAttribute("value", `${state.options[state.currentOption].Uq}`);
    cell.id = "Uq";
}

function cellClickedHandler(td) {
    td.style.textAlign = "left";
    if (td.classList.contains("wheatstone-unknown")) {
        td.style.color = colors.keyYellow;
        td.style.borderBottom = `1px solid ${colors.keyYellow}`;
        td.style.cursor = "pointer";
        td.addEventListener("click", () => {
            td.style.color = colors.keyYellowDarkened;
            setTimeout(() => {
                td.style.color = colors.keyYellow;
            }, 50);
            const inputPopup = document.getElementById("input-popup");
            inputPopup.style.display = "block";
            const numberInput = document.getElementById("number-input");
            numberInput.focus();
            numberInput.value = "";
            const popupConfirm = document.getElementById("popup-confirm");
            popupConfirm.onclick = async () => {
                let value = parseFloat(numberInput.value);
                if (isNaN(value)) {
                    showMessage(languageManager.currentLang.alertInvalidNumber, "warning");
                    return;
                }
                let id = td.id;
                if (id.toString().includes("Um")) {
                    td.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}m=${value}V\\)`;
                } else if (id.toString().includes("Uq")) {
                    td.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}q=${value}V\\)`;
                } else {
                    td.innerHTML = `\\(${id}=${value}\\Omega\\)`;
                }
                td.setAttribute("value", value.toString());
                inputPopup.style.display = "none";
                await MathJax.typesetPromise();
            };
            const popupCancel = document.getElementById("popup-cancel");
            popupCancel.onclick = () => {
                inputPopup.style.display = "none";
            };
        });
    } else {
        td.style.color = colors.currentForeground;
    }
}

function setupValuesTable() {
    let overlay = document.createElement("div");
    overlay.id = "values-table-overlay";
    overlay.style.position = "relative"; // something different from static to get the z-index working
    overlay.style.zIndex = "100";
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    if (colors.currentBackground === colors.keyDark) {
        table.classList.add("table-dark");
    } else {
        table.classList.add("table-light");
    }
    table.style.width = "fit-content";

    state.unknown = ""; // reset
    createCells(table);

    table.querySelectorAll("td").forEach(td => {
        cellClickedHandler(td);
    });
    overlay.appendChild(table);
    return overlay;
}

function createWheatstoneExplanationContainer(values) {
    let explanationContainer = document.createElement("div");
    explanationContainer.id = "explanation-container";
    explanationContainer.classList.add("explanation-container", "mb-3", "p-2");
    explanationContainer.style.backgroundColor = colors.currentBsBackground;
    explanationContainer.style.color = colors.currentForeground;
    explanationContainer.innerHTML = getExplanation(values);
    return explanationContainer;
}

function makeElementsClickableForWheatstone(svgContainer, electricalElements) {
    electricalElements.forEach(element => {
        element.style.cursor = "pointer";
        element.addEventListener('click', () => {
            let id = element.getAttribute("id");
            if (id === "VMm_Circle") {
                id = "Um";
            }
            if (state.options[state.currentOption][id] === "?") {
                let tableDiv = document.getElementById("values-table-overlay");
                let table = tableDiv.querySelector("table");
                let td = table.querySelector(`#${id}`);
                td.click();
            } else {
                setTimeout(() => {
                    showMessage(languageManager.currentLang.canNotSetElement, "info");
                });
            }
        });
    });
}

function getTableValues() {
    let tableDiv = document.getElementById("values-table-overlay");
    let table = tableDiv.querySelector("table");
    let values = {};
    let row1 = table.rows[0];
    let row2 = table.rows[1];
    let row3 = table.rows[2];
    let topLeft = row1.cells[0];
    let topRight = row1.cells[1];
    let bottomLeft = row2.cells[0];
    let bottomRight = row2.cells[1];
    let um = row3.cells[0];
    let uq = row3.cells[1];
    values.R1 = parseFloat(topLeft.getAttribute("value"));
    values.R2 = parseFloat(bottomLeft.getAttribute("value"));
    values.R3 = parseFloat(topRight.getAttribute("value"));
    values.R4 = parseFloat(bottomRight.getAttribute("value"));
    values.Um = parseFloat(um.getAttribute("value"));
    values.Uq = parseFloat(uq.getAttribute("value"));
    return values;
}

function checkValues(values) {
    let errorCode = 0;
    for (const key in values) {
        if (key === "Um" || key === "Uq") {
            if (isNaN(values[key])) {
                errorCode = 1;
                break;
            } else {
                continue; // Can be positive and negative
            }
        }
        if (isNaN(values[key])) {
            errorCode = 1;
            break;
        } else if (values[key] <= 0) {
            errorCode = 2;
            break;
        }
    }
    return errorCode;
}
