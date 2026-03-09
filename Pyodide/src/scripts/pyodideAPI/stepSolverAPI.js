
// #####################################################################################
// ########################## StepSolver API Class #####################################
// #####################################################################################

class StepSolverAPI extends SolverInterface{
    /**
     * @param {CircuitMap} circuitMap
     * */
    async init(circuitMap) {
        return requestResponse(this.worker, {
            action: "initStepSolver",
            data: { circuitFile: circuitMap.circuitFile, circuitPath: circuitMap.circuitPath, paramMap: circuitMap.paramMap }
        });
    }

    async reset() {
        return requestResponse(this.worker, {
            action: "resetStepSolver",
            data: {}
        });
    }

    /** @returns {Promise<StepObject>} */
    async createStep0() {
        return requestResponse(this.worker, {
            action: "createStep0",
            data: {}
        });
    }

    async getStep(step) {
        // Returns a StepObject, see stepObject.js
        return requestResponse(this.worker, {
            action: "getStep",
            step: step,
            data: {}
        });
    }

    /** @returns {Promise<StepObject>} */
    async simplifyNCpts(selectedElements, relation) {
        // Returns a StepObject, see stepObject.js
        return requestResponse(this.worker, {
            action: "simplifyNCpts",
            selectedElements: selectedElements,
            relation: relation
        });
    }

    async canSimplifyCpts(){
        return requestResponse(this.worker, {
            action: "canSimplifyCpts",
        });
    }
}