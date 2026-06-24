// #####################################################################################
// ########################## Kirchhoff API Class ######################################
// #####################################################################################

class KirchhoffSolverAPI extends SolverInterface {

    /**
     * @param {CircuitMap} circuitMap
     * @returns {Promise<WorkerResponse<PyodideAPIMap["initKirchhoffSolver"]["output"]>>}
     */
    init(circuitMap) {
        return this.getDataPromise("initKirchhoffSolver", {
            circuitFile: circuitMap.circuitFile,
            circuitPath: circuitMap.circuitPath,
            paramMap: circuitMap.paramMap
        });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["resetKirchhoffSolver"]["output"]>>} */
    reset() {
        return this.getDataPromise("resetKirchhoffSolver");
    }

    createStep0() {
        return this.getDataPromise("createKirchhoffStep0");
    }

    /**
     * @param {string[]} selectedElements
     * @returns {Promise<WorkerResponse<PyodideAPIMap["checkVoltageLoopRule"]["output"]>>}
     */
    checkVoltageLoopRule(selectedElements) {
        return this.getDataPromise("checkVoltageLoopRule", { selectedElements });
    }

    /**
     * @param {string[]} selectedElements
     * @returns {Promise<WorkerResponse<PyodideAPIMap["checkJunctionRule"]["output"]>>}
     */
    checkJunctionRule(selectedElements) {
        return this.getDataPromise("checkJunctionRule", { selectedElements });
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["foundAllVoltEquations"]["output"]>>} */
    foundAllVoltEquations() {
        return this.getDataPromise("foundAllVoltEquations", {});
    }

    // untouched (local logic)
    async foundAllEquations() {
        let eqs = (await state.solvers.kirchhoff.equations()).data;
        let filteredEqs = eqs.filter(eq => eq !== "-");
        let cpts = state.step0Data.allComponents.length;

        return new WorkerResponse(0, filteredEqs.length >= cpts);
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["equations"]["output"]>>} */
    equations() {
        return this.getDataPromise("equations");
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["equationsURI"]["output"]>>} */
    equationsURI() {
        return this.getDataPromise("equationsURI");
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["currEquations"]["output"]>>} */
    currEquations() {
        return this.getDataPromise("currEquations");
    }

    /** @returns {Promise<WorkerResponse<PyodideAPIMap["voltEquationsURI"]["output"]>>} */
    voltEquationsURI() {
        return this.getDataPromise("voltEquationsURI");
    }
}