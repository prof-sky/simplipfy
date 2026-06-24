/** Creates regularly used HTML elements */
class Containers {
    /** @returns {HTMLDivElement} */
    static get Circuit(){
        const circuitContainer = document.createElement('div');
        circuitContainer.classList.add("circuit-container", "row", "justify-content-center", "my-2");
        return circuitContainer;
    }

    /**
     * creates the container that is used to store the selected elements in a circuit and holds the check and reset
     * buttons. It is displayed underneath the last simplifier step on a simplifier page.
     * @returns {HTMLDivElement} */
    static get NextElements(){
        /** @type {HTMLDivElement} */
        const nextElementsContainer = document.createElement('div');
        nextElementsContainer.className = 'next-elements-container';
        nextElementsContainer.id = "nextElementsContainer";
        nextElementsContainer.classList.add("text-center", "py-1", "mb-3");
        nextElementsContainer.style.color = colors.current.foreground;

        nextElementsContainer.innerHTML =
        `
        <h3>${languageManager.currentLang.simplifier.nextElementsHeading}</h3>
        <ul class="px-0" id="next-elements-list"></ul>
        <button class="btn btn-secondary mx-1 ${state.pictureCounter === 1 ? "disabled" : ""}" id="reset-btn">reset</button>
        <button class="btn btn-primary mx-1 ${state.lives === 0 ? "disabled" : ""}" id="check-btn">check</button>
        `;

        return nextElementsContainer;
    }

    /** @returns {HTMLDivElement} */
    static get SimplifierFinish(){
        /** @type {HTMLDivElement} */
        let msg;
        let sourceInfo;
        let sfx = languageManager.currentLang.simplifier.totalSuffix;
        if ([window.definitions.selectorIDs.capacitor, window.definitions.selectorIDs.inductor, window.definitions.selectorIDs.mixed].includes(state.currentCircuitMap.selectorGroup)) {
            sfx += "," + languageManager.currentLang.simplifier.effectiveSuffix;
        }
        if (currentCircuitIsSymbolic()) {
            sourceInfo = `$$ ${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${sfx}}=${renameVSrc(getSourceVoltageVal())} $$`;
        } else {
            if (sourceIsAC()) {
                sourceInfo = `$$ ${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${sfx}}=${getSourceVoltageVal()} $$
                          $$ f = ${getSourceFrequency()}$$`;
            } else {
                sourceInfo = `$$ ${languageManager.currentLang.simplifier.voltageSymbol}_\\text{${sfx}}=${getSourceVoltageVal()} $$`;
            }
        }

        // Give a note what voltage is used and that voltage/current is available

        msg = `
        <p class="mx-auto" style="max-width: 400px">${languageManager.currentLang.simplifier.msgVoltAndCurrentAvailable}.<br></p>
        <p class="mx-auto" style="max-width: 400px">${languageManager.currentLang.simplifier.msgShowVoltage}<br>${sourceInfo}</p>
        <button class="btn btn-secondary mx-1" id="reset-btn">reset</button>
        <!--<button class="btn btn-primary mx-1 disabled" id="check-btn">check</button>-->
        `;

        /** @type {HTMLDivElement} */
        let finishContainer = document.createElement("div")
        finishContainer.id = "finish-container";
        finishContainer.className = 'next-elements-container';
        finishContainer.classList.add("text-center", "py-1", "mb-3");
        finishContainer.style.color = colors.current.foreground;
        finishContainer.innerHTML = msg;

        return finishContainer;
    }
}