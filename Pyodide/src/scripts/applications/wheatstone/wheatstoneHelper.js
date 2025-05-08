async function initWheatstoneSolverObject(circuitMap) {
    if (state.wheatstoneSolverAPI !== null) {
        await state.wheatstoneSolverAPI.resetWheatstoneSolver();
    }

    let paramMap = new Map();
    paramMap.set("volt", languageManager.currentLang.voltageSymbol);
    paramMap.set("total", languageManager.currentLang.totalSuffix);

    state.wheatstoneSolverAPI = new WheatstoneSolverAPI(worker);
    await state.wheatstoneSolverAPI.initWheatstoneSolver(circuitMap.circuitFile, `${conf.pyodideCircuitPath}/${circuitMap.sourceDir}`, paramMap);
}

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
    svgDiv.innerHTML = svgData;
    svgDiv.querySelector("svg").style.scale = "1.3";
    svgDiv.querySelector("svg").style.zIndex = "-10";
    fillLabels(svgDiv);
    addValueLabels(svgDiv);
    updateValueLabels(svgDiv);
    hideSvgArrows(svgDiv);
    // TODO showVoltmeterArrow(svgDiv);

    // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
    addWheatstoneCircuitNavigator(svgDiv);
    addWheatstoneInfoHelpButton(svgDiv);

    return svgDiv;
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

    r1Span.innerHTML = state.options[state.currentOption].R1 + "Ω";
    r2Span.innerHTML = state.options[state.currentOption].R2 + "Ω";
    r3Span.innerHTML = state.options[state.currentOption].R3 + "Ω";
    r4Span.innerHTML = state.options[state.currentOption].R4 + "Ω";
    v1Span.innerHTML = state.options[state.currentOption].Uq + "V";
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
    prevBtn.innerText = "<";
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
    nextBtn.innerText = ">";
    nextBtn.id = "wheat-next-btn";
    svgDiv.insertAdjacentElement("afterbegin", nextBtn);

    prevBtn.onclick = async () => {
        state.currentOption--;
        if (state.currentOption < 0) {
            state.currentOption = state.options.length - 1;
        }
        let exp = document.getElementById("explanation-container");
        if (exp) {
            exp.remove();
        }
        setTableValues(state.options[state.currentOption]);
        updateValueLabels(svgDiv);
        let checkBtn = document.getElementById("check-btn");
        checkBtn.disabled = false;
    };
    nextBtn.onclick = async () => {
        state.currentOption++;
        if (state.currentOption >= state.options.length) {
            state.currentOption = 0;
        }
        let exp = document.getElementById("explanation-container");
        if (exp) {
            exp.remove();
        }
        setTableValues(state.options[state.currentOption]);
        updateValueLabels(svgDiv);
        let checkBtn = document.getElementById("check-btn");
        checkBtn.disabled = false;
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
    let optionsFile = state.currentCircuitMap.circuitFile.replace(".txt", `_options.json`);
    let optionsPath = `${conf.pyodideCircuitPath}/${state.currentCircuitMap.sourceDir}` + "/" + optionsFile;
    try {
        let content = await state.pyodideAPI.readFile(optionsPath);
        options = JSON.parse(content);
    } catch (error) {
        console.error("Error fetching options file: " + error);
        showMessage(error, "error", false);
        options = null;
        pushErrorEventMatomo(errorActions.optionsFileError, error);
    }
    for (let option of options) {
        if (option.R3 === undefined) {
            option.R3 = "?";
        }
        if (option.R4 === undefined) {
            option.R4 = "?";
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
    clearSimplifierPageContent();
    showSpinnerLoadingCircuit();
    state.pictureCounter = 0;
    resetExtraLiveModal();
    scrollBodyToTop();
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

function setupValuesTable() {
    let overlay = document.createElement("div");
    overlay.id = "values-table-overlay";
    overlay.style.zIndex = "100";
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    if (colors.currentBackground === colors.keyDark) {
        table.classList.add("table-dark");
    } else {
        table.classList.add("table-light");
    }
    table.style.width = "fit-content";

    let row1 = table.insertRow();
    let cell = row1.insertCell();
    cell.innerHTML = `\\(R1=${state.options[state.currentOption].R1}\\Omega\\)`; // top left
    cell.setAttribute("value", `${state.options[state.currentOption].R1}`);
    cell.id = "R1";
    cell = row1.insertCell();
    cell.innerHTML = `\\(R3=${state.options[state.currentOption].R3}\\Omega\\)`; // top right
    cell.setAttribute("value", `${state.options[state.currentOption].R3}`);
    cell.id = "R3";
    if (state.options[state.currentOption].R3 === "?") {
        cell.classList.add("wheatstone-unknown");
    }
    let row2 = table.insertRow();
    cell = row2.insertCell();
    cell.innerHTML = `\\(R2=${state.options[state.currentOption].R2}\\Omega\\)`; // bottom left
    cell.setAttribute("value", `${state.options[state.currentOption].R2}`);
    cell.id = "R2";
    cell = row2.insertCell();
    // bottom right
    cell.innerHTML = `\\(R4=${state.options[state.currentOption].R4}\\)`;
    cell.id = "R4";
    if (state.options[state.currentOption].R4 === "?") {
        cell.classList.add("wheatstone-unknown");
    }
    cell.setAttribute("value", `${state.options[state.currentOption].R4}`);

    table.querySelectorAll("td").forEach(td => {
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
                    td.innerHTML = `\\(R4=${value}\\Omega\\)`;
                    cell.setAttribute("value", value.toString());
                    inputPopup.style.display = "none";
                    MathJax.typeset();
                };
                const popupCancel = document.getElementById("popup-cancel");
                popupCancel.onclick = () => {
                    inputPopup.style.display = "none";
                };
            });
        } else {
            td.style.color = colors.currentForeground;
        }
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
    // Display formula v.Uq * ((v.R1/(v.R1 + v.R2)) - (v.R3/(v.R3 + v.R4))) === v.Um;
    explanationContainer.innerHTML = `
        <h5 class="text-center">${languageManager.currentLang.wheatstoneExplanationTitle}</h5>
        <div class="text-center">
            <p class="mb-1">\\(Uq * \\left(\\frac{R1}{R1 + R2} - \\frac{R3}{R3 + R4}\\right) = Um\\)</p>
            <p class="mb-1">\\(${values.Uq} * \\left(\\frac{${values.R1}}{${values.R1} + ${values.R2}} - \\frac{${values.R3}}{${values.R3} + ${values.R4}}\\right) = ${values.Um}\\)</p>
        </div>
    `;
    return explanationContainer;
}
