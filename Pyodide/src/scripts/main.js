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
/** @type {Date} */
let startTime = null;

/** @type {HashObject} */
let hashObject = null;

/** @type {PageHistory}*/
let pageHistory = null;

//Object for server files
/** @type {CircuitFilesManager | null} */
let serverFiles = null;
//Object for custom files
/** @type {CircuitFilesManager | null} */
let customFiles = null;

/** @type {ConfigurableModal | null} */
let modalSm = null;

/** @type {ConfigurableModal | null} */
let modalXl = null;

/** @type {ExternalInput} */
let externalSelector;

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

    externalSelector = new ExternalInput();
    serverFiles = new CircuitFilesManager();

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
        showMessage(err, "error", false);
        pushErrorEventMatomo(errorActions.pageSetupError, err);
    }

    //init worker and rest of page
    worker = new Worker("src/scripts/pyodideWorker.js");
    state.apis.pyodide = new PyodideAPI(worker);
    state.apis.drawingConfig = new DrawingConfigAPI(worker);

    // when pyodide is loaded, and we are currently not on a simplifier page which could use the hardcoded stepwise api
    // create the new instances
    awaitVal(() => state.pyodideReady && !(pageManager.current instanceof SimplifierPage) && !(pageManager.current instanceof LoadingSomethingPage), () => {
        SimplifierPage.createSolvers(worker);
        console.log("Created solver objects - all SimplifierPages can be used now")
    })

    try {
        modalConfig();
        pageManager.enableTooltips();

        packageManager = new PackageManager();
        await packageManager.initialize();

        startTime = new Date().getTime();

        //Object for server files
        serverFiles.initSelectPageCircuits().then(async () => {
                await pageManager.pages.selectPage.initialize();
                state.selectPageBuild = true
            }
        );

        awaitVal(() => state.selectPageBuild, () => packageManager.setupPyodideInterpreter()).then(() => console.log("packages loaded"))

    } catch (error) {
        console.trace(error)
        console.error("Error initializing: " + error);
        showMessage(error, "error", false);
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
            showMessage(error, "error", false);
        }
    }
}

