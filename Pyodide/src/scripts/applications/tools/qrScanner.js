function createScannerItem() {
    let accScannerItem = document.createElement("div");
    accScannerItem.classList.add("accordion-item");
    accScannerItem.id = "scanner-accordion-item";
    let qrCodeScanner = createQrCodeScanner();
    accScannerItem.innerHTML = getQRCodeScannerHTML();
    accScannerItem.querySelector(".accordion-body").appendChild(qrCodeScanner);
    return accScannerItem;
}

function addQrCodeScannerEventlisteners() {
    // If DOM is loaded, execute, otherwise wait for it
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {qrCodeHandler();});
    } else {
        qrCodeHandler();
    }
    let helpBtn = document.getElementById("help-qr-scan");
    helpBtn.addEventListener("click", () => {
        setTimeout(() => {
            showMessage(languageManager.currentLang.helpQrScanText, "info", false);
        });
    });
}

function getQRCodeScannerHTML() {
    return `
            <h2 class="accordion-header" id="qr-scan-acc-heading">
                <button class="accordion-button collapsed" style="flex-direction: column; padding-bottom: 0;" type="button" data-bs-toggle="collapse" data-bs-target="#qr-scan-acc-collapse" aria-expanded="false" aria-controls="qr-scan-acc-collapse">
                    ${languageManager.currentLang.scanQRCodeHeading}
                </button>
            </h2>
            <div id="qr-scan-acc-collapse" class="accordion-collapse collapse" aria-labelledby="qr-scan-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                <p style="color: ${colors.currentHeadingsForeground}; cursor: pointer;" id="help-qr-scan">${languageManager.currentLang.helpBtn}</p>
                </div>
            </div>`;
}

function createQrCodeScanner() {
    let qrCodeScanner = document.createElement("div");
    qrCodeScanner.id = "qr-code-scanner";
    qrCodeScanner.classList.add("mb-3");
    qrCodeScanner.innerHTML = `
            <div id="preview" class="mx-auto" style="width: 100%; max-width: 350px; height: auto;"></div>
            <button id="scan-qr-code-btn" type="button" class="btn btn-warning my-3 circuitStartBtn disabled">
                        <div class="fill-layer"></div>
                        <div class="progress-stripes"></div>    
                        <span class="button-text">${languageManager.currentLang.scanQrCodeBtn}</span>
            </button>
            <button id="stop-qr-code-btn" class="btn btn-secondary" hidden>stop</button>
            <div id="qr-code-result"></div>`;
    return qrCodeScanner;
}

function qrCodeHandler() {
    const qrCodeScanner = document.getElementById("qr-code-scanner");
    const scanBtn = qrCodeScanner.querySelector("#scan-qr-code-btn");
    const stopBtn = qrCodeScanner.querySelector("#stop-qr-code-btn");
    const resultContainer = qrCodeScanner.querySelector("#qr-code-result");
    const preview = qrCodeScanner.querySelector("#preview");
    if (state.pyodideReady && scanBtn.classList.contains("disabled")) {
        scanBtn.classList.remove("disabled");
    }
    scanBtn.addEventListener("click", () => {
        scanHandler(qrCodeScanner, scanBtn, stopBtn, resultContainer);
    });

    // Stop scanner if preview is not visible (page switch or accordion closed)
    const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting && state.html5QrCode && state.isScanning) {
            state.html5QrCode.stop().then(() => {
                stopBtn.hidden = true;
                scanBtn.hidden = false;
                state.isScanning = false;
            });
        }
    }, {threshold: 0.1});
    observer.observe(preview);
    // Stop scanner if tab is not visible (browser minimized or tab switched)
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && state.html5QrCode && state.isScanning) {
            state.html5QrCode.stop().then(() => {
                stopBtn.hidden = true;
                state.isScanning = false;
            }).catch(err => {
                console.error("Error stopping QR Code scanner", err);
            });
        }
    });
    // Stop scanner if button is clicked
    stopBtn.addEventListener("click", () => {
        if (state.html5QrCode && state.isScanning) {
            state.html5QrCode.stop().then(() => {
                state.isScanning = false;
                stopBtn.hidden = true;
                scanBtn.hidden = false;
            }).catch((err) => {
                console.error("Error stopping QR Code scanner", err);
            });
        }
    });
}

function scanHandler(qrCodeScanner, scanBtn, stopBtn, resultContainer) {
    // return if already scanning or <video> in preview
    if (state.isScanning || qrCodeScanner.querySelector("#preview video")) {
        return;
    }

    state.isScanning = true;
    state.html5QrCode = new Html5Qrcode("preview");

    state.html5QrCode.start(
        {facingMode: getCameraFacingMode()},
        {
            fps: 10,
            qrbox: 250,
        },
        async (decodedText, decodedResult) => {
            console.log("Scanned QR Code:", decodedText);
            state.html5QrCode.stop().then(() => {
                console.log("Scanner stopped");
                state.isScanning = false;
                stopBtn.hidden = true;
                scanBtn.hidden = false;
            });
            let [selector, netlist] = cleanQRCodeLink(decodedText);
            if (selector === null || netlist === null) {
                state.isScanning = false;
                return;
            }
            // QR Code scanned, check for syntax and start if valid
            if (await checkIfQRCodeValidNetlist(netlist)) {
                prepareCircuitStart(selector, netlist);
            }
        },
        (errorMessage) => {
            // Ignore (no qr code scanned)
        }
    ).then(() => {
        scanBtn.hidden = true;
        stopBtn.hidden = false;
    }).catch((err) => {
        state.isScanning = false;
        console.error("QR Code start failed", err);
        resultContainer.innerText = languageManager.currentLang.errorStartingCamera;
    });
}

