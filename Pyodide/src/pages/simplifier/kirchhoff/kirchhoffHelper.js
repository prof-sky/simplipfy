function setupNextElementsVoltageLawContainer() {
    const nextElementsContainer = document.createElement('div');
    nextElementsContainer.className = 'next-elements-container';
    nextElementsContainer.id = "nextElementsContainer";
    nextElementsContainer.classList.add("text-center", "py-1", "mb-3");
    nextElementsContainer.style.color = colors.current.foreground;
    nextElementsContainer.innerHTML = `
        <h5>${languageManager.currentLang.kirchhoff.nextElementsVoltLawHeading}</h5>
        <ul class="px-0" id="next-elements-list"></ul>
        <div class="mb-3">
            <button class="btn btn-secondary mx-1 ${state.pictureCounter===1?"disabled":""}" id="reset-btn">reset</button>
            <button class="btn btn-primary mx-1 ${state.lives === 0 ? "disabled" : ""}" id="check-btn">check</button>
        </div>  
        <button class="btn btn-secondary mx-1" id="next-btn">${languageManager.currentLang.kirchhoff.junctionBtn}</button>
    `;
    nextElementsContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        pageManager.pages.kirchhoffPage.resetBtn();
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
        if ((await state.solvers.kirchhoff.foundAllVoltEquations()).data) {
            // Remove last svg
            let svgDiv = document.getElementById(`svgDivVolt${state.pictureCounter}`).parentElement;
            svgDiv.remove();
            //for (let i = 0; i <= state.pictureCounter; i++) {
             //   removeSvgEventHandlers(`svgDivVolt${i}`);
            //}
            // Finish circuit if enough equations found
            if ((await state.solvers.kirchhoff.foundAllEquations()).data) {
                let contentCol = document.getElementById("content-col");
                finishKirchhoff(contentCol);
                pushCircuitEventMatomo(circuitActions.Finished, state.pictureCounter);
                UserEmojiMessage.success(languageManager.currentLang.kirchhoff.foundEnoughVoltLoops, false);
            } else {
                    pushCircuitEventMatomo(circuitActions.FinishedVoltages);
                    state.selectedElements = [];
                    await nextKirchhoffCurrStep(true);
                    // scrollContainerToTop(document.getElementById("junctionHeading"));
            }
        } else {
            setTimeout(() => {
                UserEmojiMessage.warning(languageManager.currentLang.alerts.notAllVoltLoopsFound);
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
    nextElementsContainer.style.color = colors.current.foreground;
    nextElementsContainer.innerHTML = `
        <h5>${languageManager.currentLang.kirchhoff.nextElementsCurrentHeading}</h5>
        <ul class="px-0" id="next-elements-list"></ul>
        <div class="mb-3">
            <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
            <button class="btn btn-primary mx-1 ${state.lives === 0 ? "disabled" : ""}" id="check-btn">check</button>
        </div>
        <button class="btn btn-secondary mx-1" id="finish-btn">${languageManager.currentLang.kirchhoff.finishBtn}</button>
    `;
    nextElementsContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        pageManager.pages.kirchhoffPage.resetBtn();
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
    let allEqsFound = (await state.solvers.kirchhoff.foundAllEquations()).data;
    if (allEqsFound) {
        finishKirchhoff(contentCol);
    } else {
        UserEmojiMessage.warning(languageManager.currentLang.alerts.notAllEquationsFound);
    }
}

async function solveFirstStep() {
    state.step0Data = (await state.solvers.kirchhoff.createStep0()).data;
    state.currentStep = 0;
}

function showWrongSelection(checkBoxId) {
    setTimeout(() => {
        let nextElementList = document.querySelector('#nextElementsContainer ul');
        let checkBox = nextElementList.querySelector(`#${checkBoxId}`);
        checkBox.style.backgroundColor = colors.definitions.wrongEquationColor;
        checkBox.style.borderColor = colors.definitions.wrongEquationColor;
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
        checkBox.style.backgroundColor = colors.definitions.correctEquationColor;
        checkBox.style.borderColor = colors.definitions.correctEquationColor;
    }, 250);
    await new Promise(resolve => setTimeout(resolve, 250)); // Wait for animation to start
    label.classList.add("fade-out");
    await new Promise(resolve => setTimeout(resolve, 750)); // Wait for animation to fade out
}

async function getCurrentEquationNr() {
    let equations = (await state.solvers.kirchhoff.equations()).data;
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
    equationContainer.innerHTML = languageManager.currentLang.kirchhoff.missingEquations;
    equationContainer.appendChild(getEquationsTable((await state.solvers.kirchhoff.equations()).data));
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
        msg = languageManager.currentLang.alerts.loopAlreadyExists
        pushCircuitEventMatomo(circuitActions.LoopAlreadyExists);
        subtract1Live();
    } else if (errorCode === 2) {
        // Invalid selection
        msg = languageManager.currentLang.alerts.invalidVoltageLoop
        pushCircuitEventMatomo(circuitActions.InvalidVoltageLoop);
        subtract1Live();
    } else if (errorCode === 3) {
        // Only for junction law
        return
    } else if (errorCode === 4) {
        // Not a valid loop order
        msg = languageManager.currentLang.alerts.invalidLoopOrder
    } else if (errorCode === 5){
        msg = languageManager.currentLang.alerts.dependentEquation
    } else{
        msg = languageManager.currentLang.alerts.somethingIsWrong
    }
    UserEmojiMessage.warning(msg);
}

function handleJunctionError(errorCode, svgDiv) {
    if (errorCode === 1) {
        // Equation already exists
        UserEmojiMessage.warning(languageManager.currentLang.alerts.junctionAlreadyExists);
        pushCircuitEventMatomo(circuitActions.JunctionAlreadyExists);
        subtract1Live();
    } else if (errorCode === 2) {
        // Invalid selection
        UserEmojiMessage.warning(languageManager.currentLang.alerts.invalidJunction);
        pushCircuitEventMatomo(circuitActions.InvalidJunction);
        subtract1Live();
    } else if (errorCode === 3) {
        // Only for junction law, if more than 2 elements in series are chosen we can't generate
        // one equation but two, I1 = I2 = I3, but we want I1 = I2 and I2 = I3
        // So throw error if more than 2 series elements are chosen
        UserEmojiMessage.warning(languageManager.currentLang.alerts.tooManyJunctionNodes);
        subtract1Live();
    } else if (errorCode === 4) {
        // Only for voltage law
    } else {
        // Default error
        UserEmojiMessage.warning(languageManager.currentLang.alerts.somethingIsWrong);
    }
}

function createVoltHeading() {
    let voltHeading = document.createElement("div");
    voltHeading.classList.add("h5");
    voltHeading.innerHTML = languageManager.currentLang.kirchhoff.voltageHeading;
    voltHeading.style.color = colors.current.foreground;
    voltHeading.style.marginTop = "15px";
    voltHeading.style.width = "350px";
    voltHeading.style.position = "relative";
    voltHeading.style.margin = "auto";
    voltHeading.id = "volt-heading";
    return voltHeading;
}

function createEquationsContainer() {
    let equationsContainer = document.createElement("div");
    equationsContainer.id = "equations-container";
    equationsContainer.style.color = colors.current.foreground;
    return equationsContainer;
}

async function createEquationsOverviewContainer() {
    let equations = document.createElement("div");
    equations.id = "equations-overview-container";
    equations.style.color = colors.current.foreground;
    equations.classList.add("text-center", "py-1", "mb-3", "mx-auto");
    let text = document.createElement("p");
    text.classList.add("text-center", "my-3", "mx-auto");
    text.innerHTML = languageManager.currentLang.kirchhoff.missingEquations;
    text.style.color = colors.current.foreground;
    text.style.maxWidth = "350px";
    equations.appendChild(text);
    let eqs = (await state.solvers.kirchhoff.equations()).data;
    // Filter out "-" equations
    eqs = eqs.filter(eq => eq !== "-");
    equations.appendChild(getEquationsTable(eqs));

    return equations;
}

function createCurrentHeading() {
    let currentHeading = document.createElement("div");
    currentHeading.classList.add("h5");
    currentHeading.innerHTML = languageManager.currentLang.kirchhoff.currentHeading;
    currentHeading.style.color = colors.current.foreground;
    currentHeading.style.marginTop = "15px";
    currentHeading.style.width = "350px";
    currentHeading.style.position = "relative";
    currentHeading.style.margin = "auto";
    currentHeading.id = "current-heading";
    return currentHeading;
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
    await pageManager.pages.kirchhoffPage.typesetPage();
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
            e.style.color = colors.definitions.lightVoltageBlue;
            e.style.stroke = colors.definitions.lightVoltageBlue;
            e.style.fill = colors.definitions.lightVoltageBlue;
        }
    } else if (selector === "curr") {
        let ele = svgDiv.querySelectorAll(`.current-label.arrow.${curr_name}`);
        for (let e of ele) {
            e.style.fontWeight = "normal";
            e.style.color = colors.definitions.lightCurrentRed;
            e.style.stroke = colors.definitions.lightCurrentRed;
            e.style.fill = colors.definitions.lightCurrentRed;
        }
    }
}

