// #####################################################################################
// ########################## Wheatstone API Class #####################################
// #####################################################################################

class WheatstoneSolverAPI extends SolverInterface {
    init(){

    }

    reset() {

    }

    /**
     * @param {{R1:number,R2:number,R3:number,R4:number,Uq:number,Um:number}} v
     * @returns {Promise<WorkerResponse<PyodideAPIMap["equationIsValid"]["output"]>>}
     */
    equationIsValid(v) {
        return this.getDataPromise("equationIsValid", {
            R1: v.R1,
            R2: v.R2,
            R3: v.R3,
            R4: v.R4,
            Uq: v.Uq,
            Um: v.Um
        });
    }
}