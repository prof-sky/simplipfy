// Containing all the necessary information for everything to work,
// compact in one object (what otherwise would be global variables)

class StateObject {
    loadingProgress = 0;
    circuitsLoadedPromise = null;
    overviewSvgsLoadedPromise = null;
    solverLoaded = false;

    // Map to store interval ids for tracking qr codes
    trackerIntervalMap = new Map();

    //Tracks the current step in the circuit simplification process.
    currentStep = 0;

    // Stores the circuit infos (source voltage, components, omega_0, ...)
    step0Data = {};

    //Array to store the names of the circuit files.
    circuitFiles = [];

    //Array to store selected elements in the circuit.
    selectedElements = [];

    //Stores the currently selected circuit map
    currentCircuitMap = null;

    // Pyodide API
    pyodideAPI = null;
    kirchhoffSolverAPI = null;
    simplifierAPI = null;
    stepSolverAPI = null;
    hardcodedStepSolverAPI = null;
    wheatstoneSolverAPI = null;
    drawingConfigAPI = null;

    doneVoltages = [];
    doneCurrents = [];
    voltEquations = [];

    checkBtnAlreadyClicked = false;
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
    simplifierSolveTimeMs = 5000;
    simplifierAddTimeMs = 500; // ms per element
    kirchhoffSolveTimeMs = 10000;
    kirchhoffAddTimeMs = 1000; // ms per element

    options = []; // List of possible wheatstone circuits
    currentOption = 0; // Current option
    unknown = ""; // Unknown variable

    //Boolean to track if the Pyodide environment is ready.
    pyodide = null;
    pyodideReady = false;

    selectorsBuild = false;

    //To count how many svgs are on the screen right now
    pictureCounter = 0;

    //To generate the table for all values
    allValuesMap = new Map();

    // Toggle variables
    valuesShown = new Map();

    // Uploader
    currentCircuitFromUserZip = false;
    selectedZipDir = null;
    selectedZipDirName = "";
    circuitSets = null;
    uploadCircuitSets = null;
    isLinkedZip = false;
    isLinkedAlertShown = false;

    currentCircuitFromQrScan = false;
    fileForQrCode = null;
    html5QrCode = null;
    isScanning = false;

    selectedSvgsZip = null;

    sessionId = null;
}