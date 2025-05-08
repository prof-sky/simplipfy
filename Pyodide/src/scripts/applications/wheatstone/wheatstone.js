// ####################################################################################################################
// #################################### Key function for wheatstone circuits ###########################################
// ####################################################################################################################
async function startWheatstone() {
    try {
        //await initWheatstoneSolverObject(state.currentCircuitMap);
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
    makeElementsClickableForWheatstone(svgContainer, elements);

    contentCol.append(btnsContainer);
    MathJax.typeset();
}

function makeElementsClickableForWheatstone(svgContainer, electricalElements) {
    electricalElements.forEach(element => {
        element.style.cursor = "pointer";
        element.addEventListener('click', () => {
            let id = element.getAttribute("id");
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

function checkWheatstoneInput() {
    let values = getTableValues();
    values.Uq = parseFloat(state.options[state.currentOption].Uq);
    values.Um = parseFloat(state.options[state.currentOption].Um);
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
        setTimeout(() => {showMessage(errorMessage, "warning");}, 0);
        return;
    }
    let equationCorrect = state.wheatstoneSolverAPI.checkInput(values);
    if (!equationCorrect) {
        setTimeout(() => {showMessage(languageManager.currentLang.alertInvalidSolution, "warning");}, 0);
        return;
    }
    // Success
    let checkBtn = document.getElementById("check-btn");
    checkBtn.setAttribute("disabled", "true");
    let explanation = createWheatstoneExplanationContainer(values);
    let contentCol = document.getElementById("content-col");
    contentCol.append(explanation);
    confetti({
        particleCount: 150,
        angle: 90,
        spread: 60,
        scalar: 0.8,
        origin: {x: 0.5, y: 1}
    });
    MathJax.typeset();
}

function getTableValues() {
    let tableDiv = document.getElementById("values-table-overlay");
    let table = tableDiv.querySelector("table");
    let values = {};
    let row1 = table.rows[0];
    let row2 = table.rows[1];
    let topLeft = row1.cells[0];
    let topRight = row1.cells[1];
    let bottomLeft = row2.cells[0];
    let bottomRight = row2.cells[1];
    values.R1 = parseFloat(topLeft.getAttribute("value"));
    values.R2 = parseFloat(bottomLeft.getAttribute("value"));
    values.R3 = parseFloat(topRight.getAttribute("value"));
    values.R4 = parseFloat(bottomRight.getAttribute("value"));
    return values;
}

function setTableValues(values) {
    let tableDiv = document.getElementById("values-table-overlay");
    let table = tableDiv.querySelector("table");
    let row1 = table.rows[0];
    let row2 = table.rows[1];
    let topLeft = row1.cells[0];
    let topRight = row1.cells[1];
    let bottomLeft = row2.cells[0];
    let bottomRight = row2.cells[1];

    topLeft.setAttribute("value", values.R1.toString());
    topLeft.textContent = `\\(R1=${values.R1.toString()}\\Omega\\)`;
    topRight.setAttribute("value", values.R3.toString());
    topRight.textContent = `\\(R3=${values.R3.toString()}${values.R3.toString() === "?"?"":"\\Omega"}\\)`;
    bottomLeft.setAttribute("value", values.R2.toString());
    bottomLeft.textContent = `\\(R2=${values.R2.toString()}\\Omega\\)`;
    bottomRight.setAttribute("value", values.R4.toString());
    bottomRight.textContent = `\\(R4=${values.R4.toString()}${values.R4.toString() === "?"?"":"\\Omega"}\\)`;
    MathJax.typeset();
}

function checkValues(values) {
    let errorCode = 0;
    for (const key in values) {
        if (key === "Uq" || key === "Um") {
            continue;
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
