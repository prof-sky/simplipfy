// ####################################################################################################################
// #################################### Key function for kirchhoff circuits ###########################################
// ####################################################################################################################

/**
 * This function generates a new voltage step for kirchhoff
 */
async function nextKirchhoffVoltStep() {
    state.pictureCounter++;

    appendKirchhoffValuesToAllValuesMap();

    const {circuitContainer, svgContainer} = setupKirchhoffStep("volt");
    const contentCol = document.getElementById("content-col");

    if (state.pictureCounter === 1) {
        let voltHeading = createVoltHeading();
        contentCol.appendChild(voltHeading);
        scrollContainerToTop(voltHeading);
    }
    contentCol.append(circuitContainer);

    let equationsContainer = createEquationsContainer();
    equationsContainer.appendChild(getEquationsTable(state.voltEquations));
    contentCol.append(equationsContainer);

    const nextElementsContainer = setupNextElementsVoltageLawContainer();

    let arrows = svgContainer.querySelectorAll("text.arrow.voltage-label");
    makeElementsClickableForKirchhoff(svgContainer, nextElementsContainer, arrows, "volt");
    prepareNextElementsContainer(contentCol, nextElementsContainer);
    await pageManager.pages.kirchhoffPage.typesetPage();

    if (state.gamification && state.pictureCounter === 1) {
        const duration = state.kirchhoffBaseTime;

        addSpeedModeTimeBar(duration, () => {
            speedModeTimeoutHandler();
        });
    }

    if (state.gamification && state.pictureCounter > 1 && state.speedMode?.paused) {
        resumeSpeedMode();
    }
}

/**
 * This function generates a new current step for kirchhoff
 */
async function nextKirchhoffCurrStep(first=false) {
    state.pictureCounter++;
    const {circuitContainer, svgContainer} = setupKirchhoffStep("curr", first);
    const contentCol = document.getElementById("content-col");
    if (first) {
        let currentHeading = createCurrentHeading();
        contentCol.append(currentHeading);
        scrollContainerToTop(currentHeading);
    }
    contentCol.append(circuitContainer);

    const nextElementsContainer = setupNextElementsCurrentLawContainer();

    let arrows = svgContainer.querySelectorAll("text.arrow.current-label");
    makeElementsClickableForKirchhoff(svgContainer, nextElementsContainer, arrows, "curr");
    prepareNextElementsContainer(contentCol, nextElementsContainer);

    let equations = await createEquationsOverviewContainer();
    contentCol.append(equations);
    await pageManager.pages.kirchhoffPage.typesetPage();

    if (state.gamification && state.speedMode?.paused) {
        resumeSpeedMode();
    }
}

// ####################################################################################################################
// ############################################# Helper functions #####################################################
// ####################################################################################################################

/**
 * Function for checking the selected voltage loop
 */
