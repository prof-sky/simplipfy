class ToolsQrScanner extends AccordionContent{
    /** @type {QRScanner} */
    scanner;
    /** @type {HTMLButtonElement} */
    stopBtn;
    /** @type {HTMLButtonElement} */
    scanBtn;
    /** @type {HTMLDivElement} */
    errorContainer;

    constructor(heading) {
        let idLangMap = new Map([
            ["help-qr-scan", () => languageManager.currentLang.toolsPage.helpBtn]
        ])
        super(heading, idLangMap, "scanner-accordion-item");
        this.scanner = new QRScanner();
    }

    get html(){
        return `
            <button onclick="modalXl.show(new QrScannerModal())" class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="help-qr-scan">${languageManager.currentLang.toolsPage.helpBtn}</button>
            <div class="hidden">
                <button id="scan-qr-code-btn" type="button" class="btn btn-warning my-3 circuitStartBtn disabled">
                    <div class="fill-layer"></div>
                    <div class="progress-stripes"></div>    
                    <span class="button-text">${languageManager.currentLang.toolsPage.scanQrCodeBtn}</span>
                </button>
                <button id="stop-qr-code-btn" class="btn btn-secondary" hidden>stop</button>
                <div id="qr-code-error"></div>
            </div>`;
    }

    setup(){
        if (this.isSetUp === true) return;

        let accScannerItem = document.createElement("div");
        accScannerItem.id = this.mainID;
        let qrCodeScanner = this.scanner.setup();
        accScannerItem.innerHTML = this.html;
        accScannerItem.querySelector("div").appendChild(qrCodeScanner);

        this.errorContainer = accScannerItem.querySelector("#qr-code-error");
        this.stopBtn = accScannerItem.querySelector("#stop-qr-code-btn");

        this.scanBtn = accScannerItem.querySelector("#scan-qr-code-btn");
        this.scanBtn.addEventListener("click", () => {
            this.scanner.scanHandler(
                this.qrCodeDetected.bind(this),
                () => {
                this.scanBtn.hidden = true;
                this.stopBtn.hidden = false;
                },
                this.errorContainer);
            }
        )

        this.isSetUp = true;

        return accScannerItem;
    }

    stopConditions(scanBtn, stopBtn) {
        // Stop scanner if preview is not visible (page switch or accordion closed)
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting && this.html5QrCode && this.scanner.isScanning) {
                this.html5QrCode.stop().then(() => {
                    stopBtn.hidden = true;
                    scanBtn.hidden = false;
                    this.scanner.isScanning = false;
                    this.scanner.removeDivFromDom;
                });
            }
        }, {threshold: 0.1});
        observer.observe(this.scanner.previewContainer);

        // Stop scanner if tab is not visible (browser minimized or tab switched)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.html5QrCode && this.scanner.isScanning) {
                this.html5QrCode.stop().then(() => {
                    stopBtn.hidden = true;
                    this.scanner.isScanning = false;
                    this.scanner.removeDivFromDom;
                }).catch(err => {
                    console.error("Error stopping QR Code scanner", err);
                });
            }
        });

        // Stop scanner if button is clicked
        stopBtn.addEventListener("click", () => {
            if (this.html5QrCode && this.scanner.isScanning) {
                this.html5QrCode.stop().then(() => {
                    this.scanner.isScanning = false;
                    stopBtn.hidden = true;
                    scanBtn.hidden = false;
                    this.scanner.removeDivFromDom;
                }).catch((err) => {
                    console.error("Error stopping QR Code scanner", err);
                });
            }
        });
    }

    updateLang() {
        this.heading = languageManager.currentLang.toolsPage.qrScannerHeading;
        let scanQrCodeBtn = document.getElementById('scan-qr-code-btn')?.querySelector("span");
        if (scanQrCodeBtn) {
            scanQrCodeBtn.innerHTML = languageManager.currentLang.toolsPage.scanQrCodeBtn;
        }
        super.updateLang();
    }

    updateColor() {
        let whyNote = document.getElementById("help-qr-scan");
        if (whyNote) {
            whyNote.style.color = colors.current.foreground;
        }
    }

    addEventListeners() {
        // If DOM is loaded, execute, otherwise wait for it
        this.stopConditions(this.scanBtn, this.stopBtn);
    }

    async #checkIfQRCodeValidNetlist(netlist) {
        let netlistInfo = (await state.apis.pyodide.isValidCircuitString(netlist)).data;
        if (!netlistInfo.isValid) {
            console.error("Invalid netlist in QR code");
            console.error(netlistInfo.errors);
            console.log(netlistInfo.warnings);
            UserMessage.info(languageManager.currentLang.toolsPage.invalidQRCode + "<br>" + languageManager.currentLang.alerts.invalidCircuitFile);
            return false;
        }
        return true;
    }

    #prepareCircuitStart(selector, netlist) {
        let btnID = "scanned-circuit-start-btn"
        // Show a svg preview of the circuit
        this.#showCircuitPreview(selector, netlist);
        // Remove old start button if it exists and create a new one
        let startBtn = document.getElementById(btnID);
        if (startBtn) {
            startBtn.remove(); // because it maybe links to another circuit
        }
        startBtn = this.createStartBtn(btnID);
        if (state.backendReady) {
            this.showStartBtnEnabled(startBtn);
        } else {
            this.showStartBtnProgressBar(startBtn);
        }
        startBtn.addEventListener("click", async () => {
            await this.#scannedQRCodeStartHandler(selector, netlist);
        });
        let stopBtn = document.getElementById("stop-qr-code-btn");
        stopBtn.insertAdjacentElement("afterend", startBtn);
    }

    async qrCodeDetected(decodedText, decodedResult) {
        console.log("Scanned QR Code:", decodedText);
        this.scanner.html5QrCode.stop().then(() => {
        console.log("Scanner stopped");
        this.scanner.isScanning = false;
        this.stopBtn.hidden = true;
        this.scanBtn.hidden = false;
        });
        let [selector, netlist] = this.#cleanQRCodeLink(decodedText);
        if (selector === null || netlist === null) {
            this.scanner.isScanning = false;
            return;
        }
        // QR Code scanned, check for syntax and start if valid
        if (await this.#checkIfQRCodeValidNetlist(netlist)) {
            this.#prepareCircuitStart(selector, netlist);
        }
    }

    async #scannedQRCodeStartHandler(selector, netlist) {
        // write fileContent to a default file in pyodide
        let selectorGroup;
        if (selector === window.definitions.qrCodeSelectorIDs.kirchhoff) {
            selectorGroup = window.definitions.selectorIDs.kirchhoff;
        } else if (selector === window.definitions.qrCodeSelectorIDs.stepwise) {
            selectorGroup = window.definitions.selectorIDs.simplifier;
        } else if (selector ===window.definitions.qrCodeSelectorIDs.symbolic){
            selectorGroup = window.definitions.selectorIDs.symbolic;
        } else{
            console.error("Invalid selector for QR code: " + selector);
            return;
        }

        state.currentSelector = externalSelector;
        await SimplifierPage.showSimplifierPage(await (new ExternalCircuitMap()).initForScan(netlist));
    }

    async #showCircuitPreview(selector, netlist) {
        let stopBtn = document.getElementById("stop-qr-code-btn");
        let previewContainer = document.getElementById("qr-svg-preview");
        if (previewContainer) {
            previewContainer.remove();
        }

        previewContainer = document.createElement("div");
        previewContainer.id = "qr-svg-preview";
        let paramMap = new ParamMap();

        let [optionsString, rawNetlist] = extractCommentsAndNetlist(netlist);

        let drawingResult = (await state.apis.pyodide.forceDrawing(rawNetlist, paramMap, optionsString)).data;
        if (!drawingResult.isValidSyntax) {
            console.error("Invalid netlist syntax in QR code");
            console.error(drawingResult.errMsgs);
            console.warn(drawingResult.warnMsgs);
            return;
        }
        previewContainer.style.width = "100%";
        previewContainer.appendChild(new SvgMagician(drawingResult.svgData).onlyElementLabels().element);

        stopBtn.insertAdjacentElement("afterend", previewContainer);
    }

    #cleanQRCodeLink(decodedText) {
        // QR Code contains a link like https://simplipfy.org/#sel=si&net=...
        // We only want the selector and netlist here
        let hash = decodedText.split("#")[1]; // get everything after the #
        const params = new URLSearchParams(hash);
        const sessionId = params.get("id") || null;
        const selector = params.get("sel") || null;
        const compressed = params.get("net") || null;

        if (sessionId) {
            console.log("Found session ID: " + sessionId);
            state.trackingData.randomSession = sessionId;
            TrackingDB.send(`Scanned QR Code with session ID: ${sessionId}`, sessionId);
        }

        if (selector === null || compressed === null) {
            console.error("QR Code does not contain a selector or netlist");
            UserMessage.error(languageManager.currentLang.toolsPage.selOrNetNull);
            return [null, null];
        }
        // Decode the netlist from LZString
        const netlist = new NetlistString(undefined, compressed).uncompressed
        return [selector, netlist];
    }
}