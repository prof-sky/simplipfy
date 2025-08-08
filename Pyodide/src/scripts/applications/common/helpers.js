function showWaitingNote() {
    const note = document.getElementById("progress-bar-note");
    note.style.color = colors.currentForeground;
    note.innerHTML = languageManager.currentLang.selectorWaitingNote;
    return note;
}

function enableStartBtnAndSimplifierLink() {
    document.getElementById("nav-select").classList.remove("disabled");
    document.getElementById("start-button").classList.remove("disabled");
    document.getElementById("start-button").style.animation = "pulse 2s infinite";
}

function disableStartBtnAndSimplifierLink() {
    document.getElementById("nav-select").classList.add("disabled");
    document.getElementById("start-button").classList.add("disabled");
    document.getElementById("start-button").style.animation = "";
}

/**
 * Get all elements (V1, R1, C2, L3, Z4, ...) from the SVG container
 * These elements will get an event listener to be clickable
 * @param svgContainer
 * @returns {unknown[]}
 */
function getElementsFromSvgContainer(svgContainer) {
    const pathElements = svgContainer.querySelectorAll('path');
    return Array.from(pathElements).filter(path =>
        (path.getAttribute('class') !== 'na')
        && (path.getAttribute('class') !== null)
        && (path.getAttribute('class') !== 'undefined')
        && (!path.getAttribute('class').includes("arrow")));
}

function sanitizeSelector(selector) {
    return selector.replace(/[^\w-]/g, '_');
}

function hideAllSelectors() {
    for (const circuitSet of circuitMapper.circuitSets) {
        const carousel = document.getElementById(`${circuitSet.identifier}-carousel`);
        const heading = document.getElementById(`${circuitSet.identifier}-heading`);
        carousel.hidden = true;
        heading.hidden = true;
    }
}

function hideQuickstart() {
    document.getElementById("quick-carousel").hidden = true;
    document.getElementById("quick-heading").hidden = true;
}

function hideAccordion() {
    document.getElementById("selector-accordion").hidden = true;
}

function showQuickstart() {
    document.getElementById("quick-carousel").hidden = false;
    document.getElementById("quick-heading").hidden = false;
}

function showAccordion() {
    document.getElementById("selector-accordion").hidden = false;
}

function showAllSelectors() {
    for (const circuitSet of circuitMapper.circuitSets) {
        const carousel = document.getElementById(`${circuitSet.identifier}-carousel`);
        const heading = document.getElementById(`${circuitSet.identifier}-heading`);
        carousel.hidden = false;
        heading.hidden = false;
    }
}

