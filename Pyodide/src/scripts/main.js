// #####################################################################################################################
// ##################################              GLOBALS            ##################################################
// #####################################################################################################################
/** Communication with worker backend
 * @type {WorkerCommunication} */
let pyodideBackend = null;

/** State object to hold all global variables
 * @type {StateObject}
 * */
let state = new StateObject();
/** Object to hold all colors
 * @type {ColorManager}
 * */
let colors = new ColorManager();
/** Object to hold all language fields
 * @type {LanguageManager}
 */
let languageManager = new LanguageManager();

let storageManager = new LocalStorageManager();
/** Object to hold all configuration variables
 * @type {Configurations}
 */
let conf = null;
/** Object for loading python packages for pyodide
 * @type {PackageManager}
 */
let packageManager = null;
/** Object for handling the different "page"-containers
 * @type {PageManager}
 */
let pageManager;
/** @type {number} */
let startTime = null;

/** @type {HashObject} */
let hashObject = null;

/** @type {PageHistory}*/
let pageHistory = null;

//Object for server files
/** @type {CircuitFilesManager | null} */
let serverFiles = null;
//Object for custom files
/** @type {CustomUserFiles | null} */
let customFiles = null;
/** @type {CircuitFilesManager | null} */
let scannerFiles = null;

/** @type {ConfigurableModal | null} */
let modalSm = null;

/** @type {ConfigurableModal | null} */
let modalXl = null;

/** @type {ExternalInput} */
let externalSelector;

/** @type {CircuitFilesManager} */
let tutorialFiles = null;

let conditionBlocker = false;
/**
 * The name of the participant, used for QR session tracking.
 * @type {string}
 */
const participantName = Math.random().toString(36).substring(2, 15);

// #####################################################################################################################
// ##################################              MAIN            #####################################################
// #####################################################################################################################
// The navigation for this website is not via different html files, but by showing and not
// showing different containers that act as pages, this is due to the pyodide instance
// #####################################################################################################################
/**
 * Main function.
 */
async function main() {
    await MathJax.startup.promise

    conf = new Configurations();
    await conf.initialize();

    tutorialFiles = new TutorialFiles();
    externalSelector = new ExternalInput();
    serverFiles = new ServerFiles();
    scannerFiles = new ScannerFiles();

    //setup navigation and landing page to display something
    modalSm = new ConfigurableModal("ConfigurableModalSm", "sm");
    modalXl = new ConfigurableModal("ConfigurableModalXl", "xl");
    pageManager = new PageManager();

    try{
        printHello();
        hashObject = new HashObject();
        let page = pageManager.pages[hashObject.setPage];
        await pageManager.setup(page);
    }
    catch(err){
        console.trace(err);
        console.error("Error setting up pages: " + err);
        UserMessage.error(err);
        pushErrorEventMatomo(errorActions.pageSetupError, err);
    }

    //init worker and rest of page
    pyodideBackend = new WorkerCommunication("src/scripts/pyodideWorker.js");

    state.apis.pyodide = new PyodideAPI(pyodideBackend);
    state.apis.drawingConfig = new DrawingConfigAPI(pyodideBackend);
    state.apis.svgGenerator = new SVGGeneratorAPI(pyodideBackend);

    await state.apis.pyodide.ready();
    await tutorialFiles.init();

    awaitVal(() => serverFiles.loaded && state.backendReady, () => scannerFiles.init())

    // when pyodide is loaded, and we are currently not on a simplifier page which could use the hardcoded stepwise api
    // create the new instances
    awaitVal(() => state.backendReady && !(pageManager.current instanceof SimplifierPage) && !(pageManager.current instanceof LoadingSomethingPage), () => {
        SimplifierPage.createSolvers(pyodideBackend);
        console.log("Created solver objects - all SimplifierPages can be used now")
    })

    try {
        modalConfig();
        pageManager.enableTooltips();

        packageManager = new PackageManager();
        await packageManager.initialize();

        startTime = Date.now();

        serverFiles.init().then(async () => {
                await pageManager.pages.selectPage.initialize();
                await packageManager.setupPyodideInterpreter();
                console.log("packages loaded")
            }
        );

    } catch (error) {
        console.trace(error)
        console.error("Error initializing: " + error);
        UserMessage.error(error);
        pushErrorEventMatomo(errorActions.initError, error);
    }

    // run these setups after this callstack is done
    queueMicrotask(() => {
        for (let page of pageManager.pagesToSetup){
            page.setup()
        }
    });

    if (hashObject.hasQrInfo) {
        try {
            startFromQrCode(hashObject.qrInfo);
        } catch (error) {
            console.trace(error)
            console.error("Error checking QR Code netlist");
            UserMessage.error(error);
        }
    }

    if (hashObject.hasTracking){
        try {
            pageManager.waitTillReady(pageManager.pages.trackingPage, pageManager.pages.loadingPyodidePage, () => state.backendReady);
        }
        catch(error) {
            console.trace(error)
            console.error("Error starting tracking page: " + error);
        }
    }
}

