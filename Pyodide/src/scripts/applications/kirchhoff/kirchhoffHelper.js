function setupNextElementsVoltageLawContainer() {
    const nextElementsContainer = document.createElement('div');
    nextElementsContainer.className = 'next-elements-container';
    nextElementsContainer.id = "nextElementsContainer";
    nextElementsContainer.classList.add("text-center", "py-1", "mb-3");
    nextElementsContainer.style.color = colors.currentForeground;
    nextElementsContainer.innerHTML = `
        <h5>${languageManager.currentLang.nextElementsVoltLawHeading}</h5>
        <ul class="px-0" id="next-elements-list"></ul>
        <div class="mb-3">
            <button class="btn btn-secondary mx-1 ${state.pictureCounter===1?"disabled":""}" id="reset-btn">reset</button>
            <button class="btn btn-primary mx-1 ${state.lives === 0 ? "disabled" : ""}" id="check-btn">check</button>
        </div>  
        <button class="btn btn-secondary mx-1" id="next-btn">${languageManager.currentLang.junctionBtn}</button>
    `;
    nextElementsContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        resetKirchhoffPage(true);
        if (state.gamification) {
            // Reset speed mode
            stopSpeedModeTimer();
            let speedModeBar = document.getElementById("speedModeBar");
            if (speedModeBar) {
                speedModeBar.remove();
            }
        }
    });
    let checkBtn = nextElementsContainer.querySelector("#check-btn");
    checkBtn.addEventListener('click', async () => {
        if (state.checkBtnAlreadyClicked) return;
        state.checkBtnAlreadyClicked = true;

        const btn = document.getElementById("check-btn");
        btn.classList.add("disabled");
        btn.innerHTML = "<span class='spinner-border spinner-border-sm'></span>";

        try {
            await checkVoltageLoop();
        } finally {
            state.checkBtnAlreadyClicked = false;
            btn.classList.remove("disabled");
            btn.innerHTML = "check";
        }
    });
    let nextBtn = nextElementsContainer.querySelector("#next-btn");
    nextBtn.addEventListener('click', async () => {
        if (await state.kirchhoffSolverAPI.foundAllVoltEquations()) {
            // Remove last svg
            let svgDiv = document.getElementById(`svgDivVolt${state.pictureCounter}`).parentElement;
            svgDiv.remove();
            //for (let i = 0; i <= state.pictureCounter; i++) {
             //   removeSvgEventHandlers(`svgDivVolt${i}`);
            //}
            // Finish circuit if enough equations found
            if (await state.kirchhoffSolverAPI.foundAllEquations()) {
                let contentCol = document.getElementById("content-col");
                finishKirchhoff(contentCol);
                pushCircuitEventMatomo(circuitActions.Finished, state.pictureCounter);
                setTimeout(() => {showMessage(languageManager.currentLang.foundEnoughVoltLoops, "success", false);});
            } else {
                    pushCircuitEventMatomo(circuitActions.FinishedVoltages);
                    state.selectedElements = [];
                    await nextKirchhoffCurrStep(true);
                    scrollContainerToTop(document.getElementById("junctionHeading"));
            }
        } else {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertNotAllVoltLoopsFound, "warning");
            });
        }
    });

    return nextElementsContainer;
}

function setupNextElementsCurrentLawContainer() {
    const nextElementsContainer = document.createElement('div');
    nextElementsContainer.className = 'next-elements-container';
    nextElementsContainer.id = "nextElementsContainer";
    nextElementsContainer.classList.add("text-center", "py-1", "mb-3");
    nextElementsContainer.style.color = colors.currentForeground;
    nextElementsContainer.innerHTML = `
        <h5>${languageManager.currentLang.nextElementsCurrentHeading}</h5>
        <ul class="px-0" id="next-elements-list"></ul>
        <div class="mb-3">
            <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
            <button class="btn btn-primary mx-1 ${state.lives === 0 ? "disabled" : ""}" id="check-btn">check</button>
        </div>
        <button class="btn btn-secondary mx-1" id="finish-btn">${languageManager.currentLang.finishBtn}</button>
    `;
    nextElementsContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        resetKirchhoffPage(true);
        if (state.gamification) {
            // Reset speed mode
            stopSpeedModeTimer();
            let speedModeBar = document.getElementById("speedModeBar");
            if (speedModeBar) {
                speedModeBar.remove();
            }
        }
    });
    let checkBtn = nextElementsContainer.querySelector("#check-btn");
    checkBtn.addEventListener('click', async () => {
        checkJunctionLaw();
    });
    let finishBtn = nextElementsContainer.querySelector("#finish-btn");
    finishBtn.addEventListener('click', async () => {
        checkFinishKirchhoff();
    });
    return nextElementsContainer;
}