function getClassAndEmoji(prio) {
    let bootstrapAlert;
    let emoji;
    if (prio === "only2") {
        emoji = onlyChoose2Emojis[Math.floor(Math.random() * onlyChoose2Emojis.length)];
        bootstrapAlert = "warning";
    } else if (prio === "warning") {
        emoji = badEmojis[Math.floor(Math.random() * badEmojis.length)];
        bootstrapAlert = "warning";
    } else if (prio === "success") {
        emoji = goodEmojis[Math.floor(Math.random() * goodEmojis.length)];
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
    return msg;
}

function removeMsgHandler() {
    let body = document.getElementsByTagName("body")[0];
    let msg = document.getElementById("alert-msg");
    if (document.contains(msg)) {
        body.removeChild(msg);
    }
}

function showMessage(message, prio = "warning", autoHide = true, id = "alert-msg") {
    let body = document.getElementsByTagName("body")[0];
    let {bootstrapAlert, emoji} = getClassAndEmoji(prio);
    let msg = createAlert(bootstrapAlert, id);

    if (emoji !== "") {
        let emojiSpan = document.createElement('span');
        emojiSpan.style.fontSize = '1.66em';
        emojiSpan.innerHTML = emoji;
        msg.appendChild(emojiSpan);
        msg.appendChild(document.createElement('br'));
    }

    let msgSpan = document.createElement('span');
    if (prio === "error" || prio === "danger") {
        msgSpan.innerHTML = languageManager.currentLang.alertError + message;
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

function clearSimplifierPageContainer() {
    const contentCol = document.getElementById("content-col");
    contentCol.innerHTML = '';

    const landingPage = document.getElementById("landing-page-container");
    const simplifierPage = document.getElementById("simplifier-page-container");
    const uploadPage = document.getElementById("upload-page-container");
    const selectorPage = document.getElementById("select-page-container");
    const toolPage = document.getElementById("tool-page-container");
    landingPage.classList.remove("slide-in-right");
    simplifierPage.classList.remove("slide-in-right");
    uploadPage.classList.remove("slide-in-right");
    toolPage.classList.remove("slide-in-right");
    selectorPage.classList.remove("slide-out-left");
    selectorPage.style.opacity = "1";
}

function scrollBodyToTop() {
    window.scrollTo(0,0);
}

async function clearSolutionsDir() {
    if (state.pyodideReady) {
        try {
            //An array of file names representing the solution files in the Solutions directory.
            //let solutionFiles = await state.pyodide.FS.readdir(`${conf.pyodideSolutionsPath}`);
            let [status, solutionFiles] = await state.pyodideAPI.readDir(conf.pyodideSolutionsPath);
            solutionFiles.forEach(file => {
                if (file !== "." && file !== "..") {
                    worker.postMessage({action: "unlink", data: {path: `${conf.pyodideSolutionsPath}/${file}`}});
                    //state.pyodide.FS.unlink(`${conf.pyodideSolutionsPath}/${file}`);
                }
            });
        } catch (error) {
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

function moreThanOneCircuitInSet(circuitSet) {
    return circuitSet.set.length > 1;
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
        resetSimplifierPage();
        resetKirchhoffPage();

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

function closeNavbar() {
    const navbarToggler = document.getElementById("nav-toggler");
    navbarToggler.classList.add("collapsed");
    const navDropdown = document.getElementById("navbarSupportedContent");
    navDropdown.classList.remove("show");

    pageManager.updatePagesOpacity();
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

function setLanguageAndScheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkModeSwitch = document.getElementById("darkmode-switch");
    darkModeSwitch.checked = true;
    if (!prefersDark) {
        changeToLightMode();
        darkModeSwitch.checked = false;
    } else {
        changeToDarkMode(); // This is set by default, but it's a good idea for testing purposes to do it anyway
    }

    // Check if a language is cached
    const cachedLang = localStorage.getItem("language");
    if (cachedLang === null) {
        // Use browser language
        var userLang = navigator.language;
        if (userLang === "de-DE" || userLang === "de-AT" || userLang === "de-CH" || userLang === "de") {
            languageManager.currentLang = german;
        } else {
            languageManager.currentLang = english;
        }
    } else {
        // Use cached language
        if (cachedLang === germanShortSymbol) {
            languageManager.currentLang = german;
        } else if (cachedLang === frenchShortSymbol) {
            languageManager.currentLang = french;
        } else {
            console.warn("Cached language not recognized, using default (English)");
            languageManager.currentLang = english;
        }
    }
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
    return state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.symbolic;
}

function setBodyPaddingForFixedTopNavbar() {
    const navBar = document.getElementById("navbar");
    let height = navBar.offsetHeight;
    const body = document.getElementsByTagName("body")[0];
    body.style.paddingTop = height + "px";
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

function finishStartBtns() {
    let startBtns = document.getElementsByClassName("circuitStartBtn");
    for (let btn of startBtns) {
        btn.style.backgroundColor = colors.keyYellow;
        let fillLayer = btn.querySelector(".fill-layer");
        if (fillLayer) {
            fillLayer.remove();
        }
        let stripeOverlay = btn.querySelector(".progress-stripes");
        if (stripeOverlay) {
            stripeOverlay.remove();
        }
        // For upload button and scanned start btn
        if (btn.classList.contains("disabled")) {
            btn.classList.remove("disabled");
        }
    }
}

function enableNetlistEditor() {
    // Netlist progress bar
    let div = document.getElementById("drawing-field-div");
    if (div) {
        div.innerHTML = languageManager.currentLang.startTyping; // Replace pgr bar with text
    }
    let editor = document.getElementsByClassName("CodeMirror")[0];
    if (editor) {
        editor.style.backgroundColor = "white";
        editor.CodeMirror.setOption("readOnly", false);
    }
    // Enable checkboxes
    let checkboxes = document.querySelectorAll(".form-check-input.netlist-comment");
    checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
    });
}

function enableBlockedStuff() {
    finishStartBtns(); // including all progress bars for pyodide
    enableNetlistEditor();
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

function createNextCircuitButton() {
    let nextCircuitBtn = document.createElement("button");
    nextCircuitBtn.id = "nextCircuitBtn";
    nextCircuitBtn.classList.add("btn", "btn-primary", "mt-3", "mx-auto");
    nextCircuitBtn.style.backgroundColor = colors.keyYellow;
    nextCircuitBtn.style.border = "none";
    nextCircuitBtn.style.color = colors.keyDark;
    nextCircuitBtn.style.width = "fit-content";
    nextCircuitBtn.innerHTML = languageManager.currentLang.nextCircuit;

    nextCircuitBtn.addEventListener("click", () => {

        circuitMapper.setNextCircuitMap(state.currentCircuitMap);

        if (state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.kirchhoff) {
            resetKirchhoffPage();
            startKirchhoff();
        } else {
            resetSimplifierPage();
            startSimplifier();
        }
    });
    return nextCircuitBtn;
}

// Old, remove if surely not needed anymore
function checkDownloadLinkAndShowNote() {
    let downloadLink = window.location.hash.substring(1); // remove #

    if (downloadLink !== "" && downloadLink !== undefined) {
        if (!isValidLink(downloadLink)) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertNoValidLinkCheck, "info", false);
            });
            return;
        }
        setTimeout(() => {
            // Show download note, _blank target for new tab
            showMessage(`<h3>Download zip</h3><br><p class="mb-0" style="word-wrap: break-word">${languageManager.currentLang.downloadInfoMsg}(${downloadLink})</p>
            <div class='container d-flex justify-content-center' style="gap: 15px;">
                <btn class='btn btn-secondary' id='noDownload' style='color:white'>${languageManager.currentLang.no}</btn>
                <a class='btn btn-warning' id='download' style='color:#222' href='${downloadLink}' target='_blank'>${languageManager.currentLang.yes}</a>
            </div>`, "info", false, "download-note");

            // Yes clicked, remove note, set isLinkedZip to true, show upload page
            document.getElementById("download").addEventListener("click", () => {
                document.getElementById("download-note")?.remove();
                state.isLinkedZip = true;
                setTimeout(() => {
                    pageManager.showUploadPage()
                }, 1000);
                // Let landing page start button link to upload page instead of selector page
                let startBtn = document.getElementById("start-button");
                startBtn.addEventListener("click", async () => {
                    pageManager.showUploadPage();
                });
            });
            // No clicked, remove note, set isLinkedZip to false
            document.getElementById("noDownload").addEventListener("click", () => {
                document.getElementById("download-note")?.remove();
                state.isLinkedZip = false;
            });

            // Remove hash from url
            history.replaceState(null, null, window.location.pathname + window.location.search);
        });
    }
}

function createParamMap() {
    let paramMap = new Map();
    paramMap.set("volt", languageManager.currentLang.voltageSymbol);
    paramMap.set("total", languageManager.currentLang.totalSuffix);
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

async function parseHashAndStartCircuit(hash) {
    // hash is something like #sel=selector&net=......
    const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleanHash);
    const sessionId = params.get("id") || null;
    const selector = params.get("sel") || null;
    const compressed = params.get("net") || null;

    if (sessionId) {
        console.log("Found session ID: " + sessionId);
        state.sessionId = sessionId;
        sendEventToDB(`Scanned QR Code with session ID: ${sessionId}`);
    }

    if (selector === null || compressed === null) {
        console.error("No selector or netlist found in hash");
        showMessage(languageManager.currentLang.selOrNetNull, "error", false);
        return;
    }

    // Remove hash
    history.replaceState(null, null, window.location.pathname + window.location.search);

    // Decompress netlist
    const netlist = LZString.decompressFromEncodedURIComponent(compressed);

    setTimeout(() => {showMessage(languageManager.currentLang.QRloadingNote,
        "info", false, "waiting-note-backend")}, 1000);

    // Show loading page, add pyodide progress bar
    clearSimplifierPageContainer();
    let contentCol = document.getElementById("content-col");
    contentCol.innerHTML =
        `<div class="circuitStartBtn mx-auto" style="height: 10px;">
            <div class="fill-layer"></div>
            <div class="progress-stripes"></div>
        </div>`;
    pageManager.showSimplifierPage();

    // Disable burger navigation
    let btn = document.getElementById("nav-toggler");
    if (btn) {
        btn.disabled = true;
    }
    // Remove event listener from logo by cloning it
    let logo = document.getElementById("nav-logo");
    if (logo) {
        let newLogo = logo.cloneNode(true);
        logo.parentNode.replaceChild(newLogo, logo);
        logo = newLogo; // Update logo variable to the new logo
    }

    // Wait for pyodide to be ready before continuing
    while (!state.pyodideReady) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Close Message
    let msg = document.getElementById("waiting-note-backend");
    if (msg) {
        msg.remove();
    }

    // write fileContent to a default file in pyodide
    let defaultFileName = "scannedNetlist.txt";
    await state.pyodideAPI.writeFile(`/home/pyodide/${defaultFileName}`, netlist);
    state.currentCircuitMap = {
        circuitDivID: `scanned-circuit-div`,
        btn: `scanned-circuit-btn`,
        btnOverlay: `scanned-circuit-overlay`,
        circuitFile: defaultFileName,
        sourceDir: "",
        svgFile: "",
        selectorGroup: "",
        overViewSvgFile: "",
        voltage: "",
        frequency: ""
    };

    if (selector === simplifierQRSelector) {
        state.currentCircuitMap.selectorGroup = circuitMapper.selectorIds.simplifier;
    } else if (selector === kirchhoffQRSelector) {
        state.currentCircuitMap.selectorGroup = circuitMapper.selectorIds.kirchhoff;
    } else {
        console.error("Unknown selector: " + selector);
    }

    await selectorBuilder.circuitSelectorStartButtonPressed(state.currentCircuitMap, true);
    // Enable burger navigation again
    btn.disabled = false;
    // Add event listener to logo again
    logo.addEventListener("click", () => {
        checkIfSimplifierPageNeedsReset();
        closeNavbar();
        pageManager.showLandingPage();
    })
}

function saveFinishedCircuitAndUpdateSelectorCounters() {
    let identifier = state.currentCircuitMap.selectorGroup;

    // Handling wheatstone options
    if (state.currentCircuitMap.selectorGroup === circuitMapper.selectorIds.wheatstone) {
        // Add option to storage doneCircuits-wheat
        // Option name = option_{state.currentOption}
        let doneCircuits = JSON.parse(localStorage.getItem(`doneCircuits-${identifier}`)) || [];
        let optionName = `option_${state.currentOption}`;
        if (doneCircuits.includes(optionName)) {
            return; // already finished once
        }
        doneCircuits.push(optionName);
        localStorage.setItem(`doneCircuits-${identifier}`, JSON.stringify(doneCircuits));
    } else {
        // Rest of selector groups if not quickstart
        if (state.currentCircuitMap.selectorGroup !== circuitMapper.selectorIds.quick) {
            // Add circuitfilename to storage doneCircuits-identifier
            let doneCircuits = JSON.parse(localStorage.getItem(`doneCircuits-${identifier}`)) || [];
            if (doneCircuits.includes(state.currentCircuitMap.circuitFile)) {
                return; // already finished once
            }
            doneCircuits.push(state.currentCircuitMap.circuitFile);
            localStorage.setItem(`doneCircuits-${identifier}`, JSON.stringify(doneCircuits));
        }
    }
    selectorBuilder.updateSelectorCounters();
}

function printHello() {
    console.log(`
             ____ ___ __  __ ____  _     ___ ____  _______   __
            / ___|_ _|  \\/  |  _ \\| |   |_ _|  _ \\|  ___\\ \\ / /
            \\___ \\| || |\\/| | |_) | |    | || |_) | |_   \\ V / 
             ___) | || |  | |  __/| |___ | ||  __/|  _|   | |  
            |____/___|_|  |_|_|   |_____|___|_|   |_|     |_|  `);
}