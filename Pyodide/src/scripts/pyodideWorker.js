self.pyodide = null;
self.solveModule = null;
self.stepSolve = null;
self.kirchhoffSolver = null;
self.magneticTransformer = null;
self.svgGenerator = null;
self.drawingConfig = null;

/** @param {{
 * id: boolean,
 * data: T,
 * success: boolean
 * errors: string [],
 * warnings: string []
 * }} response */
function pm(response) {
    self.postMessage(response);
}

async function recursiveRmDir(path) {
    let entries = self.pyodide.FS.readdir(path).filter(name => name !== "." && name !== "..");
    for (let entry of entries) {
        let entryPath = path + "/" + entry;
        let stat = self.pyodide.FS.stat(entryPath);
        if (self.pyodide.FS.isDir(stat.mode)) {
            // Recursively delete the directory
            await recursiveRmDir(entryPath);
        } else {
            // Delete the file
            self.pyodide.FS.unlink(entryPath);
        }
    }
    // Finally, delete the directory itself
    self.pyodide.FS.rmdir(path);
}

function generalizeOptIsNotSet(optionsString) {
    if (optionsString !== null &&
        optionsString !== "" &&
        optionsString !== undefined) {
        return !optionsString.includes("--generalize");
    } else {
        return true; // If no options are set, generalize is not set
    }
}

/** @template {keyof PyodideAPIMap} I */
class HandlerReturn {
    /** @type {PyodideAPIMap[I]["output"]} */
    result;

    /** @type {boolean} */
    success;

    /** @type {string[]} */
    errors;

    /** @type {string[]} */
    warnings;

    /**
     * @template I {keyof PyodideAPIMap}
     * @param {PyodideAPIMap[I]["output"]} result
     * @param {boolean=true} success
     * @param {string[]} [errors=[]]
     * @param {string[]} [warnings=[]]
     */
    constructor(result,success = true, errors = [], warnings = []) {
        this.result = result;
        this.success = success;
        this.errors = errors;
        this.warnings = warnings;
    }
}

/**
 * @template {keyof PyodideAPIMap} K
 * @typedef {(data: PyodideAPIMap[K]["input"]) => Promise<HandlerReturn<PyodideAPIMap[K]["output"]>>} Handler
 */

