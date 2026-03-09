class SvgGenerator extends Content {
    constructor() {
        let idLangMap = new Map([
            ["description-label-svg-generator", () => languageManager.currentLang.toolsPage.svgGeneratorText],
            ["svg-gen-help-btn", () => languageManager.currentLang.toolsPage.helpBtn],
        ]);
        super(idLangMap, "svg-accordion-item");
    }

    get html(){
        return `
            <h2 class="accordion-header" id="svg-gen-acc-heading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#svg-gen-acc-collapse" aria-expanded="false" aria-controls="svg-gen-acc-collapse">
                    ${languageManager.currentLang.toolsPage.svgGeneratorAccHeading}
                </button>
            </h2>
            <div id="svg-gen-acc-collapse" class="accordion-collapse collapse" aria-labelledby="svg-gen-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                    <button class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="svg-gen-help-btn">${languageManager.currentLang.toolsPage.helpBtn}</button>
                    <p id="description-label-svg-generator" style="color: ${colors.current.foreground};">${languageManager.currentLang.toolsPage.svgGeneratorText}</p>
                    <input class="form-control mx-auto" type="file" id="svg-gen-input" accept=".zip"
                    style="width: fit-content; max-width: 350px; color: white; background-color: rgb(33, 37, 41);">
                    <button id="generate-svgs-btn" type="button" class="btn btn-warning circuitStartBtn my-3 disabled">
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>    
                        <span class="button-text">${languageManager.currentLang.toolsPage.generateSvgsBtn}</span>
                    </button>
                    <btn class="btn btn-warning mx-auto" id="download-svgs-btn">${languageManager.currentLang.toolsPage.downloadSvgsBtn}</btn>
                    <a id="download-svg-link" style="display: none;"></a>
                </div>
            </div>
        `
    }

    setup() {
        if (this.isSetUp === true) return;

        let accSvgItem = document.createElement("div");
        accSvgItem.classList.add("accordion-item");
        accSvgItem.id = this.mainID;
        accSvgItem.innerHTML = this.html;
        this.isSetUp = true;

        return accSvgItem;
    }

    updateLang() {
        super.updateLang();

        let svgAccHeading = document.getElementById('svg-gen-acc-heading');
        svgAccHeading.querySelector("button").innerHTML = languageManager.currentLang.toolsPage.svgGeneratorAccHeading;

        let downloadSvg = document.getElementById('download-svgs-btn');
        downloadSvg.innerHTML = languageManager.currentLang.toolsPage.downloadSvgsBtn;
    }

    updateColor() {
        let fileInput = document.getElementById("svg-gen-input");
        if (fileInput) {
            fileInput.style.backgroundColor = colors.current.bsBackground;
            fileInput.style.color = colors.current.foreground;
        }
        let descriptionLabel = document.getElementById("description-label-svg-generator");
        if (descriptionLabel) {
            descriptionLabel.style.color = colors.current.foreground;
        }
        let whyNote = document.getElementById("svg-gen-help-btn");
        if (whyNote) {
            whyNote.style.color = colors.current.foreground;
        }
    }

    addEventListeners() {
        const input = document.getElementById("svg-gen-input");
        const genBtn = document.getElementById("generate-svgs-btn");
        const downloadBtn = document.getElementById("download-svgs-btn");
        input.addEventListener("change", (event) => {
            state.selectedSvgsZip = event.target.files[0];
            if (state.pyodideReady) {
                genBtn.classList.remove("disabled");
            }
            this.#hideDownloadButton();
        });
        genBtn.addEventListener("click", async (event) => {
            genBtn.classList.add("disabled");
            await this.#generateSvgsGenHandler(); // also adds downloadBtn event listener
        });
        let helpBtn = document.getElementById("svg-gen-help-btn");
        helpBtn.addEventListener("click", () => {
            setTimeout(() => {
                showMessage(languageManager.currentLang.toolsPage.helpTexts.svgGen, "info", false);
            });
        });
    }

    async #generateSvgsGenHandler() {
        if (state.selectedSvgsZip === null || state.selectedSvgsZip === undefined) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alerts.noDirSelected, "info");
            });
            return;
        }
        document.getElementById("svg-gen-input").value = "";
        await this.#loadSvgZipIntoPyodide(state.selectedSvgsZip);
        let path = conf.tools.svgGen.paths.dir + "/" + state.selectedSvgsZip.name.replace(".zip", "").replace(" ", "_");

        let startBtn = document.getElementById("generate-svgs-btn");
        await state.apis.pyodide.initSVGGenerator(path); // path to folder
        let files = await state.apis.pyodide.getCircuitFiles(); // get all files in dir (only .txt circuit files, no svgs/json)
        let len = files.length;
        let pgr = 0;
        let pgrPercent = 0;
        for (let file of files) {
            await state.apis.pyodide.generateSvgFile(file); // generate svg for each file
            // update pgr
            pgr += 1;
            pgrPercent = Math.round((pgr / len) * 100);
            startBtn.querySelector("span").innerHTML = `[${pgrPercent}] - ${file}`;
        }

        startBtn.querySelector("span").innerHTML = languageManager.currentLang.toolsPage.generateSvgsBtn;
        this.#showDownloadButton();
        // Add event listener every time so once can be set true (fixes double click issues)
        document.getElementById("download-svgs-btn").addEventListener("click", async () => {
            await this.#zipDownloadHandler();
        }, {once: true});
    }

    #showDownloadButton() {
        const downloadBtn = document.getElementById('download-svgs-btn');

        // Reset state in case it's already visible
        downloadBtn.classList.remove('dropped');
        downloadBtn.classList.remove("disabled");
        void downloadBtn.offsetWidth; // force reflow to restart animation

        downloadBtn.style.display = 'block';
        downloadBtn.classList.add('dropped');
    }

    #hideDownloadButton() {
        const downloadBtn = document.getElementById('download-svgs-btn');
        downloadBtn.classList.remove('dropped');
        setTimeout(() => {
            downloadBtn.style.display = 'none';
        }, 600); // after animation
    }

    async #zipDownloadHandler() {
        let downloadBtn = document.getElementById("download-svgs-btn");
        downloadBtn.classList.add("disabled");
        this.#hideDownloadButton();
        let dirName = state.selectedSvgsZip.name.replace(" ", "_"); // with .zip ending
        let dirPath = conf.tools.svgGen.paths.dir + "/" +  dirName;
        await state.apis.pyodide.zipFiles(dirPath.replace(".zip", ""));
        let data = await state.apis.pyodide.readFile(dirPath, "binary"); // read existing zip file (binary for zip)
        await state.apis.pyodide.deleteFile(dirPath); // remove dir after reading (delete zip just like file)

        let blob = new Blob([data], {type: "application/zip"});

        let internalLink = document.getElementById("download-svg-link"); // not visible to user
        let url = URL.createObjectURL(blob);
        internalLink.href = url;
        internalLink.download = dirName;
        internalLink.click();
        URL.revokeObjectURL(url);
        state.selectedSvgsZip = null;
    }

    async #loadSvgZipIntoPyodide(file) {
        let arrayBuffer;
        let zipDirName;
        let status;

        // Check if dir for user svgs exists
        let dirs_;
        [status, dirs_] = await state.apis.pyodide.readDir(conf.pyodide.paths.workingDir);
        if (!dirs_.includes(conf.tools.svgGen.names.dir)) {
            await state.apis.pyodide.mkdir(conf.tools.svgGen.paths.dir);
        }
        // Check if dir for this circuit.zip name already exists
        zipDirName = file.name.replace(".zip", "").replace(" ", "_");
        let dirs;
        [status, dirs] = await state.apis.pyodide.readDir(conf.tools.svgGen.paths.dir);
        if (dirs.includes(zipDirName)) {
            // Dir exists, delete it
            await state.apis.pyodide.recursiveRmdir(conf.tools.svgGen.paths.dir + zipDirName);
        }
        // Unpack new dir
        arrayBuffer = await file.arrayBuffer();

        // Define storage path for user dirs
        let options = Object.assign({}, {extractDir: conf.tools.svgGen.paths.dir});
        // Load the array buffer into pyodide
        await state.apis.pyodide.unpackArchive(arrayBuffer, ".zip", options);
    }
}