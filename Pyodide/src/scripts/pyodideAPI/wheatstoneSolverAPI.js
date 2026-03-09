// #####################################################################################
// ########################## Wheatstone API Class #####################################
// #####################################################################################

class WheatstoneSolverAPI extends SolverInterface{
    equationIsValid(v) {
        return requestResponse(this.worker, {
            action: "equationIsValid",
            data: { R1: v.R1, R2: v.R2, R3: v.R3, R4: v.R4, Uq: v.Uq, Um: v.Um }
        });
    }
}