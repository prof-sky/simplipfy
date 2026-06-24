// This file contains the HardcodedStepSolverAPI class, which is used to solve the quickstart circuits
// With this, the user doesn't have to wait for pyodide to load and can start solving circuits while
// the pyodide backend is still loading

// ###################################################################################
// #### IMPORTANT #### Has to implement the exact same functions as the StepSolverAPI
// ###################################################################################
class HardcodedStepSolverAPI extends SolverInterface{
    constructor() {
        const workerCode = `
        self.onmessage = (event) => {
            const id = event.data.id;
        
            self.postMessage({
                id,
                success: false,
                data: null,
                errors: ["HardcodedStepSolverAPI does not support messages"],
                warnings: []
            });
        };
        `;

        const blob = new Blob([workerCode], { type: "application/javascript" });
        const worker = new WorkerCommunication(URL.createObjectURL(blob))
        super(worker);
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
            let content = (await state.apis.pyodide.readFile(solutionsPath)).data;
            this.solutions = JSON.parse(content);
        } catch (error) {
            console.trace(error)
            console.error("Error fetching solutions file: " + error);
            UserMessage.error(error)
            this.solutions = null;
            pushErrorEventMatomo(errorActions.solutionsFileError, error);
        }
    }

    reset() {

    }

    /** @returns {WorkerResponse<StepObject>} */
    async createStep0() {
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }
            return new WorkerResponse(0, new StepObject(this.solutions["step0"]));
        } catch (error) {
            console.trace(error)
            console.error("Error creating Step0: " + error);
            UserMessage.error(error);
            pushErrorEventMatomo(errorActions.step0Error, "(hardcoded) " + error);
        }
    }

    /** @returns {WorkerResponse<StepObject>} */
    async getStep(step) {
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }
            return new WorkerResponse(0, new StepObject(this.solutions[step]));
        } catch (error) {
            console.trace(error)
            console.error("Error creating "+ step +" : " + error);
            UserMessage.error(error);
            pushErrorEventMatomo(errorActions.step0Error, "(hardcoded) " + error);
        }
    }

    /** @returns {WorkerResponse<StepObject>} */
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
            let emptyStep = new StepObject();
            let stepObj = new StepObject(this.solutions[mappedKey]);

            // console.log("Hardcoded simplifyNCpts called with relation:", relation);
            // console.log("StepObject relation is:", stepObj.componentsRelation);

            if (relation === "series" && stepObj.componentsRelation === "parallel") {
                UserEmojiMessage.warning(languageManager.currentLang.alerts.isNotSeries);
                pushCircuitEventMatomo(circuitActions.ErrIsNotSeries);
                emptyStep.simplifierState = "notSeries";
                return new WorkerResponse(0, emptyStep);
            }
            if (relation === "parallel" && stepObj.componentsRelation === "series"){
                UserEmojiMessage.warning(languageManager.currentLang.alerts.isNotParallel);
                pushCircuitEventMatomo(circuitActions.ErrIsNotParallel);
                emptyStep.simplifierState = "notParallel";
                return new WorkerResponse(0, emptyStep);
            }
            if (stepObj.componentsRelation === "undefined"){
                UserEmojiMessage.warning(languageManager.currentLang.alerts.canNotSimplify);
                pushCircuitEventMatomo(circuitActions.ErrCanNotSimpl);
                emptyStep.simplifierState = "undefined";
                return new WorkerResponse(0, emptyStep);
            }
            if (relation === stepObj.componentsRelation){
                return new WorkerResponse(0, stepObj);
            }

        } catch (error) {
            console.trace(error)
            console.error("Error simplifying NCpts: " + error);
            UserMessage.error(error);
            pushErrorEventMatomo(errorActions.simplifyNCptsError, "(hardcoded) " + error);
        }
    }

    /** @returns {WorkerResponse<boolean>} */
    async canSimplifyCpts(){
        let step = state.currentStep
        let svgContainer = pageManager.pages.stepwisePage.contentDiv.querySelectorAll(".svg-container")[step];
        return getElementsFromSvgContainer(svgContainer).length > 1;
    }
}