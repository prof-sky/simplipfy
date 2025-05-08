// #####################################################################################################################
// ##################################              GLOBALS            ##################################################
// #####################################################################################################################

let worker = null;
let state = new StateObject();
let colors = new ColorDefinitions();
let selectorBuilder = new SelectorBuilder();
let languageManager = new LanguageManager();
let conf = null;
let packageManager = null;
let circuitMapper = null;
let pageManager;

let startTime = null;

// #####################################################################################################################
// ##################################              MAIN            #####################################################
// #####################################################################################################################
// The navigation for this website is not via different html files, but by showing and not
// showing different containers that act as pages
// #####################################################################################################################
async function main() {
    worker = new Worker("src/scripts/pyodideAPI/pyodideWorker.js");
    state.pyodideAPI = new PyodideAPI(worker);
    state.stepSolverAPI = new StepSolverAPI(worker);
    state.hardcodedStepSolverAPI = new HardcodedStepSolverAPI(worker);
    state.kirchhoffSolverAPI = new KirchhoffSolverAPI(worker);
    state.wheatstoneSolverAPI = new WheatstoneSolverAPI(worker);

    pageManager = new PageManager(document);
    circuitMapper = new CircuitMapper();

    try {
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
        state.circuitsLoadedPromise = circuitMapper.mapCircuits();
        state.circuitsLoadedPromise.then(async () => {
            selectorBuilder.buildSelectorsForAllCircuitSets();
            hideAccordion();
            hideQuickstart();
            state.overviewSvgsLoadedPromise = pageManager.setupSelectPage(); // Fill carousels with svg data

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
        // Selector page is set up when start button is clicked
        pageManager.setupLandingPage();
        pageManager.showLandingPage();
        pageManager.setupNavigation();
        pageManager.setupCheatSheet();
        pageManager.setupSimplifierPage();
        pageManager.setupAboutPage();
        // Selector page is set up when start button is clicked
    } catch (error) {
        console.error("Error setting up pages: " + error);
        showMessage(error, "error", false);
        pushErrorEventMatomo(errorActions.pageSetupError, error);

    }

}
