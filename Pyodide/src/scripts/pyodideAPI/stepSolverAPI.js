// #####################################################################################
// ########################## StepSolver API Class #####################################
// #####################################################################################

class StepSolverAPI extends SolverInterface {

    /**
     * @param {CircuitMap} circuitMap
     * @returns {Promise<WorkerResponse<PyodideAPIMap["initStepSolver"]["output"]>>}
     */

    async init(circuitMap) {
        return this.getDataPromise("initStepSolver", {
            circuitFile: circuitMap.circuitFile,
            circuitPath: circuitMap.circuitPath,
            paramMap: circuitMap.paramMap
        });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["resetStepSolver"]["output"]>>} */
    async reset() {
        return this.getDataPromise("resetStepSolver");
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["createStep0"]["output"]>>} */
    async createStep0() {
        let res = await this.getDataPromise("createStep0");
        return new WorkerResponse(
            res.id,
            new StepObject(res.data),
            res.success,
            res.errors,
            res.warnings
        );
    }

    /**
     * @param {string} step
     * @returns {Promise<WorkerResponse<PyodideAPIMap["getStep"]["output"]>>}
     */
    async getStep(step) {
        let res = await this.getDataPromise("getStep", { step });
        return new WorkerResponse(
            res.id,
            new StepObject(res.data),
            res.success,
            res.errors,
            res.warnings
        );
    }

    /**
     * @param {string[]} selectedElements
     * @param {string} relation
     * @returns {Promise<WorkerResponse<PyodideAPIMap["simplifyNCpts"]["output"]>>}
     */
    async simplifyNCpts(selectedElements, relation) {
        let res = await this.getDataPromise("simplifyNCpts", {
            selectedElements,
            relation
        });
        return new WorkerResponse(
            res.id,
            new StepObject(res.data),
            res.success,
            res.errors,
            res.warnings
        )
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["canSimplifyCpts"]["output"]>>} */
    async canSimplifyCpts() {
        return this.getDataPromise("canSimplifyCpts");
    }
}