async function checkFinishKirchhoff() {
    let contentCol = document.getElementById("content-col");
    let allEqsFound = await state.kirchhoffSolverAPI.foundAllEquations();
    if (allEqsFound) {
        finishKirchhoff(contentCol);
    } else {
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertNotAllEquationsFound, "warning");
        }, 0);
    }
}

async function solveFirstStep() {
    let obj = await state.simplifierAPI.createStep0();
    obj.__proto__ = Step0Object.prototype;
    state.step0Data = obj;
    state.currentStep = 0;
}

function showWrongSelection(checkBoxId) {
    setTimeout(() => {
        let nextElementList = document.querySelector('#nextElementsContainer ul');
        let checkBox = nextElementList.querySelector(`#${checkBoxId}`);
        checkBox.style.backgroundColor = colors.wrongEquationColor;
        checkBox.style.borderColor = colors.wrongEquationColor;
        checkBox.disabled = true;
        subtract1Live();

    }, 250);
}

function adaptTranslation(checkBox) {
    // Adapt equation float to the correct height (kirchhoff current equation animation)
    const sheet = Array.from(document.styleSheets).find(sheet =>
        Array.from(sheet.cssRules).some(rule => rule instanceof CSSKeyframesRule && rule.name === 'floatAndFadeOut')
    );

    const keyframesRule = Array.from(sheet.cssRules).find(
        rule => rule instanceof CSSKeyframesRule && rule.name === 'floatAndFadeOut'
    );

    if (keyframesRule) {
        const toRule = Array.from(keyframesRule.cssRules).find(rule => rule.keyText === '100%');
        if (toRule) {
            // get the correct translation, being the difference between the correct equation
            // and the bottom of the last svg + offset
            let y;
            let equationPos = checkBox.getBoundingClientRect().top + checkBox.getBoundingClientRect().height / 2;
            let goalPos = document.getElementById(`svgDivCurr${state.pictureCounter}`).getBoundingClientRect().bottom;
            y = equationPos - goalPos + 60;
            toRule.style.transform = `translateY(${y})`;
        }
    }
}

async function showCorrectSelection(checkBoxId) {
    let nextElementList = document.querySelector('#nextElementsContainer ul');
    let checkBox = nextElementList.querySelector(`#${checkBoxId}`);
    let label = document.querySelector(`label[for=${checkBoxId}]`);

    // Adapt translation for the correct equation
    adaptTranslation(checkBox);

    setTimeout(() => {
        checkBox.style.backgroundColor = colors.correctEquationColor;
        checkBox.style.borderColor = colors.correctEquationColor;
    }, 250);
    await new Promise(resolve => setTimeout(resolve, 250)); // Wait for animation to start
    label.classList.add("fade-out");
    await new Promise(resolve => setTimeout(resolve, 750)); // Wait for animation to fade out
}

async function showEquations(contentCol) {
    //let equationsContainer = document.getElementById("equations-container");
    //equationsContainer.innerHTML = "";
    let equations = await createEquationsOverviewContainer();
    contentCol.append(equations);
}

async function getCurrentEquationNr() {
    let equations = await state.kirchhoffSolverAPI.equations();
    // get nr of equation from this list where the element is not "-"
    let eqNr = 0;
    for (let i = 0; i < equations.length; i++) {
        if (equations[i] !== "-") {
            eqNr++;
        }
    }
    return eqNr;
}

async function updateEquations() {
    let equationContainer = document.getElementById("equations-overview-container");
    equationContainer.innerHTML = languageManager.currentLang.missingEquations;
    equationContainer.appendChild(getEquationsTable(await state.kirchhoffSolverAPI.equations()));
}

