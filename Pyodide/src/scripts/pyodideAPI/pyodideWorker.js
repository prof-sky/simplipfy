self.pyodide = null;
self.solveModule = null;
self.stepSolve = null;
self.kirchhoffSolver = null;
self.svgGenerator = null;
self.drawingConfig = null;

if( 'function' === typeof importScripts) {

    async function recursiveRmdir(path) {
        let entries = self.pyodide.FS.readdir(path).filter(name => name !== "." && name !== "..");
        for (let entry of entries) {
            let entryPath = path + "/" + entry;
            let stat = self.pyodide.FS.stat(entryPath);
            if (self.pyodide.FS.isDir(stat.mode)) {
                // Recursively delete the directory
                await recursiveRmdir(entryPath);
            } else {
                // Delete the file
                self.pyodide.FS.unlink(entryPath);
            }
        }
        // Finally, delete the directory itself
        self.pyodide.FS.rmdir(path);
    }

    importScripts("../../../pyodide.js");

    self.pyodideReadyPromise = loadPyodide();
    self.onmessage = async (event) => {
        let _id = event.data.id;

        try {
            // Make sure pyodide and micropip is loaded before doing anything else
            self.pyodide = await self.pyodideReadyPromise;

            // ###################### Pyodide API ########################
            if (event.data.action === "unpackArchive") {
                await self.pyodide.unpackArchive(event.data.data.buffer, event.data.data.extension, event.data.data.options);
                self.postMessage({id: _id});
            } else if (event.data.action === "readdir") {
                try {
                    const files = self.pyodide.FS.readdir(event.data.data.path);
                    self.postMessage({status: "ok", files: files, id: _id});
                } catch (error) {
                    self.postMessage({status: "error", files: null, id: _id});
                }
            } else if (event.data.action === "unlink") {
                await self.pyodide.FS.unlink(event.data.data.path);
                self.postMessage({id: _id});
            } else if (event.data.action === "pyimport") {
                const importedModule = await self.pyodide.pyimport(event.data.data.module);
                self.postMessage({module: importedModule, id: _id});
            } else if (event.data.action === "writeFile") {
                self.pyodide.FS.writeFile(event.data.data.path, event.data.data.content, {encoding: event.data.data.encoding});
                self.postMessage({id: _id});
            } else if (event.data.action === "readFile") {
                const file = self.pyodide.FS.readFile(event.data.data.path, {encoding: event.data.data.encoding});
                self.postMessage({file: file, id: _id});
            } else if (event.data.action === "runPython") {
                //await self.pyodide.loadPackagesFromImports(event.data.data.code);
                const result = await self.pyodide.runPythonAsync(event.data.data.code);
                self.postMessage({result: result, id: _id});
            } else if (event.data.action === "loadSolve") {
                // ToDo use the name from the config file
                self.solveModule = await self.pyodide.pyimport("simplipfyAPI");
                self.postMessage({id: _id});
            } else if (event.data.action === "recursiveRmdir") {
                await recursiveRmdir(event.data.data.path);
                self.postMessage({id: _id});
            } else if (event.data.action === "mkdir") {
                self.pyodide.FS.mkdir(event.data.data.path);
                self.postMessage({id: _id});
            } else if (event.data.action === "isValidCircuitFile") {
                let kwargs = {
                    fileName: event.data.data.circuitFile,
                    filePath: event.data.data.circuitPath,
                }
                let fileValidator = await self.solveModule.ValidateCircuitFile.callKwargs(kwargs);
                const [isValid, errorMsgs, warnMsgs] = await fileValidator.validate();
                self.postMessage({isValid: isValid, errorMsgs: errorMsgs, warnMsgs: warnMsgs, id: _id});
            } else if (event.data.action === "isValidCircuitString") {
                let kwargs = {
                    fileStr: event.data.data.fileString
                }
                let fileValidator = await self.solveModule.ValidateCircuitFile.callKwargs(kwargs);
                const [isValid, errorMsgs, warnMsgs] = await fileValidator.validate();
                self.postMessage({isValid: isValid, errorMsgs: errorMsgs, warnMsgs: warnMsgs, id: _id});
            } else if (event.data.action === "forceDrawing") {
                // Do nothing while solve is not loaded
                if (self.solveModule === null) {
                    self.postMessage({id: _id});
                    return;
                }
                // Check if syntax is ok, then draw
                // Use fileValidator.validSyntax instead of isValid from validate() to overwrite semantic errors,
                // still draw if semantic errors occur, only break on syntax errors
                let fileValidator = await self.solveModule.ValidateCircuitFile.callKwargs({fileStr: event.data.data.circuitString});
                const [_, errorMsgs, warnMsgs] = await fileValidator.validate();
                let isValidSyntax = await fileValidator.validSyntax;
                // Return if syntax is not valid or if there is a drawing hint missing (because without --generalize, drawing is not possible)
                if (!isValidSyntax) {
                    self.postMessage({isValidSyntax: false, svgData: "", errMsgs: errorMsgs, warnMsgs: warnMsgs, id: _id});
                    return;
                }

                // If generalize is not active and there are warnings, don't draw.
                // If generalize is active, drawing without drawing hints is possible
                if (generalizeOptIsNotSet(event) && warnMsgs.includes("warning, drawing hint missing on line")) {
                        self.postMessage({
                            isValidSyntax: false,
                            svgData: "",
                            errMsgs: errorMsgs,
                            warnMsgs: warnMsgs,
                            id: _id
                        });
                        return;
                }

                // Draw the circuit
                let kwargsDrawing = {
                    netlist: event.data.data.circuitString,
                    ls: event.data.data.paramMap,
                    configOption: event.data.data.optionsString
                }
                let svgData = await self.solveModule.forceDrawing.callKwargs(kwargsDrawing);
                self.postMessage({isValidSyntax: true, svgData: svgData, errMsgs: errorMsgs, warnMsgs: warnMsgs,  id: _id});
            }
            // ###################### SVG Generator API ########################
            else if (event.data.action === "initSVGGenerator") {
                self.svgGenerator = await self.solveModule.SVGFileGenerator(event.data.data.path);
                self.postMessage({id: _id});
            } else if (event.data.action === "getCircuitFiles") {
                const files = await self.svgGenerator.getFilteredFiles(['.txt', '.sch']).toJs(); // TODO!! document this
                self.postMessage({files: files, id: _id});
            } else if (event.data.action === "generateSvgFile") {
                const ret = await self.svgGenerator.generateSVGFile(event.data.data.file);
                if (ret !== 0) {
                    self.postMessage({status: "error", error: ret, id: _id});
                    return;
                }
                self.postMessage({id: _id});
            } else if (event.data.action === "zipFiles") {
                await self.solveModule.zipFolder(event.data.data.path);
                self.postMessage({id: _id});
            }
            // ###################### Drawing Config API ####################
            else if (event.data.action === "lock") {
                let on = event.data.data.onStr;
                console.log("locking on " + on);
                self.solveModule.drawingConfigInstance.lock(on);
                self.postMessage({id: _id});
            } else if (event.data.action === "unlock") {
                let setTo = event.data.data.setTo;
                self.solveModule.drawingConfigInstance.unlock(setTo);
                self.postMessage({id: _id});
            } else if (event.data.action === "setToDefault") {
                console.log("set drawing config to default");
                self.solveModule.drawingConfigInstance.setToDefault();
                self.postMessage({id: _id});
            } else if (event.data.action === "setOptions") {
                let options = event.data.data.options;
                self.solveModule.drawingConfigInstance.setOptions(options);
                self.postMessage({id: _id});
            } else if (event.data.action === "isLocked") {
                const isLocked = self.solveModule.drawingConfigInstance.isLocked();
                self.postMessage({isLocked: isLocked, id: _id});
            }
            // ###################### Simplifier API ########################
            else if (event.data.action === "initStepSolver") {
                let kwargs = {
                    filename: event.data.data.circuitFile,
                    filePath: event.data.data.circuitPath,
                    langSymbols: event.data.data.paramMap};
                self.stepSolve = await self.solveModule.SolveInUserOrder.callKwargs(kwargs);
                self.postMessage({id: _id});
            } else if (event.data.action === "resetStepSolver") {
                self.stepSolve = null;
                self.postMessage({id: _id, message: "reset"});
            }
            else if (event.data.action === "createStep0") {
                const step0 = await self.stepSolve.createStep0().toJs({dict_converter: Object.fromEntries});
                self.postMessage({step0: step0, id: _id});
            } else if (event.data.action === "simplifyNCpts") {
                const simplified = await self.stepSolve.simplifyNCpts(event.data.selectedElements).toJs({dict_converter: Object.fromEntries});
                self.postMessage({simplifiedStep: simplified, id: _id});
            }
            // ###################### Kirchhoff API ########################
            else if (event.data.action === "initKirchhoffSolver") {
                let kwargs = {
                    circuitFileName: event.data.data.circuitFile,
                    path: event.data.data.circuitPath,
                    langSymbols: event.data.data.paramMap
                };
                self.kirchhoffSolver = await self.solveModule.KirchhoffSolver.callKwargs(kwargs);
                self.postMessage({id: _id});
            } else if (event.data.action === "resetKirchhoffSolver") {
                self.kirchhoffSolver = null;
                self.postMessage({id: _id, message: "reset"});
            }
            else if (event.data.action === "checkVoltageLoopRule") {
                const [errorCode, eq] = await self.kirchhoffSolver.checkVoltageLoopRule(event.data.selectedElements).toJs();
                self.postMessage({errorCode: errorCode, eq: eq, id: _id});
            } else if (event.data.action === "checkJunctionRule") {
                const [errorCode, eqs] = await self.kirchhoffSolver.checkJunctionRule(event.data.selectedElements).toJs();
                self.postMessage({errorCode: errorCode, eqs: eqs, id: _id});
            } else if (event.data.action === "foundAllVoltEquations") {
                const foundAll = await self.kirchhoffSolver.foundAllVoltEquations();
                self.postMessage({foundAll: foundAll, id: _id});
            } else if (event.data.action === "foundAllEquations") {
                const foundAll = await self.kirchhoffSolver.foundAllEquations();
                self.postMessage({foundAll: foundAll, id: _id});
            } else if (event.data.action === "equations") {
                const equations = await self.kirchhoffSolver.equations().toJs();
                self.postMessage({equations: equations, id: _id});
            }
            // ###################### Wheatstone API ########################
            else if (event.data.action === "equationIsValid") {
                const valid = await self.solveModule.WheatstoneBridgeSolver.callKwargs(event.data.data);
                self.postMessage({valid: valid, id: _id});
            }
        } catch (error) {
            if (self.pyodide === null) {
                self.postMessage({status: "error", error: "Pyodide not loaded", id: _id});
                return;
            } else {
                self.postMessage({status: "error", error: error, id: _id});
            }
        }
    }

    function generalizeOptIsNotSet(event) {
        if (event.data.data.optionsString !== null &&
            event.data.data.optionsString !== "" &&
            event.data.data.optionsString !== undefined) {
            return !event.data.data.optionsString.includes("--generalize");
        } else {
            return true; // If no options are set, generalize is not set
        }
    }
}
