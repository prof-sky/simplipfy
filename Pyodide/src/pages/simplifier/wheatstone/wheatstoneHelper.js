async function setupWheatstoneSVGContainer() {
    const circuitContainer = document.createElement('div');
    circuitContainer.classList.add("circuit-container", "row", "justify-content-center", "mt-4", "mb-2");
    let svgData = (await state.apis.pyodide.readFile(state.currentCircuitMap.overViewSvgFile, "utf8")).data;
    const svgContainer = await setupWheatstoneSVG(svgData);
    circuitContainer.appendChild(svgContainer)
    return {circuitContainer, svgContainer};
}

async function setupWheatstoneSVG(svgData) {
    let svgDiv = new WheatstonePageSvgDiv(svgData);
    return svgDiv.div;
}

function adaptV1Label(svgDiv) {
    // Hide the V1 label and show the arrow
    let v1Label = svgDiv.querySelector("text.element-label.V1");
    let tspan = v1Label.querySelector("tspan");
    tspan.innerHTML = `${languageManager.currentLang.simplifier.voltageSymbol}q`;
}

function adaptVoltmeter(svgDiv) {
    // Hide the voltmeter label and show the arrow
    let voltmeter = svgDiv.querySelector(".element-label.VMm");
    voltmeter.style.display = "none";

    let voltmeterArrow = svgDiv.querySelectorAll(".voltage-label.arrow.UVMm");
    for (let arrow of voltmeterArrow) {
        arrow.style.display = "block";
    }
    let voltmeterArrowLabel = svgDiv.querySelector("text.voltage-label.arrow.UVMm");
    let tspan = voltmeterArrowLabel.querySelector("tspan");
    tspan.innerHTML = `${languageManager.currentLang.simplifier.voltageSymbol}m`;
}

function createWheatHeading() {
    let wheatHeading = document.createElement("div");
    wheatHeading.classList.add("h5");
    wheatHeading.innerHTML = languageManager.currentLang.wheatstone.wheatstoneHeading;
    wheatHeading.style.color = colors.current.foreground;
    wheatHeading.style.marginTop = "15px";
    wheatHeading.style.width = "350px";
    wheatHeading.style.position = "relative";
    wheatHeading.style.margin = "auto";
    wheatHeading.id = "wheat-heading";
    return wheatHeading;
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
    let Vmm = svgDiv.querySelector("text.voltage-label.arrow.UVMm");
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
    let Vmm = svgDiv.querySelector("text.voltage-label.arrow.UVMm");
    let vmmSpan = Vmm.querySelector("tspan");

    /** @type {WheatstoneCircuitMap} */
    let cMap = state.currentCircuitMap;
    /** @type {WheatstoneOption} */
    let wheatOption = cMap.option;
    r1Span.innerHTML = wheatOption.R1 + "Ω";
    r2Span.innerHTML = wheatOption.R2 + "Ω";
    r3Span.innerHTML = wheatOption.R3 + "Ω";
    r4Span.innerHTML = wheatOption.R4 + "Ω";
    v1Span.innerHTML = wheatOption.Uq + "V";
    vmmSpan.innerHTML = wheatOption.Um + "V";
}

function addWheatstoneInfoHelpButton(svgDiv) {
    let infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.classList.add("btn", "btn-primary", "open-info-gif-btn");
    infoBtn.style.position = "absolute";
    infoBtn.style.top = "5px";
    infoBtn.style.left = "5px";
    infoBtn.style.float = "left";
    infoBtn.style.color = colors.definitions.keyYellow;
    infoBtn.style.border = `1px solid ${colors.definitions.keyYellow}`;
    infoBtn.style.background = "none";
    infoBtn.style.fontWeight = "bold";
    infoBtn.style.zIndex = "10";
    infoBtn.innerText = "?";
    infoBtn.setAttribute("data-bs-toggle", "modal");
    infoBtn.id = "open-info-gif-btn-1";
    infoBtn.onclick = () => {
        infoBtn.blur()
        modalSm.show(new WheatstoneModal())
    };  // make sure focus is removed when opening modal
    svgDiv.insertAdjacentElement("afterbegin", infoBtn);
}

