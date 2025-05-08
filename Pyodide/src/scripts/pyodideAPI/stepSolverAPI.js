
// #####################################################################################
// ########################## StepSolver API Class #####################################
// #####################################################################################

class StepSolverAPI {
    constructor(worker) {
        this.worker = worker;
    }

    initStepSolver(circuitFile, circuitPath, paramMap) {
        return requestResponse(this.worker, {
            action: "initStepSolver",
            data: { circuitFile: circuitFile, circuitPath: circuitPath, paramMap: paramMap }
        });
    }

    resetStepSolver() {
        return requestResponse(this.worker, {
            action: "resetStepSolver",
            data: {}
        });
    }

    createStep0() {
        // Returns a Step0Object, see stepObject.js
        return requestResponse(this.worker, {
            action: "createStep0",
            data: {}
        });
    }

    simplifyNCpts(selectedElements) {
        // Returns a StepObject, see stepObject.js
        return requestResponse(this.worker, {
            action: "simplifyNCpts",
            selectedElements: selectedElements
        });
    }
}