async function checkVoltageLoop() {
    let svgDiv = document.getElementById(`svgDivVolt${state.pictureCounter}`);

    // At least two elements must be selected
    if (state.selectedElements.length <= 1) {
        // Timeout so that the message is shown after the click event
        UserEmojiMessage.warning(languageManager.currentLang.alerts.chooseAtLeastTwoElements);
        resetArrowHighlights(document.getElementById(`svgDivVolt${state.pictureCounter}`), "volt");
        const nextElementList = document.getElementById("next-elements-list");
        nextElementList.innerHTML = '';
        state.selectedElements = [];
        return;
    }

    let elapsed;
    if (state.gamification) {
        elapsed = pauseSpeedMode();
    }
    let now = performance.now();

    // Calling the backend function to check the voltage loop (selectedElements containing the IDs of the selected elements, i.e. R1, R2, C1)
    let [errorCode, eq] = (await state.solvers.kirchhoff.checkVoltageLoopRule(state.selectedElements)).data;

    // adjust start time for duration of calulation
    let elapsedTime = performance.now() - now;
    if (state.speedMode && state.speedMode?.startTime) {
        state.speedMode.startTime += elapsedTime;
    }

    // Only add time if correct, otherwise directly resume
    if (state.gamification && !errorCode && state.speedMode) {
        // Get number of elements in the current circuit
        const svgDiv = document.getElementById(`svgDivVolt${state.pictureCounter}`);
        let electricElements = getElementsFromSvgContainer(svgDiv);
        state.speedMode.duration -= elapsed;
        state.speedMode.duration += state.kirchhoffAddTime * electricElements.length;
        state.speedMode.remaining = Math.max(0, state.speedMode.duration);
    }
    if (state.gamification && state.speedMode && state.speedMode?.paused && errorCode) {
        // remaining time is time from before
        state.speedMode.duration -= elapsed;
        state.speedMode.remaining = Math.max(0, state.speedMode.duration);
        resumeSpeedMode();
    }

    if (errorCode) {
        handleVoltageError(errorCode, svgDiv);
        resetArrowHighlights(document.getElementById(`svgDivVolt${state.pictureCounter}`), "volt");
        const nextElementList = document.getElementById("next-elements-list");
        nextElementList.innerHTML = '';
        state.selectedElements = [];
        return;
    }

    // Save the new voltage equation
    state.voltEquations.push(eq);
    let eqNr = state.voltEquations.length;
    addEquationToSvg(svgDiv, eqNr, eq, colors.voltageBlue);
    await pageManager.pages.kirchhoffPage.typesetPage();
    // Equation is added to svg, remove to container where old equations are shown
    let equationsContainer = document.getElementById("equations-container");
    equationsContainer.remove();

    // Make the elements in the old container not clickable anymore
    removeSvgEventHandlers(`svgDivVolt${state.pictureCounter}`);

    markVoltagesDone();
    state.selectedElements = [];

    await nextKirchhoffVoltStep();
    scrollContainerToTop(document.getElementById(`svgDivVolt${state.pictureCounter}`));
}

/**
 * Function for checking the selected current junction
 */
async function checkJunctionLaw() {
    let svgDiv = document.getElementById(`svgDivCurr${state.pictureCounter}`);
    let checkBtn = document.getElementById("check-btn");
    checkBtn.classList.add("disabled");

    // At least two elements must be selected
    if (state.selectedElements.length <= 1) {
        // Timeout so that the message is shown after the click event
        UserEmojiMessage.warning(languageManager.currentLang.alerts.chooseAtLeastTwoElements);
        resetArrowHighlights(document.getElementById(`svgDivCurr${state.pictureCounter}`), "curr");
        checkBtn.classList.remove("disabled");
        document.getElementById("check-btn").innerHTML = "check";
        const nextElementList = document.getElementById("next-elements-list");
        nextElementList.innerHTML = '';
        state.selectedElements = [];
        return;
    }
    let nextElementsContainer = document.getElementById("nextElementsContainer");
    nextElementsContainer.querySelector("#reset-btn").classList.remove("disabled");

    let elapsed;
    if (state.gamification) {
        elapsed = pauseSpeedMode();
    }
    let now = performance.now();

    // Calling the backend function to check the junction
    let [errorCode, eqs] = (await state.solvers.kirchhoff.checkJunctionRule(state.selectedElements)).data;

    // adjust start time for duration of calulation
    let elapsedTime = performance.now() - now;
    if (state.speedMode && state.speedMode?.startTime) {
        state.speedMode.startTime += elapsedTime;
    }

    // Directly resume if error
    if (state.gamification && state.speedMode && state.speedMode?.paused && errorCode) {
        // remaining time is time from before
        state.speedMode.duration -= elapsed;
        state.speedMode.remaining = Math.max(0, state.speedMode.duration);
        resumeSpeedMode();
    }

    if (errorCode) {
        handleJunctionError(errorCode, svgDiv);
        resetArrowHighlights(document.getElementById(`svgDivCurr${state.pictureCounter}`), "curr");
        checkBtn.classList.remove("disabled");
        checkBtn.innerHTML = "check";
        const nextElementList = document.getElementById("next-elements-list");
        nextElementList.innerHTML = '';
        state.selectedElements = [];
        return;
    }

    // Make the elements in the old container not clickable anymore
    removeSvgEventHandlers(`svgDivCurr${state.pictureCounter}`); // old picture counter

    // Multiple choice for different junction law equations
    generateMultipleChoiceEquations(eqs);

    // Check if speed mode is active, correct equation is select here
    if (state.gamification && state.speedMode) {
        // Get number of elements in the current circuit
        const svgDiv = document.getElementById(`svgDivCurr${state.pictureCounter}`);
        let electricElements = getElementsFromSvgContainer(svgDiv);
        state.speedMode.duration -= elapsed;
        state.speedMode.duration += state.kirchhoffAddTime * electricElements.length;
        state.speedMode.remaining = Math.max(0, state.speedMode.duration);
        resumeSpeedMode();
    }

    await waitForCorrectSelection();
    // Correct equation selected
    await updateEquations();
    checkBtn.classList.remove("disabled");

    let nr = await getCurrentEquationNr();
    addEquationToSvg(svgDiv, nr, eqs[0], colors.currentRed);
    await pageManager.pages.kirchhoffPage.typesetPage();

    let overview = document.getElementById("equations-overview-container");
    overview.remove();

    markCurrentsDone();
    state.selectedElements = [];

    await nextKirchhoffCurrStep(); // will increment pictureCounter
    scrollContainerToTop(document.getElementById(`svgDivCurr${state.pictureCounter}`));
}

