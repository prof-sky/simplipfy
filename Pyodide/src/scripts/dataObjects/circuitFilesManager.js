/**
 * Loads circuit files (e.g. Circuits.zip) from the server and creates a {@link CircuitSet} based on the loaded files.
 * Use {@link CircuitFilesManager.initSelectPageCircuits} or {@link CircuitFilesManager.initToolsPageCustomCircuits} to load and create the
 * {@link CircuitSet} objects that are stored in {@link CircuitFilesManager.circuitSets}.
 * */
class CircuitFilesManager {
    /** @type {Array<CircuitSet>} */
    circuitSets= [];
    hash;
    loaded = false;

    /** @returns {Array<WheatstoneOption>} */
    get options(){
        /** @type {WheatstoneCircuitMap} */
        let wcMap = this.getCircuitSet(window.definitions.selectorIDs.wheatstone).circuitMaps[0]
        return wcMap.options;
    }

    /** @returns {CircuitSet} */
    get quickStartSet() {
        // because of the predefined order from definitions the quickstart is at the first element in the list
        // if it is in the list
        if (this.circuitSets[0].identifier === this.quickStartIdentifier) {
            return this.circuitSets[0];
        }
        else {
            return new CircuitSet(this.quickStartIdentifier, [])
        }
    }

    /** @param identifier {window.definitions.selectorIDs}
     * @returns {CircuitSet}
     * */
    getCircuitSet(identifier) {
        for (let set of this.circuitSets) {
            if (set.identifier === identifier) {
                return set;
            }
        }
        console.warn(`CircuitSet with identifier "${identifier}" not found, returned empty set`)
        return new CircuitSet(identifier, []);
    }

    get keys(){
        let keys = [];
        for (let key of this.circuitSets) {
            keys.push(key.identifier)
        }
        return keys;
    }

    constructor() {
        // the path to the user uploaded files in pyodide
        this.customCircuitsPath = conf.tools.customCircuits.paths.dir
        this.zipDirName = "";
        this.files = {}

        this.quickStartIdentifier = window.definitions.selectorIDs.quickstart
    }

    // this is used for the select page
    /**
     * At default loads the Circuit.zip file from the server. If in {@link HashObject} `ccUser` and `ccFile` are set, loads the
     * specified custom zip-file from the /CustomsCircuits folder on the server. Generates a {@link CircuitSet} that is appended to
     * {@link CircuitFilesManager.circuitSets}. Each folder in the zip file results in a {@link CircuitSet}.
     * */
    async initSelectPageCircuits(){
        await this.#getStandardFiles();
        await this.#recreateAndFilter(conf.pyodide.paths.circuits);
        await this.mapCircuits(window.definitions.mode.learn);
        this.loaded = true;
    }

    // this is used by the tool "custom circuit" on the tools page
    /**
     * Generates a {@link CircuitSet} from an uploaded zip file and is used on the tools page at "Custom Circuit Collections".
     * the generated {@link CircuitSet} is appended to {@link CircuitFilesManager.circuitSets}. Each folder in the zip file results in a
     * {@link CircuitSet}.
     * */
    async initToolsPageCustomCircuits(){
        await this.#getUserFiles();
        await this.#recreateAndFilter(this.customCircuitsPath + "/" + this.zipDirName);
        await this.mapCircuits(window.definitions.mode.custom);
        this.loaded = true;
    }

    /** reads the files uploaded by a user and saves them in this.files for further processing */
    async #getUserFiles(){
        let arrayBuffer;
        let status;

        // Load user circuits from local file with pyodide
        // Check if dir for user circuits exists
        let dirs_;
        [status, dirs_] = await state.apis.pyodide.readDir(conf.pyodide.paths.workingDir);
        if (!dirs_.includes(conf.tools.customCircuits.names.dir)) {
            await state.apis.pyodide.mkdir(this.customCircuitsPath);
        }
        // Check if dir for this circuit.zip name already exists
        this.zipDirName = state.selectedZipDir.name.replace(".zip", "").replace(" ", "_");

        let dirs;
        let customCircutisPath = this.customCircuitsPath + "/" + this.zipDirName;
        [status, dirs] = await state.apis.pyodide.readDir(this.customCircuitsPath);
        if (dirs.includes(this.zipDirName)) {
            // Dir exists, delete it
            await state.apis.pyodide.recursiveRmdir(customCircutisPath);
        }
        // Unpack new dir
        arrayBuffer = await state.selectedZipDir.arrayBuffer();
        await this.setHash(arrayBuffer);

        await this.loadZipIntoPyodide(arrayBuffer, customCircutisPath);

