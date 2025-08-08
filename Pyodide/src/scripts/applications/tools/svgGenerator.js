function createSvgGeneratorItem() {
    let accSvgItem = document.createElement("div");
    accSvgItem.classList.add("accordion-item");
    accSvgItem.id = "svg-accordion-item";
    accSvgItem.innerHTML = getSvgGeneratorHTML();
    return accSvgItem;
}

function addSvgGeneratorEventlisteners() {
    const input = document.getElementById("svg-gen-input");
    const genBtn = document.getElementById("generate-svgs-btn");
    const downloadBtn = document.getElementById("download-svgs-btn");
    input.addEventListener("change", (event) => {
        state.selectedSvgsZip = event.target.files[0];
        if (state.pyodideReady) {
            genBtn.classList.remove("disabled");
        }
        hideDownloadButton();
    });
    genBtn.addEventListener("click", async (event) => {
        genBtn.classList.add("disabled");
        await generateSvgsGenHandler(); // also adds downloadBtn event listener
    });
    let helpBtn = document.getElementById("svg-gen-help-btn");
    helpBtn.addEventListener("click", () => {
        setTimeout(() => {
            showMessage(languageManager.currentLang.helpSvgGen, "info", false);
        });
    });
}

async function generateSvgsGenHandler() {
    if (state.selectedSvgsZip === null || state.selectedSvgsZip === undefined) {
        setTimeout(() => {
            showMessage(languageManager.currentLang.alertNoDirSelected, "info");
        });
        return;
    }
    document.getElementById("svg-gen-input").value = "";
    await loadSvgZipIntoPyodide(state.selectedSvgsZip);
    let path = conf.userSvgPath + state.selectedSvgsZip.name.replace(".zip", "").replace(" ", "_");

    let startBtn = document.getElementById("generate-svgs-btn");
    await state.pyodideAPI.initSVGGenerator(path); // path to folder
    let files = await state.pyodideAPI.getCircuitFiles(); // get all files in dir (only .txt circuit files, no svgs/json)
    let len = files.length;
    let pgr = 0;
    let pgrPercent = 0;
    for (let file of files) {
        await state.pyodideAPI.generateSvgFile(file); // generate svg for each file
        // update pgr
        pgr += 1;
        pgrPercent = Math.round((pgr / len) * 100);
        startBtn.querySelector("span").innerHTML = `[${pgrPercent}] - ${file}`;
    }

    startBtn.querySelector("span").innerHTML = languageManager.currentLang.generateSvgsBtn;
    showDownloadButton();
    // Add event listener every time so once can be set true (fixes double click issues)
    document.getElementById("download-svgs-btn").addEventListener("click", async () => {
        await zipDownloadHandler();
    }, {once: true});
}

function showDownloadButton() {
    const downloadBtn = document.getElementById('download-svgs-btn');

    // Reset state in case it's already visible
    downloadBtn.classList.remove('dropped');
    downloadBtn.classList.remove("disabled");
    void downloadBtn.offsetWidth; // force reflow to restart animation

    downloadBtn.style.display = 'block';
    downloadBtn.classList.add('dropped');
}

function hideDownloadButton() {
    const downloadBtn = document.getElementById('download-svgs-btn');
    downloadBtn.classList.remove('dropped');
    setTimeout(() => {
        downloadBtn.style.display = 'none';
    }, 600); // after animation
}

async function zipDownloadHandler() {
    let downloadBtn = document.getElementById("download-svgs-btn");
    downloadBtn.classList.add("disabled");
    hideDownloadButton();
    let dirName = state.selectedSvgsZip.name.replace(" ", "_"); // with .zip ending
    let dirPath = conf.userSvgPath + dirName;
    await state.pyodideAPI.zipFiles(dirPath.replace(".zip", ""));
    let data = await state.pyodideAPI.readFile(dirPath, "binary"); // read existing zip file (binary for zip)
    await state.pyodideAPI.deleteFile(dirPath); // remove dir after reading (delete zip just like file)

    let blob = new Blob([data], {type: "application/zip"});

    let internalLink = document.getElementById("download-svg-link"); // not visible to user
    let url = URL.createObjectURL(blob);
    internalLink.href = url;
    internalLink.download = dirName;
    internalLink.click();
    URL.revokeObjectURL(url);
    state.selectedSvgsZip = null;
}

async function loadSvgZipIntoPyodide(file) {
    let arrayBuffer;
    let zipDirName;
    let status;

    // Check if dir for user svgs exists
    let dirs_;
    [status, dirs_] = await state.pyodideAPI.readDir(conf.pyodideUserCircuitBasePath);
    if (!dirs_.includes(conf.userSvgDirName)) {
        await state.pyodideAPI.mkdir(conf.userSvgPath);
    }
    // Check if dir for this circuit.zip name already exists
    zipDirName = file.name.replace(".zip", "").replace(" ", "_");
    let dirs;
    [status, dirs] = await state.pyodideAPI.readDir(conf.userSvgPath);
    if (dirs.includes(zipDirName)) {
        // Dir exists, delete it
        await state.pyodideAPI.recursiveRmdir(conf.userSvgPath + zipDirName);
    }
    // Unpack new dir
    arrayBuffer = await file.arrayBuffer();

    // Define storage path for user dirs
    let options = Object.assign({}, {extractDir: conf.userSvgPath});
    // Load the array buffer into pyodide
    await state.pyodideAPI.unpackArchive(arrayBuffer, ".zip", options);
}

function getSvgGeneratorHTML() {
    return `
            <h2 class="accordion-header" id="svg-gen-acc-heading">
                <button class="accordion-button collapsed" style="flex-direction: column; padding-bottom: 0;" type="button" data-bs-toggle="collapse" data-bs-target="#svg-gen-acc-collapse" aria-expanded="false" aria-controls="svg-gen-acc-collapse">
                    ${languageManager.currentLang.svgGeneratorHeading}
                </button>
            </h2>
            <div id="svg-gen-acc-collapse" class="accordion-collapse collapse" aria-labelledby="svg-gen-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                    <p style="color: ${colors.currentHeadingsForeground}; cursor: pointer;" id="svg-gen-help-btn">${languageManager.currentLang.helpBtn}</p>
                    <p id="description-label-svg-generator" style="color: ${colors.currentForeground};">${languageManager.currentLang.svgGeneratorText}</p>
                    <input class="form-control mx-auto" type="file" id="svg-gen-input" accept=".zip"
                    style="width: fit-content; max-width: 350px; color: white; background-color: rgb(33, 37, 41);">
                    <button id="generate-svgs-btn" type="button" class="btn btn-warning circuitStartBtn my-3 disabled">
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>    
                        <span class="button-text">${languageManager.currentLang.generateSvgsBtn}</span>
                        </button>
                    <btn class="btn btn-warning mx-auto" id="download-svgs-btn">${languageManager.currentLang.downloadSvgsBtn}</btn>
                    <a id="download-svg-link" style="display: none;"></a>
                </div>
            </div>`;
}