function cleanQRCodeLink(decodedText) {
    // QR Code contains a link like https://simplipfy.org/#sel=si&net=...
    // We only want the selector and netlist here
    let hash = decodedText.split("#")[1]; // get everything after the #
    const params = new URLSearchParams(hash);
    const sessionId = params.get("id") || null;
    const selector = params.get("sel") || null;
    const compressed = params.get("net") || null;

    if (sessionId) {
        console.log("Found session ID: " + sessionId);
        state.sessionId = sessionId;
        sendEventToDB(`Scanned QR Code with session ID: ${sessionId}`);
    }

    if (selector === null || compressed === null) {
        console.error("QR Code does not contain a selector or netlist");
        setTimeout(() => {showMessage(languageManager.currentLang.selOrNetNull, "error", false, );});
        return [null, null];
    }
    // Decode the netlist from LZString
    const netlist = LZString.decompressFromEncodedURIComponent(compressed);
    return [selector, netlist];
}

function getCameraFacingMode() {
    if (isMobileOrTablet()) {
        return "environment"; // back camera
    } else {
        return "user"; // front camera
    }
}

function isMobileOrTablet() {
    // from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

async function checkIfQRCodeValidNetlist(netlist) {
    let [isValid, errMsgs, warnMsgs] = await state.pyodideAPI.isValidCircuitString(netlist);
    if (!isValid) {
        console.error("Invalid netlist in QR code");
        console.error(errMsgs);
        console.log(warnMsgs);
        setTimeout(() => {
            showMessage(languageManager.currentLang.invalidQRCode + "<br>" + languageManager.currentLang.alertInvalidCircuitFile,"info", false);
        });
        return false;
    }
    return true;
}

function prepareCircuitStart(selector, netlist) {
    // Show a svg preview of the circuit
    showCircuitPreview(selector, netlist);
    // Remove old start button if it exists and create a new one
    let startBtn = document.getElementById("scanned-circuit-start-btn");
    if (startBtn) {
        startBtn.remove(); // because it maybe links to another circuit
    }
    startBtn = createStartBtn(startBtn);
    if (state.pyodideReady) {
        showStartBtnEnabled(startBtn);
    } else {
        showStartBtnProgressBar(startBtn);
    }
    startBtn.addEventListener("click", async () => {
        await scannedQRCodeStartHandler(selector, netlist);
    });
    let stopBtn = document.getElementById("stop-qr-code-btn");
    stopBtn.insertAdjacentElement("afterend", startBtn);
}

function showStartBtnProgressBar(startBtn) {
    startBtn.innerHTML = `
                            <div class="fill-layer"></div>
                            <div class="progress-stripes"></div>
                            <span class="button-text">start</span>`;
}

function showStartBtnEnabled(startBtn) {
    startBtn.innerHTML = "start";
    startBtn.classList.remove("disabled");
    startBtn.style.backgroundColor = colors.keyYellow;
}

function createStartBtn(startBtn) {
    startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.id = "scanned-circuit-start-btn";
    startBtn.classList.add("btn", "btn-warning", "circuitStartBtn", "my-3", "mx-auto", "disabled");
    startBtn.style.display = "block";
    return startBtn;
}

async function scannedQRCodeStartHandler(selector, netlist) {
    // write fileContent to a default file in pyodide
    let defaultFileName = "scannedNetlist.txt";
    await state.pyodideAPI.writeFile(`/home/pyodide/${defaultFileName}`, netlist);

    let selectorGroup;
    if (selector === kirchhoffQRSelector) {
        selectorGroup = circuitMapper.selectorIds.kirchhoff;
    } else if (selector === simplifierQRSelector) {
        selectorGroup = circuitMapper.selectorIds.simplifier;
    } else {
        console.error("Invalid selector for QR code: " + selector);
        return;
    }

    let circuitMap = {
        circuitDivID: `scanned-circuit-div`,
        btn: `scanned-circuit-btn`,
        btnOverlay: `scanned-circuit-overlay`,
        circuitFile: defaultFileName,
        sourceDir: "",
        svgFile: "",
        selectorGroup: selectorGroup,
        overViewSvgFile: "",
        voltage: "",
        frequency: ""
    };
    await selectorBuilder.circuitSelectorStartButtonPressed(circuitMap);
}

async function showCircuitPreview(selector, netlist) {
    let stopBtn = document.getElementById("stop-qr-code-btn");
    let previewContainer = document.getElementById("qr-svg-preview");
    if (previewContainer) {
        previewContainer.remove();
    }

    previewContainer = document.createElement("div");
    previewContainer.id = "qr-svg-preview";
    let paramMap = createParamMap();

    let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);

    let [isValidSyntax, svgData, errMsgs, warnMsgs] = await state.pyodideAPI.forceDrawing(rawNetlist, paramMap, optionsString);
    if (!isValidSyntax) {
        console.error("Invalid netlist syntax in QR code");
        console.error(errMsgs);
        console.warn(warnMsgs);
        return;
    }
    svgData = setSvgColorMode(svgData);
    svgData = adjustForceDrawingLabelsAndWidth(svgData); // e.g. ##.### ## to R1
    previewContainer.innerHTML = svgData;
    previewContainer.style.width = "100%";
    stopBtn.insertAdjacentElement("afterend", previewContainer);
    hideSvgArrows(previewContainer);
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