async function waitForCorrectSelection() {
    for (let i = 0; i < 10; i++) {
        const {checkBoxId, isCorrectEq} = await waitForCheckboxSelection();

        if (isCorrectEq) {
            await showCorrectSelection(checkBoxId);
            break;
        } else {
            showWrongSelection(checkBoxId);
            pushCircuitEventMatomo(circuitActions.WrongCurrentEquation);
        }
    }
}

function waitForCheckboxSelection() {
    let nextElementsContainer = document.getElementById("nextElementsContainer");
    let nextElementList = nextElementsContainer.querySelector('ul');
    return new Promise(resolve => {
        nextElementList.addEventListener('change', function handler(event) {
            if (event.target.classList.contains('form-check-input')) {
                const selectedValue = event.target.value;
                const selectedId = event.target.id;
                resolve({checkBoxId: selectedId, isCorrectEq: selectedValue === "1"});
                nextElementList.removeEventListener('change', handler);
            }
        });
    });
}

function handleVoltageError(errorCode, svgDiv) {
    let msg
    if (errorCode === 1) {
        // Equation already exists
        msg = languageManager.currentLang.alertLoopAlreadyExists
        pushCircuitEventMatomo(circuitActions.LoopAlreadyExists);
        subtract1Live();
    } else if (errorCode === 2) {
        // Invalid selection
        msg = languageManager.currentLang.alertInvalidVoltageLoop
        pushCircuitEventMatomo(circuitActions.InvalidVoltageLoop);
        subtract1Live();
    } else if (errorCode === 3) {
        // Only for junction law
        return
    } else if (errorCode === 4) {
        // Not a valid loop order
        msg = languageManager.currentLang.alertInvalidLoopOrder
    } else if (errorCode === 5){
        msg = languageManager.currentLang.alertDependentEquation
    } else{
        msg = languageManager.currentLang.alertSomethingIsWrong
    }
    setTimeout(() => {
        showMessage(msg, "warning");
    }, 0);
}

function handleJunctionError(errorCode, svgDiv) {
    if (errorCode === 1) {
        // Equation already exists
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertJunctionAlreadyExists, "warning");
        }, 0);
        pushCircuitEventMatomo(circuitActions.JunctionAlreadyExists);
        subtract1Live();
    } else if (errorCode === 2) {
        // Invalid selection
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertInvalidJunction, "warning");
        }, 0);
        pushCircuitEventMatomo(circuitActions.InvalidJunction);
        subtract1Live();
    } else if (errorCode === 3) {
        // Only for junction law, if more than 2 elements in series are chosen we can't generate
        // one equation but two, I1 = I2 = I3, but we want I1 = I2 and I2 = I3
        // So throw error if more than 2 series elements are chosen
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertTooManyJunctionNodes, "warning");
        }, 0);
        subtract1Live();
    } else if (errorCode === 4) {
        // Only for voltage law
    } else {
        // Default error
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertSomethingIsWrong, "warning");
        }, 0);
    }
}

async function initSolverObjects(circuitMap) {
    if (state.simplifierAPI !== null) {
        await state.simplifierAPI.resetStepSolver();
    }
    if (state.kirchhoffSolverAPI !== null) {
        await state.kirchhoffSolverAPI.resetKirchhoffSolver();
    }

    let paramMap = createParamMap();

    // For Kirchhoff, we know, that pyodide must be ready, so we can use the StepSolverAPI instead of the hardcoded API
    state.simplifierAPI = new StepSolverAPI(worker);
    state.kirchhoffSolverAPI = new KirchhoffSolverAPI(worker);

    if (state.currentCircuitFromQrScan) {
        // scanned QR circuits
        await state.simplifierAPI.initStepSolver(circuitMap.circuitFile, "/home/pyodide/" , paramMap);
        await state.kirchhoffSolverAPI.initKirchhoffSolver(circuitMap.circuitFile, "/home/pyodide/", paramMap);
    } else if (state.currentCircuitFromUserZip) {
        // Own uploaded zip circuits
        await state.simplifierAPI.initStepSolver(circuitMap.circuitFile, conf.userCircuitsPath + `${state.selectedZipDirName}/${circuitMap.sourceDir}`, paramMap);
        await state.kirchhoffSolverAPI.initKirchhoffSolver(circuitMap.circuitFile, conf.userCircuitsPath + `${state.selectedZipDirName}/${circuitMap.sourceDir}`, paramMap);
    } else {
        // "normal" circuits
        await state.simplifierAPI.initStepSolver(circuitMap.circuitFile, `${conf.pyodideCircuitPath}/${circuitMap.sourceDir}`, paramMap);
        await state.kirchhoffSolverAPI.initKirchhoffSolver(circuitMap.circuitFile, `${conf.pyodideCircuitPath}/${circuitMap.sourceDir}`, paramMap);
    }
}