function kirchhoffHeadingElement(headingText){
    /** @type {HTMLParagraphElement} */
    let heading = document.createElement("p")
    heading.style.color = colors.current.foreground;
    heading.style.background = colors.current.bsBackground;
    heading.innerHTML = headingText;

    return heading;
}

async function finishKirchhoff(contentCol) {
    if (state.gamification) {
        stopSpeedModeTimer();
        let speedModeBar = document.getElementById("speedModeBar");
        speedModeBar?.remove();
    }
    pushCircuitEventMatomo(circuitActions.Finished, -1);
    // Remove last curr svg if it exists
    if (document.getElementById("junctionHeading") !== null) {
        let svgDiv = document.getElementById(`svgDivCurr${state.pictureCounter}`).parentElement;
        svgDiv.remove();
        removeSvgEventHandlers(`svgDivCurr${state.pictureCounter}`);
    }
    // Remove text above equations
    let equationContainer = document.getElementById("equations-overview-container");
    if (equationContainer !== null) {
        equationContainer.innerHTML = "";

        let equationsDiv = document.createElement("div");
        equationsDiv.appendChild(kirchhoffHeadingElement(languageManager.currentLang.kirchhoff.equationsHeading));
        equationsDiv.appendChild(getEquationsTable((await state.solvers.kirchhoff.equations()).data));
        equationsDiv.appendChild(kirchhoffHeadingElement(languageManager.currentLang.kirchhoff.equationsURIHeading));
        /** @type {Array<string>} */
        let voltEqs = (await state.solvers.kirchhoff.voltEquationsURI()).data
        let eqTable = getEquationsTable(voltEqs, 0, true)

        let curEqs = (await state.solvers.kirchhoff.currEquations()).data
        let cEqTable = getEquationsTable(curEqs, voltEqs.length);
        for (let row of cEqTable.rows) {
            let newRow = eqTable.insertRow()
            newRow.innerHTML = row.innerHTML;
        }

        equationsDiv.appendChild(eqTable);
        equationsDiv.style.display = "none";

        equationContainer.appendChild(equationsDiv);
        await pageManager.pages.kirchhoffPage.typesetPage();

        equationsDiv.style.display = "block";
    }
    showVariableConfetti();
    document.getElementById("nextElementsContainer").remove();

    // Show values and solutions button
    let valuesContainer = createValuesContainer();
    contentCol.appendChild(valuesContainer);
    const solBtnContainer = createKirchhoffSolutions();
    contentCol.appendChild(solBtnContainer);
    appendResetBtn(contentCol);
    state.currentSelector.saveFinishedCircuit(true);
    // Add next circuit button if not from QR scan
    if (!state.currentCircuitFromQrScan && !state.currentCircuitFromEditor) {
        let nextCircuitBtn = state.currentSelector.createNextCircuitBtn();
        contentCol.appendChild(nextCircuitBtn);
    }
    await pageManager.pages.kirchhoffPage.typesetPage();
}

