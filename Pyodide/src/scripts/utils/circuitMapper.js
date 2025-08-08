class CircuitMapper {

    constructor() {
        this.files = {}
    }

    // #################################################################################################################

    async mapCircuits (forUserCircuits=false) {
        return new Promise(async (resolve) => {
            let throwError = false;
            try {
                // Reset circuitSets
                await this.fillFilesObject(forUserCircuits);
                state.circuitFiles = this.files;
                let u = forUserCircuits;

                for (let dir of this.circuitDirs) {
                    if (dir === allowedDirNames.quickstart) {
                        await this.addCircuitMaps(dir, this._quickstart, this.selectorIds.quick, u);
                    } else if (dir === allowedDirNames.resistor) {
                        await this.addCircuitMaps(dir, this._resistor, this.selectorIds.res, u);
                    } else if (dir === allowedDirNames.capacitor) {
                        await this.addCircuitMaps(dir, this._capacitor, this.selectorIds.cap, u);
                    } else if (dir === allowedDirNames.inductor) {
                        await this.addCircuitMaps(dir, this._inductor, this.selectorIds.ind, u);
                    } else if (dir === allowedDirNames.mixed) {
                        await this.addCircuitMaps(dir, this._mixed, this.selectorIds.mixedId, u);
                    } else if (dir === allowedDirNames.symbolic) {
                        await this.addCircuitMaps(dir, this._symbolic, this.selectorIds.symbolic, u);
                    } else if (dir === allowedDirNames.kirchhoff) {
                        await this.addCircuitMaps(dir, this._kirchhoff, this.selectorIds.kirchhoff, u);
                    } else if (dir === allowedDirNames.wheatstone) {
                        await this.addCircuitMaps(dir, this._wheatstone, this.selectorIds.wheatstone, u);
                    } else {
                        console.error("Unknown directory: " + dir);
                        console.error("Allowed Names: " + Object.values(allowedDirNames));
                        console.info("See allowedDirNames.js for more information");
                        setTimeout(() => {
                            showMessage(languageManager.currentLang.alertMappingCircuitsError + languageManager.currentLang.alertUnkownDir + dir, "info", false);
                        });
                        throwError = true;
                    }
                }
                this.updateCircuitSets();
                if (throwError) {
                    throw new Error("Unknown directory name");
                }
                resolve();
            } catch (error) {
                console.error("Error mapping circuits: " + error);
                setTimeout(() => {
                    showMessage(languageManager.currentLang.alertMappingCircuitsError + error, "info", false);
                });
                pushErrorEventMatomo(errorActions.circuitMappingError, error);
            }
        });
    }


    // #################################################################################################################

    _circuitsPath = "Circuits"
    _svgsPath = "Solutions"

    selectorIds = {
        quick: "quick",
        res: "res",
        cap: "cap",
        ind: "ind",
        mixedId: "mixed",
        symbolic: "sym",
        kirchhoff: "kirch",
        wheatstone: "wheat",
        simplifier: "simplifier",
    }

    _quickstart = {
        identifier: this.selectorIds.quick,
        set: []
    }
    _mixed = {
        identifier: this.selectorIds.mixedId,
        set: []
    }
    _resistor = {
        identifier: this.selectorIds.res,
        set: []
    }
    _capacitor = {
        identifier: this.selectorIds.cap,
        set: []
    }
    _inductor = {
        identifier: this.selectorIds.ind,
        set: []
    }
    _symbolic = {
        identifier: this.selectorIds.symbolic,
        set: []
    }
    _kirchhoff = {
        identifier: this.selectorIds.kirchhoff,
        set: []
    }
    _wheatstone = {
        identifier: this.selectorIds.wheatstone,
        set: []
    }

    circuitSets = [];

    updateCircuitSets() {
        // This is the order in which the circuits are displayed on the selector page
        if (this._quickstart.set.length !== 0) {
            this.circuitSets.push(this._quickstart);
        }
        if (this._symbolic.set.length !== 0) {
            this.circuitSets.push(this._symbolic);
        }
        if (this._resistor.set.length !== 0) {
            this.circuitSets.push(this._resistor);
        }
        if (this._capacitor.set.length !== 0) {
            this.circuitSets.push(this._capacitor);
        }
        if (this._inductor.set.length !== 0) {
            this.circuitSets.push(this._inductor);
        }
        if (this._mixed.set.length !== 0) {
            this.circuitSets.push(this._mixed);
        }
        if (this._kirchhoff.set.length !== 0) {
            this.circuitSets.push(this._kirchhoff);
        }
        if (this._wheatstone.set.length !== 0) {
            this.circuitSets.push(this._wheatstone);
        }
    }

    async addCircuitMaps(dir, set, identifier, userCircuit) {
        if (!Object.values(this.selectorIds).includes(identifier)) {
            console.error("Unknown identifier: " + identifier);
            console.error("Allowed Identifiers: " + Object.values(this.selectorIds));
        }

        for (let circuitFileName of this.files[dir]) {
            let circuit = await this.createCircuitMap(circuitFileName, dir, identifier, userCircuit)
            set.set.push(circuit);
        }
        set.set.sort(this._compareByCircuitDivIds);
    }

    _compareByCircuitDivIds(a,b) {
        // circuitDivId = {circuitFileName without Extension}-{id}-div
        // Deciding comparison is done with the filename (00_res... < 01_res... < 02_res... < 10_cap...)
        if (a.circuitDivID < b.circuitDivID) {
            return -1;
        }
        if (a.circuitDivID > b.circuitDivID) {
            return 1;
        }
        return 0;
    }

    async createCircuitMap(circuitFileName, dir, id, userCircuit) {
        let circuitId = circuitFileName.split(".")[0];
        let uploadAddOn = "";
        let path;
        if (userCircuit) {
            let dirName = state.selectedZipDirName;
            path = conf.userCircuitsPath + `${dirName}/${dir}/${circuitId}.txt`;
            uploadAddOn = "upload-";
        } else {
            path = `${this._circuitsPath}/${dir}/${circuitId}.txt`;
        }
        let result = await this.readVoltageAndFreq(path);
        if (result === null) {
            result = {voltage: "", frequency: ""};
        }
        return {
            circuitDivID: `${uploadAddOn}${circuitId}-${id}-div`,
            btn: `${uploadAddOn}${circuitId}-${id}-btn`,
            btnOverlay: `${uploadAddOn}${circuitId}-${id}-overlay`,
            circuitFile: circuitFileName,
            sourceDir: dir,
            svgFile: `${this._svgsPath}/${circuitId}_step0.svg`,
            selectorGroup: id,
            overViewSvgFile: `${this._circuitsPath}/${dir}/${circuitId}_step0.svg`,
            voltage: result.voltage,
            frequency: result.frequency
        }
    }

    async readVoltageAndFreq(path) {
        let file = await state.pyodideAPI.readFile(path, "utf8");
        const lines = file.split('\n');

        for (let line of lines) {
            const matchDC = line.match(/^V\d+ \d+ \d+ dc \{(.*?)\}/);
            const matchAC = line.match(/^V\d+ \d+ \d+ ac \{(.*?)\} \{.*?\} \{(.*?)\}/);

            if (matchDC) {
                return {voltage: matchDC[1] + "V", frequency: null};
            } else if (matchAC) {
                let omegaStr = matchAC[2].trim();
                let frequency;
                if (omegaStr.includes("2*pi")) {
                    omegaStr = omegaStr.replace(/pi/g, "Math.PI");
                }
                frequency = eval(omegaStr.replace(/pi/g, "Math.PI")) / (2 * Math.PI);
                return {voltage: matchAC[1] + "V", frequency: this.formatFrequency(Math.round(frequency))};
            }
        }

        return null;
    }

    formatFrequency(frequency) {
        if (frequency >= 1e9) {
            return (frequency / 1e9).toFixed(1) + 'GHz';
        } else if (frequency >= 1e6) {
            return (frequency / 1e6).toFixed(1) + 'MHz';
        } else if (frequency >= 1e3) {
            return (frequency / 1e3).toFixed(1) + 'kHz';
        } else {
            return frequency + 'Hz';
        }
    }

    async fillFilesObject(forUserCircuits) {
        if (forUserCircuits) {
            let arrayBuffer;
            let zipDirName;
            let status;

            // Load user circuits from local file with pyodide
            // Check if dir for user circuits exists
            let dirs_;
            [status, dirs_] = await state.pyodideAPI.readDir(conf.pyodideUserCircuitBasePath);
            if (!dirs_.includes(conf.userDirName)) {
                await state.pyodideAPI.mkdir(conf.userCircuitsPath);
            }
            // Check if dir for this circuit.zip name already exists
            zipDirName = state.selectedZipDir.name.replace(".zip", "").replace(" ", "_");
            let dirs;
            [status, dirs] = await state.pyodideAPI.readDir(conf.userCircuitsPath);
            if (dirs.includes(zipDirName)) {
                // Dir exists, delete it
                await state.pyodideAPI.recursiveRmdir(conf.userCircuitsPath + zipDirName);
            }
            // Unpack new dir
            arrayBuffer = await state.selectedZipDir.arrayBuffer();

            // Define storage path for user dirs
            let options = Object.assign({}, {extractDir: conf.userCircuitsPath});
            // Load the array buffer into pyodide
            await state.pyodideAPI.unpackArchive(arrayBuffer, ".zip", options);

            // Read files of new dir
            [status, this.circuitDirs] = await state.pyodideAPI.readDir(conf.userCircuitsPath + zipDirName);
            if (status === "error") {
                // Example for this error:
                // User downloaded Circuits_example.zip the second time, so it is renamed to Circuits_example(1).zip
                // Now conflicting names between Circuits_example inside the zip dir (and the name inside pyodide) and Circuits_example(1).zip
                console.error("Error reading user circuit directory");
                setTimeout(() => {
                    showMessage(languageManager.currentLang.alertMaybeConflictingNames + state.selectedZipDir.name, "info", false);
                });
            }
            state.selectedZipDirName = zipDirName;
        } else {
            // Load default circuits
            let cirArrBuff = await (await fetch(conf.sourceCircuitPath)).arrayBuffer();
            await state.pyodideAPI.unpackArchive(cirArrBuff, ".zip");
            let status;
            [status, this.circuitDirs] = await state.pyodideAPI.readDir(this._circuitsPath);

            // Calculate hash of circuits to check if they are up to date
            this.getHash(cirArrBuff).then((hash) => {
                // Check if this hash is already stored in localStorage
                let storedHash = localStorage.getItem("circuitsHash");
                if (storedHash !== hash) {
                    // Hash is not stored or different, store it and delete all cashed circuit info
                    localStorage.setItem("circuitsHash", hash);
                    // Delete all cached circuit info with key name
                    // - starting with "doneCircuits-"
                    // - ending with "animation-shown"
                    Object.keys(localStorage).forEach((key) => {
                        if (key.startsWith("doneCircuits-") || key.endsWith("animation-shown")) {
                            localStorage.removeItem(key);
                        }
                    });
                } else {
                    // Hash is the same, no need to update the cache for selector counter etc.
                }
            });
        }

        this.circuitDirs = this.circuitDirs.filter((file) => file !== "." && file !== ".." && file !== "readme.md");
        this.files = {};
        for (let dir of this.circuitDirs) {
            let circuits = [];
            let status;
            if (forUserCircuits) {
                let dirName = state.selectedZipDirName;
                [status, circuits] = await state.pyodideAPI.readDir(conf.userCircuitsPath + `${dirName}/${dir}`);
            } else {
                [status, circuits] = await state.pyodideAPI.readDir(`${this._circuitsPath}/${dir}`);
            }
            circuits = circuits.filter((file) =>
                file !== "."
                && file !== ".."
                && !file.endsWith(".svg")
                && !file.endsWith(".json"));
            this.files[dir] = circuits
        }
        console.log("Read circuit files");
    }

    async getHash(buffer) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    setNextCircuitMap(circuitMap) {
        // Get current selector set
        let set = this.circuitSets.find(group => group.identifier === circuitMap.selectorGroup);
        // Find the index of the current circuit in the set
        let index = set.set.findIndex(circuitM => circuitM.circuitFile === circuitMap.circuitFile);
        // Get the next circuit in the set
        let nextCircuit = set.set[index + 1];
        // If there is no next circuit, return the first one
        if (!nextCircuit) {
            nextCircuit = set.set[0];
        }
        // Set the next circuit map
        state.currentCircuitMap = nextCircuit;
    }

    async checkCircuitStructure(dirs) {
        // Check if directories only include allowed names
        dirs = dirs.filter((file) => file !== "." && file !== ".." && file !== "readme.md");
        // Quickstart and wheatstone is not allowed for user circuits (TODO Usercircuits)
        let allowedNames = Object.fromEntries(Object.entries(allowedDirNames)
            .filter(([key]) => key !== "quickstart")
            .filter(([key]) => key !== "wheatstone"));
        for (let dir of dirs) {
            if (!Object.values(allowedNames).includes(dir)) {
                setTimeout(() => {
                    showMessage(languageManager.currentLang.alertMappingCircuitsError + languageManager.currentLang.alertUnkownDir + dir, "info", false);
                });
                console.error("Unknown directory: " + dir);
                return -1;
            }
        }
        // Check if dirs only include .txt files
        for (let dir of dirs) {
            let files = this.files[dir];
            for (let file of files) {
                if (!(file.endsWith(".txt") || file.endsWith(".json") || file.endsWith(".svg"))) {
                    setTimeout(() => {
                        showMessage(languageManager.currentLang.alertMappingCircuitsError + languageManager.currentLang.alertUnkownFileType + dir + "/" + file, "info", false);
                    });
                    console.error("Unknown file: " + file);
                    return -1;
                }
            }
        }
        // Check validity of files
        let zipName = state.selectedZipDirName;
        for (let dir of dirs) {
            let files = this.files[dir];
            for (let file of files) {
                let [isValid, errorMsgs, warnMsgs] = await state.pyodideAPI.isValidCircuitFile(file, conf.userCircuitsPath + zipName + "/" + dir);
                if (!isValid) {
                    setTimeout(() => {
                        showMessage(languageManager.currentLang.alertErrorInFile + "<br>" +
                            languageManager.currentLang.alertInvalidCircuitFile + dir + "/" + file + "<br>" +
                            errorMsgs, "info", false);
                    });
                    console.error("Invalid circuit file: " + file);
                    return -1;
                }
            }
        }

        return 0;
    }
}