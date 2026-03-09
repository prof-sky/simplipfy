function showWaitingNote() {
    const note = document.getElementById("progress-bar-note");
    note.style.color = colors.current.foreground;
    note.innerHTML = languageManager.currentLang.selector.selectorWaitingNote;
    return note;
}

function disableStartBtnAndSimplifierLink() {
    document.getElementById("nav-select").classList.add("disabled");
    document.getElementById("start-button").classList.add("disabled");
    document.getElementById("start-button").style.animation = "";
}

/**
 * Get all elements (V1, R1, C2, L3, Z4, ...) from the SVG container
 * These elements will get an event listener to be clickable
 * @param svgContainer {HTMLDivElement}
 * @returns {Array<SVGElement>}
 */
function getElementsFromSvgContainer(svgContainer) {
    const pathElements = svgContainer.querySelectorAll('path');
    return Array.from(pathElements).filter(path =>
        (path.getAttribute('class') !== 'na')
        && (path.getAttribute('class') !== null)
        && (path.getAttribute('class') !== 'undefined')
        && (!path.getAttribute('class').includes("arrow")));
}

function getClassAndEmoji(prio) {
    let bootstrapAlert;
    let emoji;
    if (prio === "only2") {
        emoji = window.definitions.onlyChoose2Emojis[Math.floor(Math.random() * window.definitions.onlyChoose2Emojis.length)];
        bootstrapAlert = "warning";
    } else if (prio === "warning") {
        emoji = window.definitions.badEmojis[Math.floor(Math.random() * window.definitions.badEmojis.length)];
        bootstrapAlert = "warning";
    } else if (prio === "success") {
        emoji = window.definitions.goodEmojis[Math.floor(Math.random() * window.definitions.goodEmojis.length)];
        bootstrapAlert = "success";
    } else if (prio === "info") {
        emoji = "";
        bootstrapAlert = "secondary";
    } else if (prio === "danger" || prio === "error") {
        emoji = "";
        bootstrapAlert = "danger";
    } else {
        emoji = "";
        bootstrapAlert = "secondary";
    }
    return {bootstrapAlert, emoji};
}

function createAlert(bootstrapAlert, id = "alert-msg") {
    const msg = document.createElement('div');
    msg.id = id;
    msg.classList.add("alert", `alert-${bootstrapAlert}`);
    msg.style.position = "fixed";
    msg.style.zIndex = "2000";
    msg.style.top = "50%";
    msg.style.left = "50%";
    msg.style.transform = "translate(-50%, -50%)";
    msg.style.width = "90%";
    msg.style.maxWidth = "400px";
    msg.style.textAlign = "center";
    msg.style.maxHeight = "80vh";
    msg.style.overflow = "auto";
    return msg;
}

function removeMsgHandler() {
    let body = document.getElementsByTagName("body")[0];
    let msg = document.getElementById("alert-msg");
    if (document.contains(msg)) {
        body.removeChild(msg);
    }
}

/**
 * @param message {string} message to display
 * @param prio {"warning" | "danger" | "error" | "info"} priority, severity
 * @param autoHide {boolean} true by default, if false message has to be discarded by the user
 * @param id {string} id of the element to use, default is alert-msg
 * */
function showMessage(message, prio = "warning", autoHide = true, id = "alert-msg") {
    let body = document.getElementsByTagName("body")[0];
    let {bootstrapAlert, emoji} = getClassAndEmoji(prio);
    let msg = createAlert(bootstrapAlert, id);


    if (emoji !== "") {
        /** @type {HTMLSpanElement} */
        let emojiSpan = document.createElement('span');
        emojiSpan.style.fontSize = '1.66em';
        emojiSpan.innerHTML = emoji;
        msg.appendChild(emojiSpan);
        msg.appendChild(document.createElement('br'));
    }

    /** @type {HTMLSpanElement} */
    let msgSpan = document.createElement('span');
    if (prio === "error" || prio === "danger") {
        msgSpan.innerHTML = languageManager.currentLang.alerts.error + message;
    } else {
        msgSpan.innerHTML = message;
    }
    msgSpan.style.whiteSpace = "pre-line";
    msg.appendChild(msgSpan);
    body.appendChild(msg);

    // Remove the message when the user clicks anywhere
    if (autoHide) {
        document.addEventListener("click", removeMsgHandler, { once: true });
        // Remove the message after 3 seconds if not clicked already
        setTimeout(() => {
            if (body.contains(msg)) {
                body.removeChild(msg);
            }
        }, 3000);

    } else {
        msg.classList.add("alert-dismissible", "fade", "show");
        const closeButton = document.createElement('button');
        closeButton.classList.add("btn-close");
        closeButton.setAttribute("data-bs-dismiss", "alert");
        closeButton.setAttribute("aria-label", "Close");
        msg.appendChild(closeButton);
    }
}


function setPgrBarTo(percent) {
    let progressBar = document.getElementById("pgr-bar");
    progressBar.style.width = `${percent}%`;
}

