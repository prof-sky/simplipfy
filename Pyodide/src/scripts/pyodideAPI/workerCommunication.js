
// #####################################################################################
// ########################## Functions for API Calls ##################################
// #####################################################################################
/**
 * @typedef {Object} PyodideAPIMap
 *
 * // ================= Pyodide =================
 * @property {{input: {buffer: ArrayBuffer, extension: string, options: Object}, output: boolean}} unpackArchive
 * @property {{input: {path: string}, output: string[]}} readdir
 * @property {{input: {path: string}, output: boolean}} unlink
 * @property {{input: {pythonModuleName: string}, output: boolean}} pyimport
 * @property {{input: {path: string, content: string, encoding: string}, output: boolean}} writeFile
 * @property {{input: {path: string, encoding: string}, output: string}} readFile
 * @property {{input: {path: string}, output: boolean}} exists
 * @property {{input: {from: string, to: string}, output: boolean}} rename
 * @property {{input: {code: string}, output: boolean}} runPython
 * @property {{input: {path: string}, output: boolean}} recursiveRmDir
 * @property {{input: {path: string}, output: boolean}} mkdir
 * @property {{input: {}, output: boolean}} pyodideReady
 *
 * // ================= Solver Core =================
 * @property {{input: {}, output: boolean}} loadSolve
 * @property {{input: {circuitFile: string, circuitPath: string}, output: {isValid: boolean, errors: string, warnings: string}}} isValidCircuitFile
 * @property {{input: {fileString: string}, output: {isValid: boolean, errors: string, warnings: string}}} isValidCircuitString
 * @property {{input: {circuitString: string, paramMap: Object, optionsString: string}, output: {
 *     isValidSyntax: boolean,
 *     svgData: string,
 *     errMsgs: string,
 *     warnMsgs: string
 * }}} forceDrawing
 *
 * // ================= SVG Generator =================
 * @property {{input: {path: string}, output: boolean}} initSVGGenerator
 * @property {{input: {}, output: string[]}} getCircuitFiles
 * @property {{input: {file: string}, output: boolean}} generateSvgFile
 * @property {{input: {path: string}, output: boolean}} zipFiles
 *
 * // ================= Drawing Config =================
 * @property {{input: {onStr: string}, output: boolean}} lock
 * @property {{input: {setTo: string}, output: boolean}} unlock
 * @property {{input: {}, output: boolean}} setToDefault
 * @property {{input: {options: Object}, output: boolean}} setOptions
 * @property {{input: {}, output: boolean}} isLocked
 *
 * // ================= Step Solver =================
 * @property {{input: {circuitFile: string, circuitPath: string, paramMap: Object}, output: boolean}} initStepSolver
 * @property {{input: {}, output: boolean}} resetStepSolver
 * @property {{input: {}, output: StepObject}} createStep0
 * @property {{input: {step: string}, output: StepObject}} getStep
 * @property {{input: {selectedElements: string[], relation: string}, output: Object}} simplifyNCpts
 * @property {{input: {}, output: boolean}} canSimplifyCpts
 *
 * // ================= Kirchhoff =================
 * @property {{input: {circuitFile: string, circuitPath: string, paramMap: Object}, output: boolean}} initKirchhoffSolver
 * @property {{input: {}, output: boolean}} resetKirchhoffSolver
 * @property {{input: {}, output: StepObject}} createKirchhoffStep0
 * @property {{input: {selectedElements: string[]}, output: [number, string]}} checkVoltageLoopRule
 * @property {{input: {selectedElements: string[]}, output: [number, string[]]}} checkJunctionRule
 * @property {{input: {}, output: boolean}} foundAllVoltEquations
 * @property {{input: {}, output: boolean}} foundAllEquations
 * @property {{input: {}, output: string[]}} equations
 * @property {{input: {}, output: string[]}} equationsURI
 * @property {{input: {}, output: string[]}} currEquations
 * @property {{input: {}, output: string[]}} voltEquationsURI
 *
 * // ================= Wheatstone =================
 * @property {{input: {R1: number, R2: number, R3: number, R4: number, Uq: number, Um: number}, output: boolean}} equationIsValid
 *
 * // ================= Magnetic API =================
 * @property {{input: {magneticCircuitFile: string, magneticCircuitPath: string, paramMap: Object}, output: boolean}} initMagneticSolver
 * @property {{input: {}, output: boolean}} resetMagneticSolver
 * @property {{input: {selectedElements: string[]}, output: {errorCode: number, equation: string}}} checkTransformation
 * @property {{input: {}, output: boolean}} transformedAllElements
 * @property {{input: {}, output: string[]}} lcapyNetlist
 */

