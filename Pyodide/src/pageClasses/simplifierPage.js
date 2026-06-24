/**
 * Special case of a class. This manages the page layout when a circuit is selected and represents the different modes
 * simpliPFy supports e.g. stepwise, kirchhoff, wheatstone ...
 * Each mode has to be derived from this class. Each mode writes to the same div "content-col" that is accessible with
 * this.contentDiv
 * @abstract
 * @extends Page
 */
class SimplifierPage extends Page{
    /** @type {HTMLDivElement} */
    static #contentDiv = null;

    constructor(content, title){
        super(content, "simplifier-page-container", title, "nav-select");
    }

    static get contentDiv(){
        if (!SimplifierPage.#contentDiv) SimplifierPage.#contentDiv = document.getElementById("content-col");

        return SimplifierPage.#contentDiv;
    }

    get contentDiv(){
        return SimplifierPage.contentDiv;
    }

    get navigationTitle(){
        return languageManager.currentLang.selector.selectorHeadings[state.currentCircuitMap.selectorGroup]
    }

    matomoEvent(){
        pushPageViewMatomo(state.currentCircuitMap.selectorGroup + "/" + state.currentCircuitMap.circuitFile);
    }

    show(){
        pageManager.pages.navigation.disableSettings();
        SimplifierPage.contentDiv.style.display = "block";
        return super.show();
    }


    hide() {
        super.hide();
        SimplifierPage.contentDiv.style.display = "none";
        pageManager.pages.navigation.enableSettings();
    }

    /** @param {WorkerCommunication} worker
     * @param force {boolean} if ture solver instances are overwritten if they exist */
    static createSolvers(worker, force = false ){
        if (state.solversReady && !force) return;
        state.solvers.stepwise = new StepSolverAPI(worker)
        state.solvers.kirchhoff = new KirchhoffSolverAPI(worker)
        state.solvers.wheatstone = new WheatstoneSolverAPI(worker)
        state.solvers.magnetic = new MagneticSolverAPI(worker)
        state.solversReady = true;
    }

    static resetSolvers(){
        for (let solver of Object.values(state.solvers)){
            if (solver) solver.reset()
        }
    }

    reset(){
        throw Error("Implement in Child")
    }

    resetBtn(){
        this.reset(true)
        if (this.wasAborted) pushCircuitEventMatomo(circuitActions.Aborted, state.pictureCounter);
    }

    updateContent(){
        this.reset()
        pageManager.changePage(this, true);
    }

    static clear(){
        SimplifierPage.contentDiv.innerHTML = '';
    }

    /** @param circuitMap {CircuitMap | WheatstoneCircuitMap} */
    static async showSimplifierPage(circuitMap){
        this.clear();

        state.currentCircuitMap = circuitMap
        state.pictureCounter = 0;
        state.allValuesMap = new Map();

        // page change needs forcing because a different circuit may be displayed on the same page, but we need to
        // reload to show the content correctly. Page manager doesn't change the page if it is already on that page.
        if (circuitMap.selectorGroup === window.definitions.selectorIDs.kirchhoff) {
            pageManager.pages.kirchhoffPage.reset()
            pageManager.changePage(pageManager.pages.kirchhoffPage, true);
        }
        else if (circuitMap.selectorGroup === window.definitions.selectorIDs.wheatstone) {
            pageManager.pages.wheatstonePage.reset()
            pageManager.changePage(pageManager.pages.wheatstonePage, true);
        }
        else if (circuitMap.selectorGroup === window.definitions.selectorIDs.magnetic) {
            pageManager.pages.magneticPage.reset()
            pageManager.changePage(pageManager.pages.magneticPage, true)
        }
        else {
            pageManager.pages.stepwisePage.reset();
            pageManager.changePage(pageManager.pages.stepwisePage, true);
        }
    }

    get wasAborted(){
        let checkBtnParallel = document.getElementById("check-btn-parallel");
        let checkBtnSeries = document.getElementById("check-btn-series");

        if (state.currentCircuitMap !== null && checkBtnParallel && checkBtnSeries) {
            // If the check btn is disabled, the user has finished the simplification
            // That means if the page is reset, the user aborted the simplification
            // If calledFromResetBtn, then don't push the event because it's reset, and not aborted
            // Also don't push the event if the user is on the first picture, maybe it was just a miss click
            let checkBtnParallelDisabled = checkBtnParallel.classList.contains("disabled");
            let checkBtnSeriesDisabled = checkBtnSeries.classList.contains("disabled");
            if (!checkBtnParallelDisabled && state.pictureCounter > 1){
                return true;
            }
            if(!checkBtnSeriesDisabled && state.pictureCounter > 1){
                return true;
            }
        }
        return false;
    }

    afterInit(){
        if (state.gamification) {
            setupShakeAnimation();
        }
        super.afterInit();
    }

    updateColor() {
        super.updateColor();
        // Toggle buttons
        const toggleViewButtons = this.pageDiv.getElementsByClassName("toggle-view");
        for (const toggleViewButton of toggleViewButtons) {
            toggleViewButton.style.color = colors.current.foreground;
        }
    }

    /**
     * Checks the step0Data for the error property. If it is true, an error message is shown and the page is changed
     * to the last page in the history.
     * @returns {int} 1 if there was an error, otherwise 0
     */
    checkForError(){
        if (state.step0Data.error) {
            UserEmojiMessage.error(state.step0Data.errorMessage);
            pageManager.changePage(pageHistory.currentPage())
            return 1;
        }
        return 0;
    }
    afterSetup(){
        this.isSetUp = true;
    }
}