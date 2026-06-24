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

function scrollBodyToTop() {
    window.scrollTo(0,0);
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

function resetNextElements(svgDiv, nextElementsContainer) {
    resetHighlightedBoundingBoxes(svgDiv);
    resetNextElementsTextAndList(nextElementsContainer);
}

function whenAvailable(name, callback) {
    let interval = 10; // ms
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
    document.addEventListener('hide.bs.modal', function () {
        if (document.activeElement) {
            /** @type {HTMLElement} */
            let a = document.activeElement;
            a.blur();
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
        /** @type {HTMLDivElement} */
        let fillLayer = btn.querySelector(".fill-layer");
        if (fillLayer) {
            fillLayer.style.width = `${rounded}%`;
        }
        /** @type {HTMLDivElement} */
        let stripeOverlay = btn.querySelector(".progress-stripes");
        if (stripeOverlay) {
            stripeOverlay.style.width = `${rounded}%`;
        }
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

/** @param {string} netlist */
async function startFromEditor(netlist){
    console.log(netlist)
    state.currentSelector = externalSelector;
    state.currentCircuitMap = await (new ExternalCircuitMap().initForEditor(netlist))
}

/**
 *
 * @param qrInfo {QrTrackingData}
 * @returns {Promise<void>}
 */
async function startFromQrCode(qrInfo) {


    // hash is something like #sel=selector&net=......
    console.log("Found session ID: " + qrInfo.randomSession);
    state.trackingData.randomSession = qrInfo.randomSession;
    TrackingDB.send(`Scanned QR Code with session ID: ${qrInfo.randomSession}`, qrInfo.randomSession);
    // Remove hash
    history.replaceState(null, null, window.location.pathname + window.location.search);

    // Decompress netlist
    const netlist = qrInfo.netlist.uncompressed;

    pageManager.pages.navigation.disable();
    /** @type {LoadingPyodideNote} */
    let note = pageManager.pages.loadingPyodidePage.content.note
    note.setContent(() => languageManager.currentLang.toolsPage.QRloadingNote)
    pageManager.changePage(pageManager.pages.loadingPyodidePage);

    // write fileContent to a default file in pyodide
    state.currentSelector = externalSelector;
    state.currentCircuitMap = await (new ExternalCircuitMap()).initForScan(netlist);
    state.currentCircuitMap.selectorGroup = ScannedCircuitMap.getSelectorGroupFromQRSelector(qrInfo.qrSelector, netlist)

    storageManager.scannedCircuits.saveCircuit(netlist, qrInfo.randomSession, qrInfo.qrSelector)

    await awaitVal(
        () => {return state.backendReady && state.solvers.stepwise instanceof StepSolverAPI},
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


/**
 *
 * @param toTime {function}
 * @template T
 * @returns {{return: T, time: number}} return is the return value of the toTime function and time is the elapsed time in ms
 */
async function timeThis(toTime){
    const start = Date.now();
    const returnVal = toTime();
    return {return: returnVal, time: Date.now() - start};
}