/**
 * @template T
 */
class WorkerResponse {
    /** @type {number} */
    id;

    /** @type {T} */
    data;

    /** @type {boolean} */
    success;

    /** @type {string[]} */
    errors = [];

    /** @type {string[]} */
    warnings = [];

    /**
     * @template T
     * @param {number} id
     * @param {T} data
     * @param {boolean} [success=true]
     * @param {string[]} [errors=[]]
     * @param {string[]} [warnings=[]]
     */
    constructor(id, data, success = true, errors = [], warnings = []) {
        this.id = id;
        this.data = data;
        this.success = success;
        this.errors = errors ?? [];
        this.warnings = warnings ?? [];
    }

    /** @param {string} error */
    addError(error) {
        this.errors.push(error);
    }

    /** @param {string} warning */
    addWarning(warning) {
        this.warnings.push(warning);
    }

    /** @returns {string} */
    get errorMsg() {
        return this.errors.map(s => s.replace(/\n+$/, "")).join("\n");
    }

    /** @returns {string} */
    get warningMsg() {
        return this.warnings.map(s => s.replace(/\n+$/, "")).join("\n");
    }

    /** @returns {T} */
    unwrap() {
        if (!this.success) {
            throw new Error(this.errorMsg || "Worker error");
        }
        return this.data;
    }

    /**
     * @template T
     * @param {{
     *   id: number,
     *   data: T,
     *   success: boolean,
     *   errors?: string[],
     *   warnings?: string[]
     * }} raw */
    static from(raw) {
        return new WorkerResponse(
            raw.id,
            raw.data,
            raw.success,
            raw.errors,
            raw.warnings);
    }
}

class TimeOutResponse extends WorkerResponse {
    constructor(id, action) {
        super(id, null, false, ["Worker timeout for action: " + action], []);
    }
}

class NoDataResponse extends WorkerResponse {
    constructor(id, action) {
        super(id, null, false, ["No data received from worker for action: " + action], []);
    }
}

/**
 * @template T
 */
class WorkerRequest {
    static #lastID = 1;

    static get msgID() {
        WorkerRequest.#lastID ++;
        return WorkerRequest.#lastID;
    }

    /**
     * @template {keyof PyodideAPIMap} T
     * @param {T} action
     * @param {PyodideAPIMap[T]["input"]} data
     * @param timeout {number} timeout in ms
     */
    constructor(action, data, timeout) {
        this.id = WorkerRequest.msgID;
        this.action = action;
        this.data = data;
        this.timeout = timeout;
    }

    /** @type {number} */
    id;
    /** @type {T} */
    action;
    /** @type {PyodideAPIMap[T]["input"]} */
    data;
    /** @type {number} */
    timeout;
}

/** @typedef WorkerMessage
 * @property {number} id
 * @property {keyof PyodideAPIMap} action
 * @property {PyodideAPIMap[keyof PyodideAPIMap]["input"]} data
 */

class ActiveRequest {
    /** @type {WorkerRequest} */
    request;
    /** @type {number} */
    timeout;