function createVoltHeading() {
    let voltHeading = document.createElement("h3");
    voltHeading.innerHTML = languageManager.currentLang.kirchhoffVoltageHeading;
    voltHeading.style.color = colors.currentForeground;
    voltHeading.style.marginTop = "15px";
    return voltHeading;
}

function createEquationsContainer() {
    let equationsContainer = document.createElement("div");
    equationsContainer.id = "equations-container";
    equationsContainer.style.color = colors.currentForeground;
    return equationsContainer;
}

async function createEquationsOverviewContainer() {
    let equations = document.createElement("div");
    equations.id = "equations-overview-container";
    equations.style.color = colors.currentForeground;
    equations.classList.add("text-center", "py-1", "mb-3", "mx-auto");
    let text = document.createElement("p");
    text.classList.add("text-center", "my-3", "mx-auto");
    text.innerHTML = languageManager.currentLang.missingEquations;
    text.style.color = colors.currentForeground;
    text.style.maxWidth = "350px";
    equations.appendChild(text);
    let eqs = await state.kirchhoffSolverAPI.equations();
    // Filter out "-" equations
    eqs = eqs.filter(eq => eq !== "-");
    equations.appendChild(getEquationsTable(eqs));

    return equations;
}

function createCurrentHeading() {
    let currentHeading = document.createElement("h3");
    currentHeading.innerHTML = languageManager.currentLang.kirchhoffCurrentHeading;
    currentHeading.style.color = colors.currentForeground;
    currentHeading.classList.add("pt-3");
    currentHeading.id = "junctionHeading";
    return currentHeading;
}

function addVoltageSourceToElements(svgContainer, electricalElements) {
    // Add voltage source in kirchhoff because it needs to be clickable as well
    let sources = svgContainer.querySelectorAll("circle");
    for (let source of sources) {
        const classAttr = source.getAttribute("class");
        if (classAttr && classAttr !== "na" && classAttr.includes("V")) {
            electricalElements.push(source);
        }
    }
}

function appendKirchhoffValuesToAllValuesMap() {
    for (let component of state.step0Data.allComponents) {
        addKirchhoffComponentValues(component);
    }
    for (let src of state.step0Data.sources) {
        state.allValuesMap.set("element_" + src.U.name, src.Z.name); // TODO U.name matching Z.name?
        state.allValuesMap.set("element_" + src.I.name, src.Z.name);
        state.allValuesMap.set("volt_" + src.Z.name, src.U.name);
        state.allValuesMap.set("curr_" + src.Z.name, src.I.name);
    }
}

function addKirchhoffComponentValues(component) {
    if (component.Z.name !== null && component.Z.name !== undefined) {
        if (component.hasConversion) {
            state.allValuesMap.set(component.Z.name, component.Z.val);
        } else {
            state.allValuesMap.set(component.Z.name, component.Z.impedance);
        }
        if (state.step0Data.componentTypes === "RLC") {
            state.allValuesMap.set(`Z_{${component.Z.name}}`, component.Z.cpxVal);
            state.allValuesMap.set(`Zpolar_{${component.Z.name}}`, toPolar(component.Z.impedance, component.Z.phase));
            state.allValuesMap.set(component.U.name, toPolar(component.U.val, component.U.phase));
            state.allValuesMap.set(component.I.name, toPolar(component.I.val, component.I.phase));
        } else {
            state.allValuesMap.set(component.U.name, component.U.val);
            state.allValuesMap.set(component.I.name, component.I.val);
        }
        // To map U1 to R1, I1 to R1
        state.allValuesMap.set(`element_${component.U.name}`, component.Z.name);
        state.allValuesMap.set(`element_${component.I.name}`, component.Z.name);
        // To map from R1 to U1, R1 to I1
        state.allValuesMap.set(`volt_${component.Z.name}`, component.U.name);
        state.allValuesMap.set(`curr_${component.Z.name}`, component.I.name);
    }
}