/** @type {{ [K in keyof PyodideAPIMap]: Handler<K> }} */
const handlers = {

    // ================= Pyodide =================
    /** @returns {Promise<HandlerReturn<"unpackArchive">>} */
    unpackArchive: async (data) => {
        await self.pyodide.unpackArchive(data.buffer, data.extension, data.options);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"readdir">>} */
    readdir: async (data) => {
        return new HandlerReturn(self.pyodide.FS.readdir(data.path));
    },

    /** @returns {Promise<HandlerReturn<"unlink">>} */
    unlink: async (data) => {
        await self.pyodide.FS.unlink(data.path);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"pyimport">>} */
    pyimport: async (data) => {
        return new HandlerReturn(self.pyodide.pyimport(data.pythonModuleName));
    },

    /** @returns {Promise<HandlerReturn<"writeFile">>} */
    writeFile: async (data) => {
        self.pyodide.FS.writeFile(data.path, data.content, { encoding: data.encoding });
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"readFile">>} */
    readFile: async (data) => {
        return new HandlerReturn(self.pyodide.FS.readFile(data.path, { encoding: data.encoding }));
    },

    /** @returns {Promise<HandlerReturn<"exists">>} */
    exists: async (data) => {
        return new HandlerReturn(self.pyodide.FS.analyzePath(data.path).exists);
    },

    /** @returns {Promise<HandlerReturn<"rename">>} */
    rename: async (data) => {
        self.pyodide.FS.rename(data.from, data.to);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"runPython">>} */
    runPython: async (data) => {
        return new HandlerReturn(await self.pyodide.runPythonAsync(data.code));
    },

    /** @returns {Promise<HandlerReturn<"recursiveRmDir">>} */
    recursiveRmDir: async (data) => {
        await recursiveRmDir(data.path);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"mkdir">>} */
    mkdir: async (data) => {
        self.pyodide.FS.mkdir(data.path);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"pyodideReady">>} */
    pyodideReady: async (data) => {
        // this works because the pyodide ready promise is awaited before this code runs. if this call returns to the
        // caller before a timeout pyodide has to be ready after this call.
        return new HandlerReturn(true);
    },

    // ================= Solver Core =================
    /** @returns {Promise<HandlerReturn<"loadSolve">>} */
    loadSolve: async () => {
        self.solveModule = await self.pyodide.pyimport("simplipfyAPI");
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"isValidCircuitFile">>} */
    isValidCircuitFile: async (data) => {
        let validator = await self.solveModule.ValidateCircuitFile.callKwargs({
            fileName: data.circuitFile,
            filePath: data.circuitPath
        });
        let [isValid, errorMsgs, warnMsgs] = await validator.validate();
        return new HandlerReturn({ success: isValid, errors: errorMsgs, warnings: warnMsgs });
    },

    /** @returns {Promise<HandlerReturn<"isValidCircuitString">>} */
    isValidCircuitString: async (data) => {
        let validator = await self.solveModule.ValidateCircuitFile.callKwargs({
            fileStr: data.fileString
        });
        let [isValid, errorMsgs, warnMsgs] = await validator.validate();
        return new HandlerReturn({ success: isValid, errors: errorMsgs, warnings: warnMsgs });
    },

    /** @returns {Promise<HandlerReturn<"forceDrawing">>} */
    forceDrawing: async (data) => {
        if (!self.solveModule) {
            return new HandlerReturn({
                isValidSyntax: false,
                svgData: "<svg></svg>",
                errMsgs: ["Solver not loaded"],
                warnMsgs: []
            });
        }

        let validator = await self.solveModule.ValidateCircuitFile.callKwargs({
            fileStr: data.circuitString
        });

        const [_, errorMsgs, warnMsgs] = await validator.validate();
        const isValidSyntax = await validator.validSyntax;

        if (!isValidSyntax) {
            return new HandlerReturn({ isValidSyntax: false, svgData: "<svg></svg>", errMsgs: errorMsgs, warnMsgs: warnMsgs });
        }

        if (generalizeOptIsNotSet(data.optionsString) &&
            warnMsgs.includes("warning, drawing hint missing on line")) {
            return new HandlerReturn({ isValidSyntax: false, svgData: "<svg></svg>", errMsgs: errorMsgs, warnMsgs: warnMsgs });
        }

        const svgData = await self.solveModule.forceDrawing.callKwargs({
            netlist: data.circuitString,
            ls: data.paramMap,
            configOption: data.optionsString
        });

        return new HandlerReturn({ isValidSyntax: true, svgData: svgData, errMsgs: errorMsgs, warnMsgs: warnMsgs });
    },

    // ================= SVG Generator =================
    /** @returns {Promise<HandlerReturn<"initSVGGenerator">>} */
    initSVGGenerator: async (data) => {
        self.svgGenerator = await self.solveModule.SVGFileGenerator(data.path);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"getCircuitFiles">>} */
    getCircuitFiles: async () => {
        return new HandlerReturn((await self.svgGenerator.getFilteredFiles(['.txt', '.sch'])).toJs());
    },

    /** @returns {Promise<HandlerReturn<"generateSvgFile">>} */
    generateSvgFile: async (data) => {
        const ret = await self.svgGenerator.generateSVGFile(data.file);

        if (ret !== 0) {
            throw new Error("SVG generation failed: " + ret);
        }

        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"zipFiles">>} */
    zipFiles: async (data) => {
        await self.solveModule.zipFolder(data.path);
        return new HandlerReturn(true);
    },

    // ================= Drawing Config =================
    /** @returns {Promise<HandlerReturn<"lock">>} */
    lock: async (data) => {
        self.solveModule.drawingConfigInstance.lock(data.onStr);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"unlock">>} */
    unlock: async (data) => {
        self.solveModule.drawingConfigInstance.unlock(data.setTo);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"setToDefault">>} */
    setToDefault: async () => {
        self.solveModule.drawingConfigInstance.setToDefault();
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"setOptions">>} */
    setOptions: async (data) => {
        self.solveModule.drawingConfigInstance.setOptions(data.options);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"isLocked">>} */
    isLocked: async () => {
        return new HandlerReturn(self.solveModule.drawingConfigInstance.isLocked());
    },

    // ================= Step Solver =================
    /** @returns {Promise<HandlerReturn<"initStepSolver">>} */
    initStepSolver: async (data) => {
        self.stepSolve = await self.solveModule.SolveInUserOrder.callKwargs({
            filename: data.circuitFile,
            filePath: data.circuitPath,
            langSymbols: data.paramMap
        });
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"resetStepSolver">>} */
    resetStepSolver: async () => {
        self.stepSolve = null;
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"createStep0">>} */
    createStep0: async () => {
        return new HandlerReturn(await (self.stepSolve.createStep0()).toJs({ dict_converter: Object.fromEntries }));
    },

    /** @returns {Promise<HandlerReturn<"getStep">>} */
    getStep: async (data) => {
        return new HandlerReturn(await (self.stepSolve.getStep(data.step)).toJs({ dict_converter: Object.fromEntries }));
    },

    /** @returns {Promise<HandlerReturn<"simplifyNCpts">>} */
    simplifyNCpts: async (data) => {
        return new HandlerReturn(await (self.stepSolve
            .simplifyNCpts(data.selectedElements, data.relation))
            .toJs({ dict_converter: Object.fromEntries }));
    },

    /** @returns {Promise<HandlerReturn<"canSimplifyCpts">>} */
    canSimplifyCpts: async () => {
        const simplified = await self.stepSolve.isSimplified();
        return new HandlerReturn(!simplified);
    },

    // ================= Kirchhoff =================
    /** @returns {Promise<HandlerReturn<"initKirchhoffSolver">>} */
    initKirchhoffSolver: async (data) => {
        let stepSolver = await handlers["initStepSolver"](data); // Step solver is needed for kirchhoff solver, so we initialize it here as well
        if (!stepSolver.success) {
            return new HandlerReturn(false, false, ["Failed to initialize step solver, cannot initialize Kirchhoff solver"]);
        }

        self.kirchhoffSolver = await self.solveModule.KirchhoffSolver.callKwargs({
            circuitFileName: data.circuitFile,
            path: data.circuitPath,
            langSymbols: data.paramMap
        });
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"createStep0">>} */
    createKirchhoffStep0: async (data) => {
        return (await handlers["createStep0"](data));
    },

    /** @returns {Promise<HandlerReturn<"resetKirchhoffSolver">>} */
    resetKirchhoffSolver: async () => {
        self.stepSolve = null;
        self.kirchhoffSolver = null;
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"checkVoltageLoopRule">>} */
    checkVoltageLoopRule: async (data) => {
        return new HandlerReturn((await self.kirchhoffSolver
            .checkVoltageLoopRule(data.selectedElements))
            .toJs());
    },

    /** @returns {Promise<HandlerReturn<"checkJunctionRule">>} */
    checkJunctionRule: async (data) => {
        return new HandlerReturn((await self.kirchhoffSolver
            .checkJunctionRule(data.selectedElements))
            .toJs());
    },

    /** @returns {Promise<HandlerReturn<"foundAllVoltEquations">>} */
    foundAllVoltEquations: async () => {
        return new HandlerReturn(self.kirchhoffSolver.foundAllVoltEquations());
    },

    /** @returns {Promise<HandlerReturn<"foundAllEquations">>} */
    foundAllEquations: async () => {
        return new HandlerReturn(self.kirchhoffSolver.foundAllEquations());
    },

    /** @returns {Promise<HandlerReturn<"equations">>} */
    equations: async () => {
        return new HandlerReturn((await self.kirchhoffSolver.equations()).toJs());
    },

    /** @returns {Promise<HandlerReturn<"equationsURI">>} */
    equationsURI: async () => {
        return new HandlerReturn((await self.kirchhoffSolver.equationsURI()).toJs());
    },

    /** @returns {Promise<HandlerReturn<"currEquations">>} */
    currEquations: async () => {
        return new HandlerReturn((await self.kirchhoffSolver.currEqs).toJs());
    },

    /** @returns {Promise<HandlerReturn<"voltEquationsURI">>} */
    voltEquationsURI: async () => {
        return new HandlerReturn((await self.kirchhoffSolver.voltEqsURI).toJs());
    },

    // ================= Wheatstone =================
    /** @returns {Promise<HandlerReturn<"equationIsValid">>} */
    equationIsValid: async (data) => {
        return new HandlerReturn(self.solveModule.WheatstoneBridgeSolver.callKwargs(data));
    },

    //  ================= Magnetic API =================
    /** @returns {Promise<HandlerReturn<"initMagneticSolver">>} */
    initMagneticSolver: async (data) => {
        let kwargs = {
            circuitFileName: data.magneticCircuitFile,
            path: data.magneticCircuitPath,
            langSymbols: data.paramMap
        };
        self.magneticTransformer = await self.solveModule.MagneticTransformer.callKwargs(kwargs);
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"resetMagneticSolver">>} */
    resetMagneticSolver: async (data) => {
        self.magneticTransformer = null;
        return new HandlerReturn(true);
    },

    /** @returns {Promise<HandlerReturn<"checkTransformation">>} */
    checkTransformation: async (data) => {
        const [errorCode, eq] = (await self.magneticTransformer.check_transformation(data.selectedElements).toJs());
        return new HandlerReturn({ errorCode: errorCode, equation: eq });
    },

    /** @returns {Promise<HandlerReturn<"transformedAllElements">>} */
    transformedAllElements: async (data) => {
        return new HandlerReturn(self.magneticTransformer.transformed_all_elements());
    },

    /** @returns {Promise<HandlerReturn<"lcapyNetlist">>} */
    lcapyNetlist: async (data) => {
        return new HandlerReturn((await self.magneticTransformer.el_netlist()).toJs());
    },
};