    /**
     * Combines the data of a request that is needed for resolving and cleanup. Creating this Object starts the timeout
     * for the request.
     * @param request {WorkerRequest}
     * @param resolve {Function}
     * @param timeout {number}
     */
    constructor(request, resolve, timeout) {
        this.request = request;
        this.resolve = resolve;
        this.timeout = timeout;
    }

    clearTimeout() {
        clearTimeout(this.timeout);
    }

    /** @return {WorkerMessage} */
    get message(){
        return {
            id: this.request.id,
            action: this.request.action,
            data: this.request.data
        }
    }
}

class WorkerCommunication {
    /** @type {Worker} */
    worker;
    /** @type {Map<number, ActiveRequest>} */
    pendingRequests = new Map();

    /** @type {Map<number, WorkerRequest>} */
    timedOutRequests = new Map();

    /**
     * @param {string} workerFilePath
     * */
    constructor(workerFilePath) {
        this.worker = new Worker(workerFilePath);
        if (!this.worker) return;
        this.worker.addEventListener("message", async (e) => this.onMessageCallback(e))
    }

    onMessageCallback(event){
        if (!event.data?.id) return;

        const entry = this.pendingRequests.get(event.data.id);
        if (!entry) return;

        this.pendingRequests.delete(event.data.id);

        entry.clearTimeout();
        const receivedData = event.data;

        // optional: handle transport-level errors
        if (!receivedData) {
            entry.resolve(new NoDataResponse(entry.request.id, entry.request.action));
            return;
        }

        const res = WorkerResponse.from(receivedData);
        entry.resolve(res);
    }

    /**
     * !! Only use WorkerRequest class plain object is only for type hints !!
     * @template {keyof PyodideAPIMap} K
     * @param {WorkerRequest | {id: number, action: K, data: PyodideAPIMap[K]["input"] }} request
     * @returns {Promise<WorkerResponse<PyodideAPIMap[K]["output"]>>}
     */
    requestResponse(request){
        return new Promise((resolve) => {

            let timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.pendingRequests.delete(request.id);
                this.timedOutRequests.set(request.id, request);
                resolve(new TimeOutResponse(request.id, request.action));
            }, request.timeout);

            let activeRequest = new ActiveRequest(request, resolve, timeout);
            this.pendingRequests.set(request.id, activeRequest);

            this.postMessage(activeRequest.message);
        });
    }

    /**
     * @template {keyof PyodideAPIMap} K
     * @param method {K}
     * @param data {PyodideAPIMap[K]["input"]}
     * @param [timeout=conf.worker.request.timeout] {number} timeout in ms
     * */
    getDataPromise(method, data = {}, timeout = conf.worker.request.timeout){
        return this.requestResponse(new WorkerRequest(method, data, timeout));
    }


    /**
     * @template K {keyof PyodideAPIMap}
     * @param {WorkerMessage} request */
    postMessage(request) {
        this.worker.postMessage(request);
    }
}

class APIBase {
    /** @param {WorkerCommunication} worker */
    constructor(worker) {
        this.worker = worker;
    }

    /**
     * !! Only use WorkerRequest class plain object is only for type hints !!
     * @template {keyof PyodideAPIMap} K
     * @param {WorkerRequest | {id: number, action: K, data: PyodideAPIMap[K]["input"] }} request
     * @returns {Promise<WorkerResponse<PyodideAPIMap[K]["output"]>>}
     */
    requestResponse(request){
        return this.worker.requestResponse(request);
    }

    /** @template {keyof PyodideAPIMap} K
     *
     * @param method {K}
     * @param data {PyodideAPIMap[K]["input"]}
     * @param [timeout=conf.worker.request.timeout] {number}
     * @return {Promise<WorkerResponse<PyodideAPIMap[K]["output"]>>}
     */
    getDataPromise(method, data = {}, timeout = conf.worker.request.timeout) {
        return this.worker.getDataPromise(method, data, timeout);
    }
}
