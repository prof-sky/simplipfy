// #####################################################################################
// ########################## Magnetic API Class #####################################
// #####################################################################################

class MagneticSolverAPI extends SolverInterface {
    init(circuitMap) {
        if (!(circuitMap instanceof MagneticCircuitMap)) return Promise.resolve(new WorkerResponse(0, null, false, ["Not a valid circuit map for magnetic solver."]));

        return this.getDataPromise(
            "initMagneticSolver",
            { circuitFile: circuitMap.circuitFile, circuitPath: circuitMap.circuitPath, paramMap: circuitMap.paramMap }
        )
    }

    reset() {
        return this.getDataPromise(
            "resetMagneticSolver"
        );
    }

    checkTransformation(selectedElements) {
        return this.getDataPromise("checkTransformation", selectedElements);
    }

    transformedAllElements() {
        return this.getDataPromise("transformedAllElements");
    }

    /**
     * transforms the magnetic circuit into a netlist that can be used by lcapy.
     * @returns {Promise<WorkerResponse<PyodideAPIMap["lcapyNetlist"]["output"]>>}
     */
    lcapyNetlist() {
        return this.getDataPromise("lcapyNetlist");
    }
}