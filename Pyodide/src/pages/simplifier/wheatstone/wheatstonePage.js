/**
 * Page where wheatstone tasks are solved
 * @extends SimplifierPage
 */
class WheatstonePage extends SimplifierPage{
    constructor() {
        let content = {
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "WheatstonePage", window.definitions.selectorIDs.wheatstone);
    }

    reset(calledFromResetBtn){
        this.invalidate();
        SimplifierPage.clear();

        state.pictureCounter = 0;
        //resetExtraLiveModal();
        scrollBodyToTop();
        //resetLives();
        if (calledFromResetBtn) {
            pageManager.changePage(pageManager.pages.wheatstonePage, true); // Draw the first picture again
        }
    }

    async initialize() {
        if(!super.beforeInit()) return;
        try{

            const {circuitContainer, svgContainer} = await setupWheatstoneSVGContainer();
            const contentCol = document.getElementById("content-col");
            let wheatHeading = createWheatHeading();
            contentCol.appendChild(wheatHeading);
            contentCol.append(circuitContainer);

            let inputPopup = this.#createPopupInput();
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
            await MathJax.typesetPromise(['#content-col']);
            super.afterInit();
        }
        catch(error){
            console.trace(error)
            console.error("Error starting Wheatstone: " + error);
            UserMessage.error(error);
            pushErrorEventMatomo(errorActions.wheatstoneStartError, error);
        }
    }

    afterPyodideLoaded() {

    }

    #createPopupInput() {
        let inputPopup = document.createElement("div");
        inputPopup.innerHTML = `<div id="input-popup" class="position-fixed top-50 start-50 translate-middle p-4 bg-light border rounded shadow"
                                 style="display: none; z-index: 1050; min-width: 200px;">
                                <label for="number-input" class="form-label">${languageManager.currentLang.wheatstone.inputPopupTitle}</label>
                                <input type="number" id="number-input" name="nr-input" min="0" class="form-control mb-2"/>
                                <div class="d-flex justify-content-center" style="gap: 5px">
                                    <button id="popup-cancel" class="btn btn-secondary btn-sm">X</button>
                                    <button id="popup-confirm" class="btn btn-primary btn-sm me-2" style="background-color: ${colors.definitions.keyYellow}; border: none; color: ${colors.definitions.keyDark}">OK</button>
                                </div>
                            </div>`;
        inputPopup.id = "input-popup-container";
        return inputPopup;
    }

}