// #####################################################################################################################
// ##################################              GLOBALS            ##################################################
// #####################################################################################################################

/** Pyodide web worker
 * @type {Worker}
 * */
let worker = null;
/** State object to hold all global variables
 * @type {StateObject}
 * */
let state = new StateObject();
/** Object to hold all colors
 * @type {ColorDefinitions}
 * */
let colors = new ColorDefinitions();
/** Object to build circuit selectors
 * @type {SelectorBuilder}
 */
let selectorBuilder = new SelectorBuilder();
/** Object to hold all language fields
 * @type {LanguageManager}
 */
let languageManager = new LanguageManager();
/** Object to hold all configuration variables
 * @type {null}
 */
let conf = null;
/** Object for loading python packages for pyodide
 * @type {PackageManager}
 */
let packageManager = null;
/** Object for loading and mapping circuit files
 * @type {CircuitMapper}
 */
let circuitMapper = null;
/** Object for handling the different "page"-containers
 * @type {PageManager}
 */
let pageManager;

let startTime = null;

/**
 * The name of the participant, used for QR session tracking.
 * @type {string}
 */
const participantName = Math.random().toString(36).substring(2, 15);

// #####################################################################################################################
// ##################################              MAIN            #####################################################
// #####################################################################################################################
// The navigation for this website is not via different html files, but by showing and not
// showing different containers that act as pages
// #####################################################################################################################
/**
 * Main function.
 */
async function main() {
    worker = new Worker("src/scripts/pyodideAPI/pyodideWorker.js");
    state.pyodideAPI = new PyodideAPI(worker);
    state.stepSolverAPI = new StepSolverAPI(worker);
    state.hardcodedStepSolverAPI = new HardcodedStepSolverAPI(worker);
    state.kirchhoffSolverAPI = new KirchhoffSolverAPI(worker);
    state.wheatstoneSolverAPI = new WheatstoneSolverAPI(worker);
    state.drawingConfigAPI = new DrawingConfigAPI(worker);

    pageManager = new PageManager();
    circuitMapper = new CircuitMapper();

    try {
        printHello();
        modalConfig();
        setLanguageAndScheme();
        setupDarkModeSwitch(); // needs circuitMapper and pageManager
        setupGameModeSwitch();
        enableStartBtnAndSimplifierLink();
        setBodyPaddingForFixedTopNavbar();
        scrollBodyToTop();

        conf = new Configurations();
        await conf.initialize();
        packageManager = new PackageManager();
        await packageManager.initialize();
        startTime = new Date().getTime();
        state.circuitsLoadedPromise = circuitMapper.mapCircuits(false); // for default circuit
        state.circuitsLoadedPromise.then(async () => {
            // save default set, parse(stringify()) to remove references
            state.circuitSets = JSON.parse(JSON.stringify(circuitMapper.circuitSets));
            selectorBuilder.buildSelectorsForAllCircuitSets();
            hideAccordion();
            hideQuickstart();
            state.overviewSvgsLoadedPromise = pageManager.setupSelectPage(); // Fill carousels with svg data
            document.getElementById("nav-upload").style.color = colors.currentForeground;

            state.overviewSvgsLoadedPromise.then(() => {
                packageManager.doLoadsAndImports();
            });

        });
    } catch (error) {
        console.error("Error initializing: " + error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.initError, error);
    }

    // Setup landing page first to make sure nothing else is shown at start
    try {
        pageManager.setupLandingPage();
        pageManager.showLandingPage();
        pageManager.setupNavigation();
        pageManager.setupCheatSheet();
        pageManager.setupSimplifierPage();
        pageManager.setupUploadPage();
        pageManager.setupToolPage();
        pageManager.setupNewsPage();
        pageManager.setupAboutPage();
        pageManager.setupSettingsPage();
        // Selector page is set up when start button is clicked
        // Enable tool tips after setups so tooltips are created
        pageManager.enableTooltips();
        pageManager.setupEasterEggs();
    } catch (error) {
        console.error("Error setting up pages: " + error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.pageSetupError, error);
    }

    try {
        let hash = window.location.hash;
        console.log(hash);
        if (hash) {
            parseHashAndStartCircuit(hash);
        }
    } catch (error) {
        console.error("Error checking QR Code netlist");
        showMessage(error, "error", false);
    }
}