        // Read files of new dir
        [status, this.circuitDirs] = await state.apis.pyodide.readDir(this.customCircuitsPath + "/" + this.zipDirName);
        if (status === "error") {
            // Example for this error:
            // User downloaded Circuits_example.zip the second time, so it is renamed to Circuits_example(1).zip
            // Now conflicting names between Circuits_example inside the zip dir (and the name inside pyodide) and Circuits_example(1).zip
            console.error("Error reading user circuit directory");
            setTimeout(() => {
                showMessage(languageManager.currentLang.alerts.maybeConflictingNames + state.selectedZipDir.name, "info", false);
            });
        }
    }

    async loadZipIntoPyodide(arrayBuffer, extractDir){
        let pyodide = state.apis.pyodide

        let exists = await state.apis.pyodide.exists(extractDir);
        if (exists) {
            pyodide.rmdir(extractDir);
        }
        await pyodide.mkdir(extractDir);

        let options = Object.assign({}, {extractDir: extractDir});
        await state.apis.pyodide.unpackArchive(arrayBuffer, ".zip", options);

        let contentList = (await pyodide.readDir(extractDir))[1];

        for (let id of Object.keys(window.definitions.selectorIDs)) {
            if (contentList.includes(id)){
                return;
            }
        }

        // returns [status, data], first entry in data "." second entry ".." -> index 2 first element in folder
        const newPath = extractDir + "/" + contentList[2];
        contentList = (await pyodide.readDir(newPath))[1];
        let folderToCopy = []
        for (let id of Object.keys(window.definitions.selectorIDs)) {
            if (contentList.includes(id)){
                folderToCopy.push(id);
            }
        }

        for (let folder of folderToCopy) {
            await pyodide.rename(newPath + "/" + folder, extractDir + "/" + folder);
        }

        await pyodide.recursiveRmdir(newPath);
    }

    /** reads the standard files from the simplipfy.org server and saves them in this.files for further processing */
    async #getStandardFiles(){
        // Load default circuits
        let data = await fetch(conf.server.paths.circuits);
        if (!data.ok){
            console.warn("Error fetching custom circuits from server, status: " + data.status);
            console.warn("Defaulting to standard circuits");
            hashObject.customCircuitsValid = false;
            await conf.initialize();
            data = await fetch(conf.server.paths.circuits)
        }
        let cirArrBuff = await data.arrayBuffer();
        await this.loadZipIntoPyodide(cirArrBuff, conf.pyodide.paths.circuits);
        let status;
        [status, this.circuitDirs] = await state.apis.pyodide.readDir(conf.pyodide.paths.circuits);

        // Calculate hash of circuits to check if they are up to date
        // this is used to manage the done x of n circuits on the select page if the circuits hash changes those are
        // reset to 0 of n
        let hash = await this.setHash(cirArrBuff);
        storageManager.circuitsHash.setValue(hash);
    }

    async getHash(buffer) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async setHash(buffer) {
        let hash = await this.getHash(buffer);
        this.hash = hash;
        storageManager.circuitsDone.addHash(hash);
        storageManager.animationShown.addHash(hash);

        return hash;
    }

    /**
     * recreate the folder structure from readPath in this.files
     * @param {string} readPath the path where pyodide reads using FS interface
     * */
    async #recreateAndFilter(readPath){
        this.circuitDirs = this.circuitDirs.filter((file) => file !== "." && file !== ".." && file !== "readme.md");
        this.files = {};

        for (let dir of this.circuitDirs) {
            let circuits = [];
            let status;

            [status, circuits] = await state.apis.pyodide.readDir(`${readPath}/${dir}`);
            circuits = circuits.filter((file) =>
                file !== "."
                && file !== ".."
                && !file.endsWith(".svg")
                && !file.endsWith(".json"));
            this.files[dir] = circuits
        }
        console.log("Read circuit files");
    }

    /** create CircuitSets from the directories
     * @param mode {window.definitions.mode} */
    async mapCircuits (mode = window.definitions.mode.learn) {
        try {
            /** @type {Object<string>} */
            const ids = window.definitions.selectorIDs
            /** @type {Array<string>} */
            const allowedDirNames = Object.values(window.definitions.allowedDirNames)

            for (let /** @type {string} */ dir of Object.keys(this.files)) {
                // there are different pages for the solutions so we need to know which folder to map to stepwisePage,
                // kirchhoffPage, wheatstonePage and maybe more therefore we need to predefine allowed directories

                if (!allowedDirNames.includes(dir)) {
                    console.error("Forbidden dir name: " + dir);
                    setTimeout(() => {
                        showMessage(languageManager.currentLang.selector.forbiddenDir + dir, "error", false);
                    }, 0);
                }

                this.circuitSets.push(await new CircuitSet().initFromFiles(this.files[dir], dir, mode))
            }
        } catch (error) {
            console.trace(error)
            console.error("Error mapping circuits: " + error);
            setTimeout(() => {
                showMessage(languageManager.currentLang.alerts.mappingCircuitsError + error, "info", false);
            });
            pushErrorEventMatomo(errorActions.circuitMappingError, error);
        }
    }


    /**
     *
     * @param dir {string}
     * @param identifier {window.definitions.selectorIDs} identifier from src/source/definitions/colorIdDs.js
     * @param mode {window.definitions.mode} where a circuit is started from (changes paths)
     * @returns {Promise<CircuitSet>}
     */
    async createCircuitSet(dir, identifier, mode) {
        if (!Object.values(window.definitions.selectorIDs).includes(identifier)) {
            console.error("Unknown identifier: " + identifier);
            console.error("Allowed Identifiers: " + Object.values(window.definitions.selectorIDs));
        }

        /** @type {Array<CircuitMap>} */
        let circuitMaps = [];

        let fkt = (new CircuitMapFactory()).getCircuitMap;

        this.files[dir].sort()

        let idx = 0;
        for (let circuitFileName of this.files[dir]) {
            await fkt(identifier).init(circuitFileName, dir, identifier, circuitMaps,
                idx, mode)
            idx++;
        }

        return new CircuitSet(identifier, circuitMaps);
    }

    /**
     * @param a {CircuitMap}
     * @param b {CircuitMap}
     * */
    _compareByCircuitDivIds(a,b) {
        if (a.circuitId < b.circuitId) {
            return -1;
        }
        if (a.circuitId > b.circuitId) {
            return 1;
        }
        return 0;
    }
}