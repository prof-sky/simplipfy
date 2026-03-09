// This file contains the HardcodedStepSolverAPI class, which is used to solve the quickstart circuits
// With this, the user doesn't have to wait for pyodide to load and can start solving circuits while
// the pyodide backend is still loading

// ###################################################################################
// #### IMPORTANT #### Has to implement the exact same functions as the StepSolverAPI
// ###################################################################################
class HardcodedStepSolverAPI extends SolverInterface{
    constructor() {
        super(null);
    }

    set worker(worker) {
        throw new Error("Hardcoded step solver does not support an worker")
    }

    get worker() {
        throw new Error("Hardcoded step solver does not have an worker")
    }

    /** @param {CircuitMap} circuitMap */
    async init(circuitMap) {
        this.circuitFile = circuitMap.circuitFile;
        this.circuitPath = circuitMap.circuitPath;
        this.paramMap = circuitMap.paramMap;

        // Fetch the solutions file
        let langSuffix;
        let shortLangSymbol = languageManager.langSymbol;
        if (shortLangSymbol === window.definitions.shortLanguageSymbols.german) {
            langSuffix = "de";
        } else {
            langSuffix = "en";
        }
        this.solutionsFile = this.circuitFile.replace(".txt", `_solutions.${langSuffix}.json`);
        let solutionsPath = this.circuitPath + "/" + this.solutionsFile;
        try {
            let content = await state.apis.pyodide.readFile(solutionsPath);
            this.solutions = JSON.parse(content);
        } catch (error) {
            console.trace(error)
            console.error("Error fetching solutions file: " + error);
            showMessage(error, "error", false);
            this.solutions = null;
            pushErrorEventMatomo(errorActions.solutionsFileError, error);
        }
    }

    /** @returns {StepObject} */
    async createStep0() {
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }
            return new StepObject(this.solutions["step0"]);
        } catch (error) {
            console.trace(error)
            console.error("Error creating Step0: " + error);
            showMessage(error, "error", false);
            pushErrorEventMatomo(errorActions.step0Error, "(hardcoded) " + error);
        }
    }

    async getStep(step) {
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }
            return this.solutions[step];
        } catch (error) {
            console.trace(error)
            console.error("Error creating "+ step +" : " + error);
            showMessage(error, "error", false);
            pushErrorEventMatomo(errorActions.step0Error, "(hardcoded) " + error);
        }
    }

    /** @returns {StepObject} */
    async simplifyNCpts(selectedElements,relation) {
        // Returns a StepObject, see stepObject.js
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }

            let key = selectedElements.join(".");
            let mappedKey = this.solutions.map[key];
            let stepObj = this.solutions[mappedKey];

            // console.log("Hardcoded simplifyNCpts called with relation:", relation);
            // console.log("StepObject relation is:", stepObj.componentsRelation);

            if (relation === "series" && stepObj.componentsRelation === "parallel") {
                setTimeout(() =>
                        showMessage(languageManager.currentLang.alerts.isNotSeries, "warning")
                    , 0);
                pushCircuitEventMatomo(circuitActions.ErrIsNotSeries);
                let emptyStep = new StepObject();
                emptyStep.simplifierState = "notSeries";
                return emptyStep;
            }
            if (relation === "parallel" && stepObj.componentsRelation === "series"){
                setTimeout(() =>
                        showMessage(languageManager.currentLang.alerts.isNotParallel, "warning")
                    , 0);
                pushCircuitEventMatomo(circuitActions.ErrIsNotParallel);
                let emptyStep = new StepObject();
                emptyStep.simplifierState = "notParallel";
                return emptyStep;
            }
            if (stepObj.componentsRelation === "undefined"){
                setTimeout(() =>
                        showMessage(languageManager.currentLang.alerts.canNotSimplify, "warning")
                    , 0);
                pushCircuitEventMatomo(circuitActions.ErrCanNotSimpl);
                let emptyStep = new StepObject();
                emptyStep.simplifierState = "undefined";
                return emptyStep;
            }
            if (relation === stepObj.componentsRelation){
                return stepObj;
            }

        } catch (error) {
            console.trace(error)
            console.error("Error simplifying NCpts: " + error);
            showMessage(error, "error", false);
            pushErrorEventMatomo(errorActions.simplifyNCptsError, "(hardcoded) " + error);
        }
    }

    async canSimplifyCpts(){
        let step = state.currentStep
        let svgContainer = pageManager.pages.stepwisePage.contentDiv.querySelectorAll(".svg-container")[step];
        return getElementsFromSvgContainer(svgContainer).length > 1;
    }
}