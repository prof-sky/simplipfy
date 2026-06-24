// Containing all the necessary information for everything to work,
// compact in one object (what otherwise would be global variables)
/**
 * Encapsulates all values needed for solving a circuit and the function of the web page.
 */
class StateObject {
    /** @type {int} */
    loadingProgress = 0;
    /** @type {boolean} */
    selectPageBuild = false;

    //Tracks the current step in the circuit simplification process.
    /** @type {int} */
    currentStep = 0;

    // Stores the circuit infos (source voltage, components, omega_0, ...)
    /** @type {StepObject} */
    step0Data = new StepObject();

    //Array to store selected elements in the circuit.
    /** @type {Array<string>} */
    selectedElements = [];

    //Tracks the current step in the circuit simplification process.
    /** @type {string} */
    relation = "null";

    //Stores the currently selected circuit map
    /** @type {CircuitMap | WheatstoneCircuitMap} */
    currentCircuitMap = null;
    currentCircuitIndex = 0;

    currentWheatstoneValuesPath = "";

    /** @type {Selector | ExternalInput} */
    currentSelector = null;

    /** @typedef APIs
     * @property {PyodideAPI | null} pyodide
     * @property {DrawingConfigAPI | null} drawingConfig
     * @property {SVGGeneratorAPI | null} svgGenerator
     * */
    /** @type {APIs} */
    apis= {
        pyodide: null,
        drawingConfig: null,
        svgGenerator: null
    }

    /** @typedef Solvers
     * @property {KirchhoffSolverAPI | null} kirchhoff
     * @property {StepSolverAPI | HardcodedStepSolverAPI} stepwise
     * @property {WheatstoneSolverAPI | null} wheatstone
     * @property {MagneticSolverAPI | null} magnetic
     * */
    /** @type {Solvers} */
    solvers= {
        stepwise: new HardcodedStepSolverAPI(),
        kirchhoff: null,
        wheatstone: null,
        magnetic: null,
    }
    solversReady = false;

    // Pyodide API
    /** @type {StepSolverAPI} */
    stepSolverAPI = null;
    /** @type {HardcodedStepSolverAPI} */
    hardcodedStepSolverAPI = null;

    doneVoltages = [];
    doneCurrents = [];
    voltEquations = [];

    checkBtnParallelAlreadyClicked = false;
    checkBtnSeriesAlreadyClicked = false;
    gamification = false;
    extraLiveUsed = false;
    lives = 3;
    shakeAlreadySetup = false;
    speedMode = {
        startTime: null,
        duration: null,
        requestId: null,
        div: null
    }

    //ToDo get vals from config file
    simplifierBaseTime = new TimeVal(5000);
    simplifierAddTime = new TimeVal(500); // ms per element
    kirchhoffBaseTime = new TimeVal(10000);
    kirchhoffAddTime = new TimeVal(1000); // ms per element
    timeSliderStepSize = new TimeVal(500);

    unknown = ""; // Unknown variable

    backendReady = false;

    //To count how many svgs are on the screen right now
    pictureCounter = 0;

    //To generate the table for all values
    allValuesMap = new Map();

    // Toggle variables
    valuesShown = new Map();

    selectedZipDir = null;

    fileForQrCode = null;

    /** @type {string} */
    netlistForQrCode = "";

    /** @type {QrTrackingData | EmptyQrTrackingData} */
    trackingData = new EmptyQrTrackingData();

    isScanning = false;

    selectedSvgsZip = null;

    sessionId = null;

    #modeDefinitions = window.definitions.mode

    currentEditorNetlist = '';
    currentEditorElementList = [];

    get currentCircuitFromUserZip(){
        return this.currentCircuitMap.mode === this.#modeDefinitions.custom;
    }

    get currentCircuitFromQrScan(){
        return this.currentCircuitMap.mode === this.#modeDefinitions.qr;
    }

    get currentCircuitFromEditor(){
        return this.currentCircuitMap.mode === this.#modeDefinitions.editor;
    }

    /**
     * @returns {string} returns the name of the selected zip directory or an empty string if customFiles is not set yet
     * */
    get selectedZipDirName(){
        if (customFiles) return customFiles.zipDirName
        else return ""
    }
}