// #####################################################################################
// ########################## Kirchhoff API Class ######################################
// #####################################################################################

class KirchhoffSolverAPI extends SolverInterface {
    /**
     * @param {CircuitMap} circuitMap
     * */
    init(circuitMap) {
        return requestResponse(this.worker, {
            action: "initKirchhoffSolver",
            data: { circuitFile: circuitMap.circuitFile, circuitPath: circuitMap.circuitPath, paramMap: circuitMap.paramMap },
        });
    }

    reset() {
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
        let eqs = await state.solvers.kirchhoff.equations();
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

    /**
     * Returns the equations from equations() but U is replaced with R*I
     */
    equationsURI() {
        return requestResponse(this.worker, {
            action: "equationsURI",
            data: {}
        });
    }

    currEquations(){
        return requestResponse(this.worker, {
            action: "currEquations",
            data: {}
        });
    }

    voltEquationsURI(){
        return requestResponse(this.worker, {
            action: "voltEquationsURI",
            data: {}
        });
    }
}
