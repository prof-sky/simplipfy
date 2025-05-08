// This file contains the HardcodedStepSolverAPI class, which is used to solve the quickstart circuits
// With this, the user doesn't have to wait for pyodide to load and can start solving circuits while
// the pyodide backend is still loading

// ###################################################################################
// #### IMPORTANT #### Has to implement the exact same functions as the StepSolverAPI
// ###################################################################################
class HardcodedStepSolverAPI {
    constructor() {}

    async initStepSolver(circuitFile, circuitPath, paramMap) {
        this.circuitFile = circuitFile;
        this.circuitPath = circuitPath;
        this.paramMap = paramMap;

        // Fetch the solutions file
        let langSuffix;
        if (languageManager.currentLang === english) {
            langSuffix = "en";
        } else {
            langSuffix = "de";
        }
        this.solutionsFile = this.circuitFile.replace(".txt", `_solutions.${langSuffix}.json`);
        let solutionsPath = this.circuitPath + "/" + this.solutionsFile;
        try {
            let content = await state.pyodideAPI.readFile(solutionsPath);
            this.solutions = JSON.parse(content);
        } catch (error) {
            console.error("Error fetching solutions file: " + error);
            showMessage(error, "error", false);
            this.solutions = null;
            pushErrorEventMatomo(errorActions.solutionsFileError, error);
        }
    }

    resetStepSolver() {
        // This is a hardcoded solution, so we don't need to reset anything
    }

    async createStep0() {
        // Returns a Step0Object, see stepObject.js
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }
            return this.solutions["step0"];
        } catch (error) {
            console.error("Error creating Step0: " + error);
            showMessage(error, "error", false);
            pushErrorEventMatomo(errorActions.step0Error, "(hardcoded) " + error);
        }
    }

    simplifyNCpts(selectedElements) {
        // Returns a StepObject, see stepObject.js
        // StepSolverAPI returns a Promise, but if the function is called with await, and we only return
        // an object instead of promise it will be automatically wrapped in a promise, so nothing to do
        try {
            if (this.solutions === null) {
                throw new Error("Solutions file not available");
            }
            let key = selectedElements.join(".");
            let mappedKey = this.solutions.map[key];
            return this.solutions[mappedKey];
        } catch (error) {
            console.error("Error simplifying NCpts: " + error);
            showMessage(error, "error", false);
            pushErrorEventMatomo(errorActions.simplifyNCptsError, "(hardcoded) " + error);
        }
    }
}