function makeElementsClickableForKirchhoff(svgContainer, nextElementsContainer, electricalElements, selector) {
    const nextElementsList = nextElementsContainer.querySelector(`#next-elements-list`);
    electricalElements.forEach(element => setKirchhoffStyleAndEvent(svgContainer, element, nextElementsList, selector));
}

function setKirchhoffStyleAndEvent(svgContainer, element, nextElementsList, selector) {
    element.style.cursor = "pointer";
    element.addEventListener('click', () => {
        chooseKirchhoffElement(svgContainer, element, nextElementsList, selector);
    });
}

function checkIfAlreadySelected(nextElementsList, element) {
    let alreadyClicked = false,
        nextElements = nextElementsList.querySelectorAll("li");
    for (let nextElement of nextElements) {
        let id = "li-" + element.classList[2];
        if (nextElement.id === id) {
            alreadyClicked = true;
            break;
        }
    }
    return alreadyClicked;
}

function selectKirchArrow(svgContainer, element) {
    highlightElement(element);
    let arrows = svgContainer.querySelectorAll(`path.arrow.${element.classList[2]}`);
    for (let arrow of arrows) {
        highlightElement(arrow);
    }
}

async function chooseKirchhoffElement(svgContainer, element, nextElementsList, selector) {
    let alreadyClicked = checkIfAlreadySelected(nextElementsList, element);
    if (alreadyClicked) {
        unselectKirchArrow(svgContainer, element, selector);
    } else {
        selectKirchArrow(svgContainer, element);
        addKirchhoffElementToTextBox(element, nextElementsList);
    }
    await MathJax.typesetPromise();
}

function resetArrowHighlights(svgDiv, selector) {
    let arrows = svgDiv.querySelectorAll(".arrow");
    for (let arrow of arrows) {
        if (elementMarkedDone(arrow, selector)) {
            lightHighlightElement(svgDiv, arrow, selector);
        } else {
            removeHighlight(arrow);
        }
    }
}

function highlightElement(element) {
    element.style.fontWeight = "bold";
    if (element.classList.contains("voltage-label")) {
        element.style.color = "#9898ff";
        element.style.stroke = "#9898ff";
        element.style.fill = "#9898ff";
    } else {
        element.style.color = "red";
        element.style.stroke = "red";
        element.style.fill = "red";
    }
}

function lightHighlightElement(svgDiv, element, selector) {
    // Check if element is of type string
    let volt_name = "";
    let curr_name = "";

    if (typeof element === "string") {
        let id = element;
        // Translate Rx to Ux
        if (selector === "volt") {
            volt_name = state.allValuesMap.get("volt_" + id);
        } else {
            curr_name = state.allValuesMap.get("curr_" + id);
        }
    } else {
        // Element is node (for example arrow), symbol is in class name
        if (selector === "volt") {
            volt_name = element.classList[2];
        } else {
            curr_name = element.classList[2];
        }
    }
    if (selector === "volt") {
        let ele = svgDiv.querySelectorAll(`.voltage-label.arrow.${volt_name}`);
        for (let e of ele) {
            e.style.fontWeight = "normal";
            e.style.color = colors.lightVoltageBlue;
            e.style.stroke = colors.lightVoltageBlue;
            e.style.fill = colors.lightVoltageBlue;
        }
    } else if (selector === "curr") {
        let ele = svgDiv.querySelectorAll(`.current-label.arrow.${curr_name}`);
        for (let e of ele) {
            e.style.fontWeight = "normal";
            e.style.color = colors.lightCurrentRed;
            e.style.stroke = colors.lightCurrentRed;
            e.style.fill = colors.lightCurrentRed;
        }
    }
}

function grayOutElement(element) {
    element.style.fontWeight = "normal";
    element.style.color = colors.kirchhoffGray;
    element.style.stroke = colors.kirchhoffGray;
    element.style.fill = colors.kirchhoffGray;
}

function removeHighlight(element) {
    element.style.fontWeight = "normal";
    element.style.color = colors.currentForeground;
    element.style.stroke = colors.currentForeground;
    element.style.fill = colors.currentForeground;
}