/** @returns {HandlerReturn} */
const onHandlerError = {
    /** * @param {Error} error */
    default: (error) => {return new HandlerReturn(null, [error.stack]);},
}

if( 'function' === typeof importScripts) {

    importScripts("../../pyodide.js");

    self.pyodideReadyPromise = loadPyodide();
    self.onmessage = async (event) => {

        self.pyodide = await self.pyodideReadyPromise;
        const _id = event.data.id;
        const input = event.data

        try {
            const handler = handlers[input.action];
            if (!handler) {
                pm({
                    id: _id,
                    data: null,
                    success: false,
                    errors: [`Unknown action: ${input.action}`],
                    warnings: []
                });
                return;
            }

            /** @type {HandlerReturn} */
            let data = await handler(input.data);
            pm({
                id: _id,
                data: data.result,
                success: true,
                errors: data.errors,
                warnings: data.warnings
            });
        }
        catch (error) {
            console.error("Worker Error (backend):\n", error);
            let data = onHandlerError[input.action] ? onHandlerError[input.action](error) : onHandlerError.default(error);

            if(!self.solveModule){
                data.errors.push("Backend not initialized, solveModule is null or undefined. " +
                    "This likely means that the loadSolve action has not been called yet.");
            }

            pm({
                id: _id,
                data: data.result,
                success: false,
                errors: data.errors,
                warnings: data.warnings
            });
        }
    }
}
