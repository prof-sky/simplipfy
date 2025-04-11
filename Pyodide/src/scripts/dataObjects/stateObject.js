// Containing all the necessary information for everything to work,
// compact in one object (what otherwise would be global variables)

class StateObject {
    loadingProgress = 0;
    circuitsLoadedPromise = null;

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

    doneVoltages = [];
    doneCurrents = [];
    voltEquations = [];
    gamification = false;
    extraLiveUsed = false;

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
}