/**
 * @param optionsPath {string} path to the file to parse in pyodide
 * @returns {Array<WheatstoneOption>} */
async function parseWheatstoneOptionFile(optionsPath){
    let parsed = [];
    let options = [];
    try {
        let content = (await state.apis.pyodide.readFile(optionsPath)).data;
        if (content === null || content === "" || content === undefined) {
            throw new Error("Options file is empty or not found");
        } else {
            parsed = JSON.parse(content);
        }
    } catch (error) {
        console.trace(error)
        console.error("Error parsing options file: " + error);
        UserMessage.error(error);
        options = null;
        pushErrorEventMatomo(errorActions.optionsFileError, error);
    }
    for (let option of parsed) {
        options.push(new WheatstoneOption(option));
    }
    return options;
}

function setupButtonContainer() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'next-elements-container';
    buttonContainer.id = "nextElementsContainer";
    buttonContainer.classList.add("text-center", "py-1", "mb-3");
    buttonContainer.style.color = colors.current.foreground;
    buttonContainer.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
            <button class="btn btn-primary mx-1" id="check-btn">check</button>
        </div>  
    `;
    buttonContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        pageManager.pages.wheatstonePage.resetBtn()
    });
    let checkBtn = buttonContainer.querySelector("#check-btn");
    checkBtn.addEventListener('click', async () => {
        checkBtn.innerHTML = "<span class='spinner-border spinner-border-sm'></span>";
        await checkWheatstoneInput();
        checkBtn.innerHTML = "check";
    });
    return buttonContainer;
}

function createCells(table) {
    // top left
    let row1 = table.insertRow();
    let cell = row1.insertCell();
    let wheatstoneOption = state.currentCircuitMap.option;
    if (wheatstoneOption.R1 === "?") {
        cell.innerHTML = `\\(R1=${wheatstoneOption.R1}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R1";
    } else {
        cell.innerHTML = `\\(R1=${wheatstoneOption.R1}\\Omega\\)`;
    }
    cell.id = "R1";
    cell.setAttribute("value", `${wheatstoneOption.R1}`);

    // top right
    cell = row1.insertCell();
    if (wheatstoneOption.R3 === "?") {
        cell.innerHTML = `\\(R3=${wheatstoneOption.R3}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R3";
    } else {
        cell.innerHTML = `\\(R3=${wheatstoneOption.R3}\\Omega\\)`;
    }
    cell.id = "R3";
    cell.setAttribute("value", `${wheatstoneOption.R3}`);

    // middle left
    let row2 = table.insertRow();
    cell = row2.insertCell();
    if (wheatstoneOption.R2 === "?") {
        cell.innerHTML = `\\(R2=${wheatstoneOption.R2}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R2";
    } else {
        cell.innerHTML = `\\(R2=${wheatstoneOption.R2}\\Omega\\)`;
    }
    cell.setAttribute("value", `${wheatstoneOption.R2}`);
    cell.id = "R2";

    // middle right
    cell = row2.insertCell();
    if (wheatstoneOption.R4 === "?") {
        cell.innerHTML = `\\(R4=${wheatstoneOption.R4}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "R4";
    } else {
        cell.innerHTML = `\\(R4=${wheatstoneOption.R4}\\Omega\\)`;
    }
    cell.setAttribute("value", `${wheatstoneOption.R4}`);
    cell.id = "R4";

    // bottom left
    let row3 = table.insertRow();
    cell = row3.insertCell();
    if (wheatstoneOption.Um === "?") {
        cell.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}m=${wheatstoneOption.Um}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "Um";
    } else {
        cell.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}m=${wheatstoneOption.Um}V\\)`;
    }
    cell.setAttribute("value", `${wheatstoneOption.Um}`);
    cell.id = "Um";

    // bottom right
    cell = row3.insertCell();
    if (wheatstoneOption.Uq === "?") {
        cell.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}q=${wheatstoneOption.Uq}\\)`;
        cell.classList.add("wheatstone-unknown");
        state.unknown += "Uq";
    } else {
        cell.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}q=${wheatstoneOption.Uq}V\\)`;
    }
    cell.setAttribute("value", `${wheatstoneOption.Uq}`);
    cell.id = "Uq";
}

