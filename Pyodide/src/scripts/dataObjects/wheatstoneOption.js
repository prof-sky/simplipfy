/**
 * Object represents a Wheatstone option. From this object a wheatstone task is generated and can be solved.
 */
class WheatstoneOption {
    R1 = "?";
    R2 = "?";
    R3 = "?";
    R4 = "?";
    Uq = "?";
    Um = "?";

    /**
     *
     * @param option {Object} object with keys that are a subset of ["R1", "R2", "R3", "R4", "Uq", "Um"]. To be a valid
     * option there has to only exist one solution otherwise backend will fail. E.g. if R1 and R2 are missing there are
     * infinitely many solutions for R1 and R2.
     */
    constructor(option) {
        for (let key of Object.keys(option)){
            this[key] = option[key];
        }
    }
}