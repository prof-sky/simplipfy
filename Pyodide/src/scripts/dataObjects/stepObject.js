/**
 * @typedef {Object} Source
 * @property {string} Type
 * @property {string} omega_0
 * @property {string} frequency
 * @property {Impedance} Z
 * @property {Quantity} U
 * @property {Quantity} I
 * @property {boolean} hasConversion
 */

/**
 * @typedef {Object} Component
 * @property {Impedance} Z
 * @property {Quantity} U
 * @property {Quantity} I
 * @property {boolean} hasConversion
 */

/**
 * @typedef {Object} Impedance
 * @property {string} name
 * @property {string} impedance
 * @property {string} cpxVal
 * @property {string} re
 * @property {string} im
 * @property {string} phase
 * @property {string} val
 */

/**
 * @typedef {Object} Quantity
 * @property {string} name
 * @property {string} val
 * @property {string} phase
 */

/** @typedef {"series" | "parallel" | "undefined"} ComponentsRelation*/
/** @typedef {"inSeries" | "inParallel" | "notSeries" | "notParallel" | "notInRelation" | "delta" | "star" | "undefined"} SimplifierState*/

/**
 * Object represents information that is returned from a simplification step
 */
class StepObject {
    /** @type {boolean} **/
    error = false;
    /** @type {string} **/
    errorMessage = "";
    /** @type {string} */
    step= ""
    /** @type {boolean} */
    canBeSimplified = false;
    /** @type {Component} */
    simplifiedTo= [];
    /** @type {ComponentsRelation} */
    componentsRelation = "undefined"
    /** @type {SimplifierState} */
    simplifierState = "undefined"
    /** @type {Array<Component>} */
    components= []
    /** @type {Array<Component>} */
    allComponents= []
    /** @type {string} */
    svgData= "<svg></svg>"
    /** @type {string} */
    gSvgData= "<svg></svg>"
    /** @type {boolean} */
    isGeneralized= false
    /** @type {"R" | "L" | "C" | "Z" | "RL" | "RC" | "LC" | "RLC" | "undefined"} */
    componentTypes

    /** @type {Array<Source>} */
    sources

    // Magnetic params
    /** @type {string} */
    coreRelations = "undefined"
    /** @type {string} */
    coreSVGData= "<svg></svg>"
    /** @type {string} */
    translatedSVGData= "<svg></svg>"


    constructor(object) {
        // this is necessary to create _templates of this class without values
        if (!object) return this;

        for (let [key, value] of Object.entries(object)) {
            this[key] = value;
        }

        return this;
    }

    getZVal(component) {
        return component.hasConversion ? component.Z.val : component.Z.impedance;
    }

    getComponentTypes() {
        let r, l, c, z = false
        this.components.forEach((component) => {
            if (component.Z.name.includes("R")) {
                r = true
            } else if (component.Z.name.includes("L")) {
                l = true
            } else if (component.Z.name.includes("C")) {
                c = true
            } else if (component.Z.name.includes("Z")) {
                z = true
            }
        })
        if (z) {
            return "Z"
        } else if (r && l && c) {
            return "RLC"
        } else if (r && l) {
            return "RL"
        } else if (r && c) {
            return "RC"
        } else if (l && c) {
            return "LC"
        } else if (r) {
            return "R"
        } else if (l) {
            return "L"
        } else if (c) {
            return "C"
        }
    }

    /** @returns {boolean} */
    returnGeneralizedSvgData(){
        return state.pictureCounter > 1 &&
            !(state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.quickstart ||
                state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.symbolic
            ) && document.getElementById(`generalizeSwitch${state.pictureCounter - 1}`).checked === true
    }

    get svgOrGsvgData() {
        if (this.returnGeneralizedSvgData()) {
            return this.gSvgData;
        }
        else {
            return this.svgData;
        }
    }
}
