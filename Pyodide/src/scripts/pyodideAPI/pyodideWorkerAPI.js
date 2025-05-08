
// #####################################################################################
// ########################## Functions for API Calls ##################################
// #####################################################################################

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
            resolve(event.data.files);
        } else if (msg.action === "pyimport") {
            resolve(event.data.module);
        } else if (msg.action === "readFile") {
            resolve(event.data.file);
        } else if (msg.action === "runPython") {
            resolve(event.data.result);
        }
            // ###################### Simplifier API ########################
        // Only for functions which require a specific return value
        else if (msg.action === "createStep0") {
            resolve(event.data.step0);
        } else if (msg.action === "simplifyNCpts") {
            resolve(event.data.simplifiedStep);
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
        }
        // ###################### Error handling #######################
        else {
            // Always filter out id
            let {id, ...data} = event.data;
            resolve(data);
        }
    } catch (error) {
        console.error("Error in getResolve: ", error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.workerAPIError, error);
    }
}

// Common response for pyodide backend, uses promises and resolves
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
                console.error("Error in requestResponse: ", error);
                showMessage(error, "error", false);
                pushErrorEventMatomo(errorActions.workerAPIError, "Request Response Error: " + error);
            }
        });
        worker.postMessage({id: idWorker, ...msg});
        return promise;
    } catch (error) {
        console.error("Error in requestResponse: ", error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.workerAPIError, "Request Response Error: " + error);
    }
}