function grayOutElement(element) {
    element.style.fontWeight = "normal";
    element.style.color = colors.definitions.kirchhoffGray;
    element.style.stroke = colors.definitions.kirchhoffGray;
    element.style.fill = colors.definitions.kirchhoffGray;
}

function removeHighlight(element) {
    element.style.fontWeight = "normal";
    element.style.color = colors.current.foreground;
    element.style.stroke = colors.current.foreground;
    element.style.fill = colors.current.foreground;
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

function getEquationsTable(equations, offset = 0, bold=false) {

    const boldPre = !bold ? "" : "\\boldsymbol{";
    const boldSuff = !bold ? "" : "}";

    /** @type {HTMLTableElement} */
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    table.classList.add(`table-${colors.current.bsColorScheme}`);
    table.style.width = "fit-content";
    for (let [i, eq] of equations.entries()) {
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = `\\(${boldPre}\\mathrm{${window.definitions.romanNumbersMap.get(i+1+offset)}}${boldSuff}\\)`;
        cell = row.insertCell();
        cell.innerHTML = `\\(${boldPre}${eq}${boldSuff}\\)`;
        //if (bold) cell.innerHTML = `\\textbf{${cell.textContent}}`;
    }
    table.querySelectorAll("td").forEach(td => td.style.textAlign = "left");
    return table;
}

function appendResetBtn(contentCol) {
    let resetContainer = document.createElement("div");
    resetContainer.classList.add("text-center", "justify-content-center", "mt-4");
    resetContainer.innerHTML = `
                    <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
                `;
    resetContainer.querySelector("#reset-btn").addEventListener('click', () => {
        pushCircuitEventMatomo(circuitActions.Reset, state.pictureCounter);
        pageManager.pages.kirchhoffPage.resetBtn();
    });
    contentCol.appendChild(resetContainer);
}

function createValuesContainer() {
    const valuesContainer = document.createElement("div");
    valuesContainer.id = "valuesContainer";
    valuesContainer.classList.add("container", "mb-5", "justify-content-center");
    valuesContainer.style.color = colors.current.foreground;

    let list = document.createElement("ul");
    list.style.lineHeight = "2";
    list.style.padding = "0";

    let given = document.createElement("li");
    given.innerHTML = languageManager.currentLang.kirchhoff.givenValues;
    list.appendChild(given);

    let source = document.createElement("li");
    source.innerHTML = `\\(${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${languageManager.currentLang.simplifier.totalSuffix}}=${getSourceVoltageVal()}\\)`;
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
        if (solutionsBtn.textContent === languageManager.currentLang.simplifier.solutionsBtn) {
            // Open explanation
            solutionsBtn.textContent = languageManager.currentLang.simplifier.hideVoltageBtn;
            solBtnContainer.appendChild(results);
            await pageManager.pages.kirchhoffPage.typesetPage();
            pushCircuitEventMatomo(circuitActions.ViewSolutions);
        } else {
            // Close explanation
            solutionsBtn.textContent = languageManager.currentLang.simplifier.solutionsBtn;
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

function setupKirchhoffStep(selector, first=false) {
    const circuitContainer = document.createElement('div');
    circuitContainer.classList.add("circuit-container", "row", "justify-content-center", "mt-4", "mb-2");
    const svgContainer = setupKirchhoffSVGandData(selector, state.step0Data, first);
    circuitContainer.appendChild(svgContainer)
    return {circuitContainer, svgContainer};
}

function setupKirchhoffSVGandData(selector, stepObject, first) {
    let _id;
    if (selector === "volt") {
        _id = `svgDivVolt${state.pictureCounter}`;
    } else if (selector === "curr") {
        _id = `svgDivCurr${state.pictureCounter}`;
    }

    // Svg manipulation
    let svgDiv = new KirchhoffPageSvgDiv(stepObject.svgData, selector, _id);
    let containsZ = divContainsZLabels(svgDiv.div);

    if (_id === "svgDivVolt1" || containsZ) {
        // First svg, set valuesShown to false
        // Also set to zero if labels contain Z because they can't be toggled
        state.valuesShown.set(_id, false);
    } else {
        // Set valuesShown to the previous state
        if (selector === "volt") {
            state.valuesShown.set(_id, state.valuesShown.get(`svgDivVolt${state.pictureCounter - 1}`));
        } else if (selector === "curr") {
            state.valuesShown.set(_id, state.valuesShown.get(`svgDivCurr${state.pictureCounter - 1}`));
        }
    }


    // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
    // Add button on first voltage and first current svg
    if (state.pictureCounter === 1 || first) {
        addKirchhoffInfoHelpButton(svgDiv.div);
    }

    return svgDiv.div;
}

function addEquationToSvg(svgDiv, nr, eq, color) {
    let overlay = document.createElement("div");
    overlay.id = `equation-overlay${state.pictureCounter}`;
    let table = document.createElement("table");
    table.classList.add("table", "table-borderless", "mx-auto");
    if (colors.current.background === colors.definitions.keyDark) {
        table.classList.add("table-dark");
    } else {
        table.classList.add("table-light");
    }
    table.style.width = "fit-content";
    let row = table.insertRow();
    let cell = row.insertCell();
    //cell.innerHTML = `\\(\\mathrm{${window.definitions.romanNumbersMap.get(nr)}})\\)`;
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

function addKirchhoffInfoHelpButton(svgDiv) {
    /** @type {HTMLButtonElement} */
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
    infoBtn.innerText = "?";
    infoBtn.setAttribute("data-bs-toggle", "modal");
    infoBtn.onclick = () => {
        infoBtn.blur()
        if (state.pictureCounter === 1) {
            // Add explanation for voltage law
            infoBtn.id = "open-info-gif-btn-1";
            modalSm.show(new KirchhoffVModal())
        } else {
            // Add explanation for current law
            infoBtn.id = "open-info-gif-btn-2";
            modalSm.show(new KirchhoffIModal())
        }
    };  // make sure focus is removed when opening modal
    svgDiv.insertAdjacentElement("afterbegin", infoBtn);
}

function setKirchSvgColorToGray(svgData) {
    return svgData.replaceAll(colors.svgGenerationStrokeColor, "gray");
}