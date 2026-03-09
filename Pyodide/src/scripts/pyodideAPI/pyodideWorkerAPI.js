
// #####################################################################################
// ########################## Functions for API Calls ##################################
// #####################################################################################
/**
 * A deferred object containing a Promise and its external resolve function.
 *
 * @template T
 * @typedef {Object} Deferred
 * @property {Promise<T>} promise - The promise that can be externally resolved.
 * @property {function((T|PromiseLike<T>)): void} resolve - Function to resolve the promise.
 */

/**
 * Creates a deferred object with a Promise and its resolve function.
 *
 * @template T
 * @returns {Deferred<T>}
 */
function getPromiseAndResolve() {
    let resolve;
    let promise = new Promise((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

// Use id to identify the message, just a counter
let lastId = 1;
function getId() {
    return lastId++;
}

function getResolve(msg, resolve, event) {
    // Filter the corresponding output, see pyodideWorker.js for return objects
    // Useful to get the objects inside the events instead of an object
    // await readFiles -> [f1, f2, ...] instead of {files: [f1, f2, ...]}
    // With this we don't have to bother on the consumer side which call
    // we made, but always can just get the expected output
    try {
        // ###################### Pyodide API ########################
        // Only for functions which require a specific return value
        if (msg.action === "readdir") {
            resolve([event.data.status, event.data.files]);
        } else if (msg.action === "pyimport") {
            resolve(event.data.module);
        } else if (msg.action === "readFile") {
            resolve(event.data.file);
        } else if (msg.action === "exists") {
            resolve(event.data.exists);
        } else if (msg.action === "rename"){
                resolve(event.data.success);
        } else if (msg.action === "runPython") {
            resolve(event.data.result);
        } else if (msg.action === "isValidCircuitFile") {
            resolve([event.data.isValid, event.data.errorMsgs, event.data.warnMsgs]);
        } else if (msg.action === "isValidCircuitString") {
            resolve([event.data.isValid, event.data.errorMsgs, event.data.warnMsgs]);
        } else if (msg.action === "forceDrawing") {
            resolve([event.data.isValidSyntax, event.data.svgData, event.data.errMsgs, event.data.warnMsgs]);
        } else if (msg.action === "getCircuitFiles") {
            resolve(event.data.files);
        }
        // ###################### Simplifier API ########################
        // Only for functions which require a specific return value
        else if (msg.action === "createStep0") {
            resolve(new StepObject(event.data.step0));
        } else if (msg.action === "getStep") {
                resolve(event.data.step);
        } else if (msg.action === "simplifyNCpts") {
            resolve(event.data.simplifiedStep);
        }
        else if (msg.action === "canSimplipfyCpts"){
            resolve(event.data.canSimplifyCpts)
        }
        // ###################### Drawing Config API ###################
        else if (msg.action === "isLocked") {
            resolve(event.data.isLocked);
        }
        // ###################### Kirchhoff API ########################
        // Only for functions which require a specific return value
        else if (msg.action === "checkVoltageLoopRule") {
            resolve([event.data.errorCode, event.data.eq]);
        } else if (msg.action === "checkJunctionRule") {
            resolve([event.data.errorCode, event.data.eqs]);
        } else if (msg.action === "foundAllVoltEquations") {
            resolve(event.data.foundAll);
        } else if (msg.action === "foundAllEquations") {
            resolve(event.data.foundAll);
        } else if (msg.action === "equations") {
            resolve(event.data.equations);
        } else if (msg.action === "equationsURI") {
            resolve(event.data.equationsURI);
        }
        else if (msg.action ==="currEquations"){
            resolve(event.data.currEqs);
        }
        else if (msg.action ==="voltEquationsURI"){
            resolve(event.data.voltEqsURI);
        }
        // ###################### WheatstoneSolver API ###################
        //  -
        else if (msg.action === "equationIsValid") {
            resolve(event.data.valid);
        }
        // ###################### Error handling #######################
        else {
            // Always filter out id
            let {id, ...data} = event.data;
            resolve(data);
        }
    } catch (error) {
        console.trace(error)
        console.error("Error in getResolve: ", error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.workerAPIError, error);
    }
}

// Common response for pyodide backend, uses promises and resolves
/** @returns {Promise} */
function requestResponse(worker, msg) {
    try {
        const {promise, resolve} = getPromiseAndResolve();
        const idWorker = getId();
        worker.addEventListener("message", function listener(event) {
            try {
                if (event.data.status === "info") {
                    console.log("WORKER INFO: ", event);
                } else if (event.data.status === "error") {
                    console.error("ERROR IN WORKER");
                    console.error(event);
                }
                if (event.data?.id !== idWorker) {
                    return; // Ignore messages that don't match our id
                }
                // This listener is done so remove it.
                worker.removeEventListener("message", listener);
                getResolve(msg, resolve, event);
            } catch (error) {
                console.trace(error)
                console.error("Error in requestResponse: ", error);
                showMessage(error, "error", false);
                pushErrorEventMatomo(errorActions.workerAPIError, "Request Response Error: " + error);
            }
        });
        worker.postMessage({id: idWorker, ...msg});
        return promise;
    } catch (error) {
        console.trace(error)
        console.error("Error in requestResponse: ", error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.workerAPIError, "Request Response Error: " + error);
    }
}
