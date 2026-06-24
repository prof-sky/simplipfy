function notLastPicture() {
    // Because on the last picture, this element won't exist
    return document.getElementById("nextElementsContainer") != null;
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

/**
 * First function to be called when the user starts the simplifier.
 * It initializes the step solver and creates the first step (step 0).
 * @param circuitMap {CircuitMap}  - The circuit map containing the circuit file and source directory.
 */
async function createAndShowStep0(circuitMap) {
    try {
        let paramMap = new ParamMap();
        let netlist;
        let generalizeActive = false;
        let netlistContainsWires = false;

        await state.solvers.stepwise.init(circuitMap);

        let response = (await state.apis.pyodide.readFile(circuitMap.circuitPath+`/${circuitMap.circuitFile}`));
        if (response instanceof TimeOutResponse || !response.success) {
            throw Error("could not read file");
        }
        netlist = response.data;
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

        state.step0Data = (await state.solvers.stepwise.createStep0()).data;
        state.currentStep = 0;
        state.allValuesMap.set(`${paramMap.get("volt")}${paramMap.get("total")}`, getSourceVoltageVal());
        state.allValuesMap.set(`I${paramMap.get("total")}`, getSourceCurrentVal());

        nextSimplifierStep(state.step0Data, generalizeActive, netlistContainsWires);
    } catch (error) {
        console.trace(error)
        console.error("Error creating step 0: " + error);
        UserMessage.error(error);
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
    totalCurrentBtn.classList.remove("pseudo-disabled");
    return totalCurrentBtn;
}

function createSolutionsBtn() {
    const totalCurrentBtn = setupVoltageCurrentBtn();
    totalCurrentBtn.textContent = languageManager.currentLang.simplifier.solutionsBtn;
    totalCurrentBtn.classList.remove("pseudo-disabled");
    return totalCurrentBtn;
}

function setStyleAndEvent(element, nextElementsList) {
    element.style.pointerEvents = "bounding-box";
    element.style.cursor = 'pointer';
    element.addEventListener('click', () =>
        chooseElement(element, nextElementsList)
    );
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

