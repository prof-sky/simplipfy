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

    conf = new Configurations();
    await conf.initialize();
    packageManager = new PackageManager();
    await packageManager.initialize();
    startTime = new Date().getTime();
    circuitMapper = new CircuitMapper();
    state.circuitsLoadedPromise = circuitMapper.mapCircuits();
    state.circuitsLoadedPromise.then(() => {
        packageManager.doLoadsAndImports();
    });

    modalConfig();
    disableStartBtnAndSimplifierLink();
    setLanguageAndScheme();

    // Setup landing page first to make sure nothing else is shown at start
    pageManager = new PageManager(document);
    pageManager.setupLandingPage();
    pageManager.showLandingPage();
    pageManager.setupNavigation();
    pageManager.setupCheatSheet();
    pageManager.setupSimplifierPage();
    pageManager.setupAboutPage();
    // Selector page is set up when start button is clicked

    setupDarkModeSwitch();
    setupGameModeSwitch();
    enableStartBtnAndSimplifierLink();
    setBodyPaddingForFixedTopNavbar();
    scrollBodyToTop();
}