function elementMarkedDone(element, selector) {
    let elementId = "";
    if (selector === "volt") {
        elementId = state.allValuesMap.get("element_" + element.classList[2]);
    } else {
        elementId = state.allValuesMap.get("element_" + element.classList[2]);
    }
    if (selector === "volt") {
        return state.doneVoltages.includes(elementId);
    } else if (selector === "curr") {
        return state.doneCurrents.includes(elementId);
    }
}

function unselectKirchArrow(svgContainer, element, selector) {
    let arrows = svgContainer.querySelectorAll(`path.arrow.${element.classList[2]}`);

    if (elementMarkedDone(element, selector)) {
        lightHighlightElement(svgContainer, element, selector);
        for (let arrow of arrows) {
            lightHighlightElement(svgContainer, arrow, selector);
        }
    } else {
        removeHighlight(element);
        for (let arrow of arrows) {
            removeHighlight(arrow);
        }
    }

    const listItem = document.querySelector(`#li-${element.classList[2]}`);
    if (listItem) {
        listItem.remove();
        let correspondingElement = state.allValuesMap.get("element_" + element.classList[2]);
        state.selectedElements = state.selectedElements.filter(e => e !== correspondingElement);
    }
}

function addKirchhoffElementToTextBox(element, nextElementsList) {
    let name = element.classList[2];
    let listItem = document.createElement('li');
    listItem.innerHTML = `\\(${name}\\)`;
    listItem.setAttribute("id", "li-" + name);
    nextElementsList.appendChild(listItem);
    // Solver expects R1, R2, C1, ... but chosen element is U1, get element R1 for U1 for element_U1
    state.selectedElements.push(state.allValuesMap.get("element_" + name));
}

function getEquationsTable(equations) {
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    if (colors.currentBackground === colors.keyDark) {
        table.classList.add("table-dark");
    } else {
        table.classList.add("table-light");
    }
    table.style.width = "fit-content";
    for (let [i, eq] of equations.entries()) {
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = `\\(\\mathrm{${romanNumbersMap.get(i+1)}})\\)`;
        cell = row.insertCell();
        cell.innerHTML = `\\(${eq}\\)`;
    }
    table.querySelectorAll("td").forEach(td => td.style.textAlign = "left");
    return table;
}

async function resetKirchhoffPage(calledFromResetBtn = false) {
    clearSimplifierPageContainer();
    showSpinnerLoadingCircuit();
    state.valuesShown = new Map();
    state.selectedElements = [];
    state.pictureCounter = 0;
    state.allValuesMap = new Map();
    state.doneVoltages = [];
    state.doneCurrents = [];
    state.voltEquations = [];
    state.extraLiveUsed = false;
    //resetExtraLiveModal();
    scrollBodyToTop();
    if (calledFromResetBtn) {
        startKirchhoff();  // Draw the first picture again
    }
}


function appendResetBtn(contentCol) {
    let resetContainer = document.createElement("div");
    resetContainer.classList.add("text-center", "justify-content-center", "mt-4");
    resetContainer.innerHTML = `
                    <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
                `;
    resetContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        resetKirchhoffPage(true);
    });
    contentCol.appendChild(resetContainer);
}

function createValuesContainer() {
    const valuesContainer = document.createElement("div");
    valuesContainer.id = "valuesContainer";
    valuesContainer.classList.add("container", "mb-5", "justify-content-center");
    valuesContainer.style.color = colors.currentForeground;

    let list = document.createElement("ul");
    list.style.lineHeight = "2";
    list.style.padding = "0";

    let given = document.createElement("li");
    given.innerHTML = languageManager.currentLang.givenValues;
    list.appendChild(given);

    let source = document.createElement("li");
    source.innerHTML = `\\(${languageManager.currentLang.voltageSymbol}${languageManager.currentLang.totalSuffix}=${getSourceVoltageVal()}\\)`;
    list.appendChild(source);

    for (let element of state.step0Data.allComponents) {
        let liElement = document.createElement("li");
        liElement.innerHTML = `\\(${element.Z.name}=${element.Z.val}\\)`;
        list.appendChild(liElement);
    }
    valuesContainer.appendChild(list);
    return valuesContainer;
}