function scrollBodyToTop() {
    window.scrollTo(0,0);
}

async function clearSolutionsDir() {
    if (state.pyodideReady) {
        try {
            //An array of file names representing the solution files in the Solutions directory.
            //let solutionFiles = await state.pyodide.FS.readdir(`${conf.pyodide.paths.solutions}`);
            let [status, solutionFiles] = await state.apis.pyodide.readDir(conf.pyodide.paths.solutions);
            solutionFiles.forEach(file => {
                if (file !== "." && file !== "..") {
                    worker.postMessage({action: "unlink", data: {path: `${conf.pyodide.paths.solutions}/${file}`}});
                    //state.pyodide.FS.unlink(`${conf.pyodide.paths.solutions}/${file}`);
                }
            });
        } catch (error) {
            console.trace(error)
            console.log("%cSolutions directory not found or already cleared", "color: gray;");
        }
    }
}

function resetNextElementsTextAndList(nextElementsContainer) {
    const nextElementList = nextElementsContainer.querySelector('ul');
    if (nextElementList) {
        nextElementList.innerHTML = '';
    } else {
        console.warn('nextElementsContainer ul-list not found');
    }
    state.selectedElements = [];
}

function resetHighlightedBoundingBoxes(svgDiv) {
    const boundingBoxes = svgDiv.querySelectorAll('.bounding-box');
    if (boundingBoxes.length > 0) {
        boundingBoxes.forEach(box => box.remove());
    }
}

/** @param circuitSet {CircuitSet} */
function moreThanOneCircuitInSet(circuitSet) {
    return circuitSet.circuitMaps.length > 1;
}

function simplifierPageCurrentlyVisible() {
    return document.getElementById("simplifier-page-container").style.display === "block";
}

function removeLivesAndShowLogo() {
    let logo = document.getElementById("nav-logo");
    logo.hidden = false;
    let heartContainer = document.getElementById("heart-container");
    if (heartContainer !== null) {
        heartContainer.remove();
    }
}

function checkIfSimplifierPageNeedsReset() {
    if (simplifierPageCurrentlyVisible()) {
        // Reset applications
        pageManager.pages.stepwisePage.reset();
        pageManager.pages.kirchhoffPage.reset();
        pageManager.pages.wheatstonePage.reset();
        pageManager.pages.magneticPage.reset();

        // Hide dropdown and lives if gamification is enabled
        /*if (state.gamification) {
            removeLivesAndShowLogo();
            state.extraLiveUsed = false;
        }*/
        resetExtraLiveModal();
        document.getElementById("alert-msg")?.remove();
    }
    if (state.gamification) {
        stopSpeedModeTimer();
        let speedModeBar = document.getElementById("speedModeBar");
        speedModeBar?.remove();
    }
    if (state.sessionId) {
        sendEventToDB(circuitActions.Closing);
        // Reset session ID, finished with circuit
        state.sessionId = null;
    }

}

function resetNextElements(svgDiv, nextElementsContainer) {
    resetHighlightedBoundingBoxes(svgDiv);
    resetNextElementsTextAndList(nextElementsContainer);
}

function whenAvailable(name, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        if (window[name]) {
            callback(window[name]);
        } else {
            whenAvailable(name, callback);
        }
    }, interval);
}