function cellClickedHandler(td) {
    td.style.textAlign = "left";
    if (td.classList.contains("wheatstone-unknown")) {
        td.style.color = colors.definitions.keyYellow;
        td.style.borderBottom = `1px solid ${colors.definitions.keyYellow}`;
        td.style.cursor = "pointer";
        td.addEventListener("click", () => {
            td.style.color = colors.definitions.keyYellowDarkened;
            setTimeout(() => {
                td.style.color = colors.definitions.keyYellow;
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
                    UserEmojiMessage.error(languageManager.currentLang.alerts.alertNotANumber);
		            return;
	            }
	            if(value<0){
                    UserEmojiMessage.warning(languageManager.currentLang.alerts.negativeNumber);
		            return;
	            }
                let id = td.id;
                if (id.toString().includes("Um")) {
                    td.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}m=${value}V\\)`;
                } else if (id.toString().includes("Uq")) {
                    td.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}q=${value}V\\)`;
                } else {
                    td.innerHTML = `\\(${id}=${value}\\Omega\\)`;
                }
                td.setAttribute("value", value.toString());
                inputPopup.style.display = "none";
                await MathJax.typesetPromise(['#content-col']);
            };
            const popupCancel = document.getElementById("popup-cancel");
            popupCancel.onclick = () => {
                inputPopup.style.display = "none";
            };
        });
    } else {
        td.style.color = colors.current.foreground;
    }
}

function setupValuesTable() {
    let overlay = document.createElement("div");
    overlay.id = "values-table-overlay";
    overlay.style.position = "relative"; // something different from static to get the z-index working
    overlay.style.zIndex = "100";
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    if (colors.current.background === colors.definitions.keyDark) {
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
    explanationContainer.style.backgroundColor = colors.current.bsBackground;
    explanationContainer.style.color = colors.current.foreground;
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
            if (state.currentCircuitMap.option[id] === "?") {
                let tableDiv = document.getElementById("values-table-overlay");
                let table = tableDiv.querySelector("table");
                let td = table.querySelector(`#${id}`);
                td.click();
            } else {
                UserEmojiMessage.info(languageManager.currentLang.wheatstone.canNotSetElement);
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

async function checkWheatstoneInput() {
    let values = getTableValues();
    let err = checkValues(values);
    if (err !== 0) {
        let errorMessage = "";
        switch (err) {
            case 1:
                errorMessage = languageManager.currentLang.alerts.invalidNumber;
                break;
            case 2:
                errorMessage = languageManager.currentLang.alerts.negativeNumber;
                break;
            default:
                errorMessage = languageManager.currentLang.alerts.somethingIsWrong;
        }
        UserEmojiMessage.warning(errorMessage);
        return;
    }
    let equationCorrect = (await state.solvers.wheatstone.equationIsValid(values)).data;
    if (!equationCorrect) {
        UserEmojiMessage.warning(languageManager.currentLang.wheatstone.alertInvalidSolution);
        subtract1Live();
        return;
    }
    // Success
    let checkBtn = document.getElementById("check-btn");
    checkBtn.setAttribute("disabled", "true");
    let explanation = createWheatstoneExplanationContainer(values);
    let contentCol = document.getElementById("content-col");
    contentCol.append(explanation);
    showVariableConfetti();
    state.currentSelector.saveFinishedCircuit(true);
    contentCol.appendChild(state.currentSelector.createNextCircuitBtn());
    await MathJax.typesetPromise(['#content-col']);
}