function createKirchhoffSolutions() {
    const solBtnContainer = createSolutionsBtnContainer();
    const solutionsBtn = createSolutionsBtn();
    solBtnContainer.appendChild(solutionsBtn);
    prepareAllValuesMap();
    let table = generateSolutionsTable();
    let results = document.createElement("div");
    results.classList.add("circuit-container", "row", "justify-content-center");
    results.appendChild(table);
    solutionsBtn.addEventListener("click", async () => {
        if (solutionsBtn.textContent === languageManager.currentLang.solutionsBtn) {
            // Open explanation
            solutionsBtn.textContent = languageManager.currentLang.hideVoltageBtn;
            solBtnContainer.appendChild(results);
            await MathJax.typesetPromise();
            pushCircuitEventMatomo(circuitActions.ViewSolutions);
        } else {
            // Close explanation
            solutionsBtn.textContent = languageManager.currentLang.solutionsBtn;
            solBtnContainer.removeChild(results);
        }
    })
    return solBtnContainer;
}

function removeSvgEventHandlers(id) {
    let svgDiv = document.getElementById(id);
    if (svgDiv === null) return;
    let svg = svgDiv.querySelector("svg");
    let svgClone = svg.cloneNode(true);
    svgDiv.replaceChild(svgClone, svg);
}

function allVoltagesDone(svgDiv) {
    // Check if all elements including the source are grayed out
    let arrows = svgDiv.querySelectorAll("text.voltage-label.arrow");
    for (let arrow of arrows) {
        if (arrow.getAttribute("value") !== "done") {
            return false;
        }
    }
    return true;
}

function markVoltagesDone() {
    for (let elementId of state.selectedElements) {
        state.doneVoltages.push(elementId);
    }
}

function markCurrentsDone() {
    for (let elementId of state.selectedElements) {
        state.doneCurrents.push(elementId);
    }
}

function createSolutionsContainer() {
    let solutionsContainer = document.createElement("div");
    solutionsContainer.id = "solutions-container";
    solutionsContainer.style.color = colors.currentForeground;
    solutionsContainer.classList.add("text-center", "py-1", "mb-3", "mx-auto");
    solutionsContainer.innerHTML = "languageManager.currentLang.solutions";
    return solutionsContainer;
}

function setupKirchhoffStep(selector, first=false) {
    const circuitContainer = document.createElement('div');
    circuitContainer.classList.add("circuit-container", "row", "justify-content-center", "mt-4", "mb-2");
    const svgContainer = setupKirchhoffSVGandData(selector, state.step0Data, first);
    circuitContainer.appendChild(svgContainer)
    return {circuitContainer, svgContainer};
}

function setupKirchhoffSVGandData(selector, stepObject, first) {
    let svgData = stepObject.svgData;
    const svgDiv = document.createElement('div');
    if (selector === "volt") {
        svgDiv.id = `svgDivVolt${state.pictureCounter}`;
    } else if (selector === "curr") {
        svgDiv.id = `svgDivCurr${state.pictureCounter}`;
    }
    svgDiv.classList.add("svg-container", "p-2");
    svgData = setSvgWidthTo(svgData, "100%");
    svgDiv.style.border = `1px solid ${colors.currentForeground}`;
    svgDiv.style.borderRadius = "6px";
    svgDiv.style.width = "350px";
    svgDiv.style.maxWidth = "350px;";
    svgDiv.style.position = "relative";

    // Svg manipulation
    svgData = setKirchSvgColorToGray(svgData);
    svgDiv.innerHTML = svgData;
    let containsZ = divContainsZLabels(svgDiv);

    if (svgDiv.id === "svgDivVolt1" || containsZ) {
        // First svg, set valuesShown to false
        // Also set to zero if labels contain Z because they can't be toggled
        state.valuesShown.set(svgDiv.id, false);
    } else {
        // Set valuesShown to the previous state
        if (selector === "volt") {
            state.valuesShown.set(svgDiv.id, state.valuesShown.get(`svgDivVolt${state.pictureCounter - 1}`));
        } else if (selector === "curr") {
            state.valuesShown.set(svgDiv.id, state.valuesShown.get(`svgDivCurr${state.pictureCounter - 1}`));
        }
    }

    fillLabels(svgDiv);
    colorArrows(svgDiv);

    increaseLabelFontSize(svgDiv);

    let toHide = [];
    for (let source of state.step0Data.sources) {
        toHide.push(source.Z.name);
    }

    hideSourceLabel(svgDiv);
    hideElementLabels(svgDiv);

    if (selector === "volt") {
        hideCurrentArrows(svgDiv);
        for (let element of state.doneVoltages) {
            lightHighlightElement(svgDiv, element, selector);
        }
    } else if (selector === "curr") {
        hideVoltageArrows(svgDiv);
        hideItotArrow(svgDiv);
        for (let element of state.doneCurrents) {
            lightHighlightElement(svgDiv, element, selector);
        }
    }

    // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
    // Add button on first voltage and first current svg
    if (state.pictureCounter === 1 || first) {
        addKirchhoffInfoHelpButton(svgDiv);
    }

    return svgDiv;
}