function modalConfig() {
    // This is to prevent the focus from staying on the modal when it is closed
    document.addEventListener('hide.bs.modal', function (event) {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
}

function currentCircuitIsSymbolic() {
    return state.currentCircuitMap.selectorGroup === window.definitions.selectorIDs.symbolic;
}

// TODO, currently only the first source is used!
function getSourceVoltageVal() {
    return state.step0Data.sources[0].U.val;
}

function getSourceCurrentVal() {
    return state.step0Data.sources[0].I.val;
}

function getSourceFrequency() {
    return state.step0Data.sources[0].frequency;
}

function sourceIsAC() {
    return getSourceFrequency() !== "0";
}

function updateStartBtnLoadingPgr(newValue) {
    let startBtns = document.getElementsByClassName("circuitStartBtn");
    for (let btn of startBtns) {
        let rounded = Math.floor(newValue);
        //btn.style.background = `linear-gradient(to right, ${colors.keyYellow} ${Math.floor(newValue)}%, gray ${Math.floor(newValue)}%)`;
        //btn.style.backgroundImage = `linear-gradient(to right, ${colors.keyYellow} ${rounded}%, gray ${rounded}%)`;
        let fillLayer = btn.querySelector(".fill-layer");
        if (fillLayer) {
            fillLayer.style.width = `${rounded}%`;
        }
        let stripeOverlay = btn.querySelector(".progress-stripes");
        if (stripeOverlay) {
            stripeOverlay.style.width = `${rounded}%`;
        }
    }
}

function showSpinnerLoadingCircuit() {
    let contentCol = document.getElementById("content-col");
    let spinner = document.createElement("div");
    spinner.id = "loading-spinner";
    spinner.classList.add("spinner-border", "text-warning", "mt-5");
    spinner.setAttribute("role", "status");
    contentCol.appendChild(spinner);
}

function hideSpinnerLoadingCircuit() {
    let contentCol = document.getElementById("content-col");
    let spinner = contentCol.querySelector("#loading-spinner");
    if (spinner) {
        contentCol.removeChild(spinner);
    }
}

function scrollContainerToTop(div) {
    setTimeout(() => {
        const y = div.getBoundingClientRect().top + window.scrollY;

        const navBar = document.getElementById("navbar");
        let offset = navBar.offsetHeight + 2;  // with a little bit of margin

        window.scrollTo({top: y - offset, behavior: "smooth"});
    }, 100);
}

/** @typedef {"volt" | "total"} ParamMapKeys */
/** @typedef {Map<ParamMapKeys, string>} ParamMap */
/** @returns {ParamMap} */
function createParamMap() {
    /** @type {ParamMap} */
    let paramMap = new Map();
    paramMap.set("volt", languageManager.currentLang.simplifier.voltageSymbol);
    paramMap.set("total", languageManager.currentLang.simplifier.totalSuffix);
    return paramMap;
}

function dataURLtoBlob(dataurl) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function isValidLink(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

/** @param {string} netlist */
async function startFromEditor(netlist){
    console.log(netlist)
    state.currentSelector = externalSelector;
    state.currentCircuitMap = await (new ExternalCircuitMap().initForEditor(netlist))
}

async function startFromQrCode(qrInfo) {


    // hash is something like #sel=selector&net=......
    console.log("Found session ID: " + qrInfo.id);
    state.sessionId = qrInfo.id;
    sendEventToDB(`Scanned QR Code with session ID: ${qrInfo.id}`);

    // Remove hash
    history.replaceState(null, null, window.location.pathname + window.location.search);

    // Decompress netlist
    const netlist = LZString.decompressFromEncodedURIComponent(qrInfo.net);

    pageManager.pages.navigation.disable();
    /** @type {LoadingPyodideNote} */
    let note = pageManager.pages.loadingPyodidePage.content.note
    note.setContent(() => languageManager.currentLang.toolsPage.QRloadingNote)
    pageManager.changePage(pageManager.pages.loadingPyodidePage);

    // write fileContent to a default file in pyodide
    state.currentSelector = externalSelector;
    state.currentCircuitMap = await (new ExternalCircuitMap()).initForScan(netlist);

    if (qrInfo.sel === window.definitions.qrCodeSelectorIDs.stepwise) {
        state.currentCircuitMap.selectorGroup = window.definitions.selectorGroup.simplifier;
    } else if (qrInfo.sel === window.definitions.qrCodeSelectorIDs.kirchhoff) {
        state.currentCircuitMap.selectorGroup = window.definitions.selectorGroup.kirchhoff;
    } else if(qrInfo.sel === window.definitions.qrCodeSelectorIDs.symbolic)  {
        state.currentCircuitMap.selectorGroup = window.definitions.selectorIDs.symbolic;
    } else {
        console.error("Unknown selector: " + qrInfo.sel);
    }

    await awaitVal(
        () => {return state.pyodideReady && state.solvers.stepwise instanceof StepSolverAPI},
        async () => {
            StepwisePage.showSimplifierPage(state.currentCircuitMap);
            pageManager.pages.navigation.enable();
        }
    );
}

function printHello() {
    console.log(`
             ____ ___ __  __ ____  _     ___ ____  _______   __
            / ___|_ _|  \\/  |  _ \\| |   |_ _|  _ \\|  ___\\ \\ / /
            \\___ \\| || |\\/| | |_) | |    | || |_) | |_   \\ V / 
             ___) | || |  | |  __/| |___ | ||  __/|  _|   | |  
            |____/___|_|  |_|_|   |_____|___|_|   |_|     |_|  `);
}

async function loadFile(src){
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.defer = true; // prevents blocking
        s.onload = () => resolve(src);
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
    });
}

function extractCommentsAndNetlist(netlist) {
    // options start with a #, should always be in line 1 and be only one line
    let lines = netlist.split("\n");
    let optionsString = "";
    if (lines[0].trim().startsWith("#")) {
        optionsString = lines[0].trim();
        lines.shift(); // remove first line
    }
    let rawNetlist = lines.join("\n").trim().replaceAll("\r", "");
    return [optionsString, rawNetlist];
}

/**
 * executes a function when a value changes to true
 * @param val {function | boolean} wait until val is true
 * @param fn {function} function to execute when val turns true
 * @param interval {int} checking interval in ms, default = 100
 */
function awaitVal(val, fn, interval = 100) {
    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const condition = typeof val === "function" ? val() : val;

                if (await condition) { // works with promises & functions
                    clearInterval(timer);

                    const result = fn ? await fn() : undefined;
                    resolve(result);
                }
            } catch (err) {
                clearInterval(timer);
                reject(err);
            }
        }, interval);
    });
}
