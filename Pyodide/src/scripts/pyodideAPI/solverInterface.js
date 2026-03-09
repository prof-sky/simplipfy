// this should be treated as an abstract class. Each Solver has to implement those functions.
// add the files of classes that derive from this class to .bundleLast from this directory
/**
 * @interface
 * interface for solver objects
 */
class SolverInterface {
    /** @type {Worker | null} */
    worker;

    constructor(worker) {
        this.worker = worker;
    }

    init(){

    }

    reset(){

    }
}