function addEquationToSvg(svgDiv, nr, eq, color) {
    let overlay = document.createElement("div");
    overlay.id = `equation-overlay${state.pictureCounter}`;
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    if (colors.currentBackground === colors.keyDark) {
        table.classList.add("table-dark");
    } else {
        table.classList.add("table-light");
    }
    table.style.width = "fit-content";
    let row = table.insertRow();
    let cell = row.insertCell();
    cell.innerHTML = `\\(\\mathrm{${romanNumbersMap.get(nr)}})\\)`;
    cell = row.insertCell();
    cell.innerHTML = `\\(${eq}\\)`;
    table.querySelectorAll("td").forEach(td => {
            td.style.textAlign = "left";
            td.style.color = color;
        }
    );
    overlay.appendChild(table);
    svgDiv.appendChild(overlay);
}

function colorArrows(svgDiv) {
    let labels = svgDiv.querySelectorAll(".arrow");
    for (let label of labels) {
        if (label.classList.contains("voltage-label")) {
            label.style.color = colors.currentForeground;
            label.style.stroke = colors.currentForeground;
            label.style.fill = colors.currentForeground;
        } else if (label.classList.contains("current-label")) {
            label.style.color = colors.currentForeground;
            label.style.stroke = colors.currentForeground;
            label.style.fill = colors.currentForeground;
        }
    }
}

function increaseLabelFontSize(svgDiv) {
    let labels = svgDiv.querySelectorAll("text.arrow");
    labels.forEach(label => label.style.fontSize = "20px");
}

function addLoopDirectionBtn(svgDiv) {
    const dirBtn = document.createElement("button");
    dirBtn.type = "button";
    dirBtn.id = `loop-dir-btn`;
    dirBtn.classList.add("btn", "btn-secondary");
    dirBtn.style.position = "absolute";
    dirBtn.style.bottom = "5px";
    dirBtn.style.left = "5px";
    dirBtn.style.zIndex = "1000";
    dirBtn.style.color = colors.currentForeground;
    dirBtn.style.border = `1px solid ${colors.currentForeground}`;
    dirBtn.style.background = "none";
    dirBtn.innerText = kirchhoffLoopDirectionSymbol.clockwise;

    dirBtn.onclick = () => {
        if (dirBtn.innerText === kirchhoffLoopDirectionSymbol.clockwise) {
            dirBtn.innerText = kirchhoffLoopDirectionSymbol.counterclockwise;
        } else {
            dirBtn.innerText = kirchhoffLoopDirectionSymbol.clockwise;
        }
    };
    svgDiv.insertAdjacentElement("afterbegin", dirBtn);
}

function addKirchhoffInfoHelpButton(svgDiv) {
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
    infoBtn.innerText = "?";
    infoBtn.setAttribute("data-bs-toggle", "modal");
    if (state.pictureCounter === 1) {
        // Add explanation for voltage law
        infoBtn.setAttribute("data-bs-target", "#kirchhoffVInfoGif");
        infoBtn.id = "open-info-gif-btn-1";
    } else {
        // Add explanation for current law
        infoBtn.setAttribute("data-bs-target", "#kirchhoffIInfoGif");
        infoBtn.id = "open-info-gif-btn-2";
    }
    infoBtn.onclick = () => {infoBtn.blur()};  // make sure focus is removed when opening modal
    svgDiv.insertAdjacentElement("afterbegin", infoBtn);
}

function setKirchSvgColorToGray(svgData) {
    return svgData.replaceAll(colors.lightModeSvgStrokeColor, "gray");
}