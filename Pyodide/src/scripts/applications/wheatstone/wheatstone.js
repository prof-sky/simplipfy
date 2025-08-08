// ####################################################################################################################
// #################################### Key function for wheatstone circuits ###########################################
// ####################################################################################################################
async function startWheatstone() {
    try {
        setupWheatstone();
    } catch (error) {
        console.error("Error starting Wheatstone: " + error);
        setTimeout(() => {
            showMessage(error, "error", false);
        }, 0);
        pushErrorEventMatomo(errorActions.wheatstoneStartError, error);
    }
}

async function setupWheatstone() {
    const {circuitContainer, svgContainer} = await setupWheatstoneSVGContainer();
    const contentCol = document.getElementById("content-col");
    hideSpinnerLoadingCircuit();
    contentCol.append(circuitContainer);

    let inputPopup = createPopupInput();
    contentCol.append(inputPopup);

    const valuesTable = setupValuesTable();
    svgContainer.append(valuesTable);

    const btnsContainer = setupButtonContainer();

    let elements = getElementsFromSvgContainer(svgContainer);
    // Add voltemeter to elements, needs to be clickable too
    let voltmeter = svgContainer.querySelector("#VMm_Circle");
    if (voltmeter) {
        elements.push(voltmeter);
    }
    makeElementsClickableForWheatstone(svgContainer, elements);

    contentCol.append(btnsContainer);
    await MathJax.typesetPromise();
}

async function checkWheatstoneInput() {
    let values = getTableValues();
    let err = checkValues(values);
    if (err !== 0) {
        let errorMessage = "";
        switch (err) {
            case 1:
                errorMessage = languageManager.currentLang.alertInvalidNumber;
                break;
            case 2:
                errorMessage = languageManager.currentLang.alertNegativeNumber;
                break;
            default:
                errorMessage = languageManager.currentLang.alertSomethingIsWrong;
        }
        setTimeout(() => {
            showMessage(errorMessage, "warning");
        }, 0);
        return;
    }
    let equationCorrect = await state.wheatstoneSolverAPI.equationIsValid(values);
    if (!equationCorrect) {
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertInvalidSolution, "warning");
        }, 0);
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
    if (!state.currentCircuitFromQrScan && !state.currentCircuitFromUserZip) {
        // Add finished circuit to localStorage
        saveFinishedCircuitAndUpdateSelectorCounters();
    }
    await MathJax.typesetPromise();
}