function notLastPicture() {
    // Because on the last picture, this element won't exist
    return document.getElementById("nextElementsContainer") != null;
}

function setSvgColorMode(svgData) {
    if (colors.svgGenerationStrokeColor === colors.current.svgStrokeColor) return svgData;
    return svgData.replaceAll(colors.svgGenerationStrokeColor, colors.current.svgStrokeColor);
}

function enableCheckBtnParallel() {
    document.getElementById("check-btn-parallel").disabled = false;
}

function enableCheckBtnSeries() {
    document.getElementById("check-btn-series").disabled = false;
}

function enableLastCalcButton() {
    setTimeout(() => {
        let lastPicture = state.pictureCounter - 1;
        const lastCalcBtn = document.getElementById(`calcBtn${lastPicture}`);
        lastCalcBtn.disabled = false;
    }, 100);
}

async function getCircuitInfo() {
    let circuitInfoPath = await stepSolve.createCircuitInfo();
    let circuitInfoFile = await state.pyodide.FS.readFile(circuitInfoPath, {encoding: "utf8"});
    return JSON.parse(circuitInfoFile);

}

/**
 * First function to be called when the user starts the simplifier.
 * It initializes the step solver and creates the first step (step 0).
 * @param circuitMap {CircuitMap}  - The circuit map containing the circuit file and source directory.
 */
async function createAndShowStep0(circuitMap) {
    try {
        let paramMap = createParamMap();
        let netlist;
        let generalizeActive = false;
        let netlistContainsWires = false;

        await state.solvers.stepwise.init(circuitMap);

        netlist = await state.apis.pyodide.readFile(circuitMap.circuitPath+`/${circuitMap.circuitFile}`);
        // Check netlist comments
        let [optionsStr, cleanedNetlist] = extractCommentsAndNetlist(netlist);
        if (optionsStr.includes("--generalize-true")) {
            generalizeActive = true;
        } else if (optionsStr.includes("--generalize-false")) {
            generalizeActive = false;
        } else if (optionsStr.includes("--generalize")) {
            generalizeActive = true; // Generalize without parameter means active
        }
        // Check if wires inside netlist, check if any line starts with "W"
        if (cleanedNetlist.split("\n").some(line => line.startsWith("W"))) {
            // There is at least one wire
            netlistContainsWires = true;
        }

        state.step0Data = await state.solvers.stepwise.createStep0();
        state.currentStep = 0;
        state.allValuesMap.set(`${paramMap.get("volt")}${paramMap.get("total")}`, getSourceVoltageVal());
        state.allValuesMap.set(`I${paramMap.get("total")}`, getSourceCurrentVal());

        nextSimplifierStep(state.step0Data, generalizeActive, netlistContainsWires);
    } catch (error) {
        console.trace(error)
        console.error("Error creating step 0: " + error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.step0Error, "(simplifier) " + error);
    }
}

function createSimplHeading() {
    let simplHeading = document.createElement("div");
    simplHeading.classList.add("h5");
    simplHeading.innerHTML = languageManager.currentLang.simplifier.StepwiseHeading;
    simplHeading.style.color = colors.current.foreground;
    simplHeading.style.marginTop = "15px";
    simplHeading.style.width = "350px";
    simplHeading.style.position = "relative";
    simplHeading.style.margin = "auto";
    simplHeading.id = "simplifier-heading";
    return simplHeading;
}

function createTotalCurrentContainer() {
    const firstStepContainer = document.createElement("div");
    firstStepContainer.id = "firstVCStepContainer";
    firstStepContainer.classList.add("container", "justify-content-center");
    return firstStepContainer;
}

function createSolutionsBtnContainer() {
    const solutionsContainer = document.createElement("div");
    solutionsContainer.id = "solutionsBtnContainer";
    solutionsContainer.classList.add("container", "mb-5", "justify-content-center");
    return solutionsContainer;
}

function createTotalCurrentBtn() {
    const totalCurrentBtn = setupVoltageCurrentBtn();
    totalCurrentBtn.textContent = languageManager.currentLang.simplifier.firstVCStepBtn;
    totalCurrentBtn.disabled = false;
    return totalCurrentBtn;
}

function createSolutionsBtn() {
    const totalCurrentBtn = setupVoltageCurrentBtn();
    totalCurrentBtn.textContent = languageManager.currentLang.simplifier.solutionsBtn;
    totalCurrentBtn.disabled = false;
    return totalCurrentBtn;
}

function setStyleAndEvent(element, nextElementsList) {
    element.style.pointerEvents = "bounding-box";
    element.style.cursor = 'pointer';
    element.addEventListener('click', () =>
        chooseElement(element, nextElementsList)
    );
}

function colorArrowsColorful(svgDiv) {
    let labels = svgDiv.querySelectorAll(".arrow");
    for (let label of labels) {
        if (label.classList.contains("voltage-label")) {
            label.style.color = colors.definitions.voltageBlue;
            label.style.stroke = colors.definitions.voltageBlue;
            label.style.fill = colors.definitions.voltageBlue;
            label.style.opacity = "0.8";
        } else if (label.classList.contains("current-label")) {
            label.style.color = colors.definitions.currentRed;
            label.style.stroke = colors.definitions.currentRed;
            label.style.fill = colors.definitions.currentRed;
            label.style.opacity = "0.8";
        }
    }
}

async function highlightHelpButton() {
    let helpBtn = document.getElementById("open-info-gif-btn");
    if (helpBtn) {
        await new Promise(resolve => setTimeout(resolve, 500));
        helpBtn.style.transition = "background 0.5s, color 0.5s";
        helpBtn.style.background = colors.definitions.keyYellow;
        helpBtn.style.color = colors.definitions.bootstrapDark;

        setTimeout(() => {
            helpBtn.style.background = "none";
            helpBtn.style.color = colors.definitions.keyYellow;
        }, 500);
    }
}

function explanationGeneralizeSwitch(switchInput){
    const contentCol = document.getElementById("content-col");
    if (!switchInput.checked) {
        contentCol.append(createExplanationPopup(languageManager.currentLang.simplifier.generalizeBtnOn, switchInput.id));
    } else {
        switchInput.title = languageManager.currentLang.simplifier.generalizeBtnOff;
    }
}

function createExplanationPopup(explanation, originID) {
    let explanationPopup = document.createElement("div");
    explanationPopup.innerHTML = `<div id="explanation-popup"  class="position-fixed top-50 start-50 translate-middle p-4 bg-light border rounded shadow"
                                 style="display: none; z-index: 1050; min-width: 200px;">
                                <p>explanation</p>
                                <div class="d-flex justify-content-center" style="gap: 5px">
                                    <button id="popup-cancel" class="btn btn-secondary btn-sm">X</button>
                                </div>
                            </div>`;
    explanationPopup.id = originID+"-explanation-popup";
    return explanationPopup;
}

