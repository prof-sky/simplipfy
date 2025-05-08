// #####################################################################################
// ########################## Kirchhoff API Class ######################################
// #####################################################################################

class KirchhoffSolverAPI {
    constructor(worker) {
        this.worker = worker;
    }

    initKirchhoffSolver(circuitFile, circuitPath, paramMap) {
        return requestResponse(this.worker, {
            action: "initKirchhoffSolver",
            data: { circuitFile: circuitFile, circuitPath: circuitPath, paramMap: paramMap }
        });
    }

    resetKirchhoffSolver() {
        return requestResponse(this.worker, {
            action: "resetKirchhoffSolver",
            data: {}
        });
    }

    checkVoltageLoopRule(selectedElements) {
        return requestResponse(this.worker, {
            action: "checkVoltageLoopRule",
            selectedElements: selectedElements
        });
    }

    checkJunctionRule(selectedElements) {
        return requestResponse(this.worker, {
            action: "checkJunctionRule",
            selectedElements: selectedElements
        });
    }

    foundAllVoltEquations() {
        return requestResponse(this.worker, {
            action: "foundAllVoltEquations",
            data: {}
        });
    }

    async foundAllEquations() {
        let eqs = await state.kirchhoffSolverAPI.equations();
        // filter "-" out of the list
        let filteredEqs = eqs.filter(eq => eq !== "-");
        // get number of cpts from step0 data
        let cpts = state.step0Data.allComponents.length;
        // check if number of equations is equal to number of cpts
        if (filteredEqs.length < cpts) {
            return false;
        } else {
            return true;
        }
        // TODO !!!
        /*return requestResponse(this.worker, {
            action: "foundAllEquations",
            data: {}
        });*/
    }

    equations() {
        return requestResponse(this.worker, {
            action: "equations",
            data: {}
        });
    }
}
