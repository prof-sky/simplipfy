// #####################################################################################
// ########################## Drawing Config API Class #################################
// #####################################################################################

class DrawingConfigAPI {
    constructor(worker) {
        this.worker = worker;
    }

    lock(onStr) {
        if (state.solverLoaded) {
            return requestResponse(this.worker, {
                action: "lock",
                data: {onStr: onStr}
            });
        }
    }

    unlock(setTo) {
        if (state.solverLoaded) {
            return requestResponse(this.worker, {
                action: "unlock",
                data: {setTo: setTo}
            });
        }
    }

    setToDefault() {
        if (state.solverLoaded) {
            return requestResponse(this.worker, {
                action: "setToDefault",
                data: {}
            });
        }
    }

    setOptions(options) {
        if (state.solverLoaded) {
            return requestResponse(this.worker, {
                action: "setOptions",
                data: {options: options}
            });
        }
    }

    isLocked() {
        if (state.solverLoaded) {
            return requestResponse(this.worker, {
                action: "isLocked",
                data: {}
            });
        }
    }
}