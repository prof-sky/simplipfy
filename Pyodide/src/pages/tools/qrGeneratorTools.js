class QrCodeGeneratorTools extends ReusableContent {
    simplifierQRSelector = "si";
    kirchhoffQRSelector = "kh";
    symbolicQRSelector = "sy"
    heading = languageManager.currentLang.toolsPage.qrCodeGeneratorHeading;

    constructor(idLangMap = undefined, mainId = undefined) {
        mainId = mainId || "qr-accordion-item";
        super(idLangMap, mainId);
        this.idLangMap = idLangMap || new Map([
            [this.id("help-generate-qr-code"), () => languageManager.currentLang.toolsPage.helpBtn],
            [this.id("generate-qr-code-btn"), () => languageManager.currentLang.toolsPage.generateQrCode],
            [this.id("qr-simplifier-option"), () => languageManager.currentLang.toolsPage.qrSimplifierOption],
            [this.id("qr-symbolic-option"), () => languageManager.currentLang.toolsPage.qrSymbolicOption],
            [this.id("qr-kirchhoff-option"), () => languageManager.currentLang.toolsPage.qrKirchhoffOption],
            [this.id("copy-qr-code"), () => languageManager.currentLang.toolsPage.copyBtn],
            [this.id("track-link-description"), () => "Start tracking for this QR-Code with this link:"],
        ])
    }

    get html(){
        return `
            <button onclick="modalXl.show(new QrGeneratorModal())" class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="${this.id("help-generate-qr-code")}">${languageManager.currentLang.toolsPage.helpBtn}</button>
            <input class="form-control mx-auto" type="file" id="${this.id("qr-code-dir-input")}" style="width: fit-content; max-width: 350px; color: white; background-color: rgb(33, 37, 41);">
            <select id="${this.id("selector-select")}" class="form-select mx-auto my-2" style="width: 200px;">
                <option selected disabled>...</option>
                <option id="${this.id("qr-simplifier-option")}" value="${this.simplifierQRSelector}">${languageManager.currentLang.toolsPage.qrSimplifierOption}</option>
                <option id="${this.id("qr-symbolic-option")}" value="${this.symbolicQRSelector}">${languageManager.currentLang.toolsPage.qrSymbolicOption}</option>
                <option id="${this.id("qr-kirchhoff-option")}" value="${this.kirchhoffQRSelector}">${languageManager.currentLang.toolsPage.qrKirchhoffOption}</option>
            </select>
            <button id="${this.id("generate-qr-code-btn")}" type="button" class="btn btn-warning my-3" disabled>
                ${languageManager.currentLang.toolsPage.generateQrCode}
            </button>
            <p id="${this.id("trackIdDiv")}" class="text-center mb-0" style="color: ${colors.current.foreground}; font-size:large; font-weight:bold"></p>
            <div id="${this.id("qrcode")}" style="width: fit-content; background-color: white; padding: 50px; border-radius: 15px;" class="my-2 mx-auto" hidden></div>
            <button class="btn btn-warning" id="${this.id("copy-qr-code")}" hidden>${languageManager.currentLang.toolsPage.copyBtn}</button>
            <p id="${this.id("track-link-description")}" class="mt-4 mb-0" hidden>Start tracking for this QR-Code with this link:</p>
            <a id="${this.id("track-link")}" hidden href="" target="_blank" class="mx-auto text-center d-block" style="width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"></a>`;
    }

    setup(){
        let accQRItem = document.createElement("div");
        accQRItem.id = this.mainID;
        accQRItem.innerHTML = this.html
        this.isSetUp = true;

        return accQRItem;
    }

    /** @returns {Promise<string>} */
    async getNetlist(){
        return await this.#readFileAsText(state.fileForQrCode);
    }

    /**
     * @param session {QrTrackingData || EmptyQrTrackingData}
     * @private
     */
    _setupTrackingLink(session){
        let link = QrCodeGenerator.getTrackingLink(session.randomSession, session.qrSelector, new NetlistString(session.netlist));
        let trackLink = document.getElementById(this.id("track-link"));
        console.log(link);
        trackLink.href = link;
        trackLink.textContent = link;
    }

    addEventListeners() {
        let copyBtn = document.getElementById(this.id("copy-qr-code"));
        copyBtn.addEventListener("click", async () => {
            await this._copyQRCodeHandler();
        });

        let uploadDirInput = document.getElementById(this.id("qr-code-dir-input"));
        uploadDirInput.addEventListener("change", (event) => {
            state.fileForQrCode = event.target.files[0];
            // Activate generate button if file and selector chosen
            let selector = this._getSelector();
            let btn = document.getElementById(this.id("generate-qr-code-btn"));
            if ((selector !== null) && (state.fileForQrCode !== null) && (state.fileForQrCode !== undefined)) {
                btn.removeAttribute("disabled");
            } else {
                btn.setAttribute("disabled", "true");
            }
        });

        let select = document.getElementById(this.id("selector-select"));
        select.addEventListener("change", () => {
            // Activate generate button if file and selector chosen
            let selector = this._getSelector();
            let btn = document.getElementById(this.id("generate-qr-code-btn"));
            if ((selector !== null) && (state.fileForQrCode !== null) && (state.fileForQrCode !== undefined)) {
                btn.removeAttribute("disabled");
            } else {
                btn.setAttribute("disabled", "true");
            }
        });

        let qrCodeBtn = document.getElementById(this.id("generate-qr-code-btn"));
        qrCodeBtn.addEventListener("click", async () => {
            qrCodeBtn.disabled = true; // Disable button to prevent multiple clicks
            const session = await this._generateQRCodeHandler(document.getElementById(this.id("qrcode")), this.getNetlist.bind(this), state.fileForQrCode.name);
            this._setupTrackingLink(session);
            this._unhideElements();

            qrCodeBtn.disabled = false; // Re-enable button after processing
        });
    }

    updateColor() {
        let fileInput = document.getElementById(this.id("qr-code-dir-input"));
        if (fileInput) {
            fileInput.style.backgroundColor = colors.current.bsBackground;
            fileInput.style.color = colors.current.foreground;
        }

        let selectOpt = document.getElementById(this.id("selector-select"));
        if (selectOpt) {
            selectOpt.style.backgroundColor = colors.current.bsBackground;
            selectOpt.style.color = colors.current.foreground;
        }

        let whyNote = document.getElementById(this.id("help-generate-qr-code"));
        if (whyNote) {
            whyNote.style.color = colors.current.foreground;
        }
    }

    updateLang() {
        this.heading = languageManager.currentLang.toolsPage.qrCodeGeneratorHeading;
        super.updateLang();
    }

    _getSelector() {
        let selector = document.getElementById(this.id("selector-select"));
        let value = selector.value;
        if (value === "...") return null;
        if (value === this.simplifierQRSelector || value === this.kirchhoffQRSelector || value === this.symbolicQRSelector) {
            return value;
        } else {
            UserMessage.error("Error with value");
            console.error("Error for qr code -> selector with value: " + value);
            return null;
        }
    }

    #readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    }

    _unhideElements(){
        document.getElementById(this.mainID).querySelectorAll("[hidden]").forEach((item) => {
            item.removeAttribute("hidden");
        });
    }

    /**
     *
     * @param qrCode {HTMLDivElement}
     * @param netlist {() => Promise<string>}
     * @param fileName {string} display name in tracking dropdown beneath input
     * @returns {Promise<QrTrackingData | EmptyQrTrackingData>}
     * @private
     */
    async _generateQRCodeHandler(qrCode, netlist, fileName) {
        if (fileName.length > 20) {
            fileName = fileName.substring(0, 20) + "...";
        }

        let selector = this._getSelector();
        if (selector === null) {
            UserMessage.error("Choose a selector");
            return new EmptyQrTrackingData();
        }

        let session = new EmptyQrTrackingData();
        try {
            session = QrTrackingData.generate(fileName, await netlist(), selector);
        } catch (err) {
            console.error("Error while generating tracking data", err);
            return session;
        }

        let link = QrCodeGenerator.getQRCodeLink(session.randomSession, session.qrSelector, new NetlistString(session.netlist));
        console.log(link);

        qrCode.innerHTML = "";
        let qrCodeGenerated = QrCodeGenerator.generate(qrCode, link)
        if (qrCodeGenerated) {
            console.error("Could not generate QR code for: ", link);
            UserMessage.error("Error in QR Code length!");
        }

        let trackDiv = document.getElementById(this.id("trackIdDiv"));
        if (trackDiv) {
            trackDiv.innerHTML = `TrackingID: ${session.randomSession}`;
            trackDiv.style.color = colors.current.foreground;
        }

        storageManager.trackingIDs.saveValue(session);
        return session;
    }

    async _copyQRCodeHandler() {
        let qrCodeDiv = document.getElementById(this.id("qrcode"));
        let img = qrCodeDiv.querySelector("img");
        if (!img) return;
        try {
            // Create a blob from the image data URL and copy it to the clipboard
            let dataUrl = img.src;
            let blob = dataURLtoBlob(dataUrl);
            const item = new ClipboardItem({[blob.type]: blob});
            await navigator.clipboard.write([item]);
            UserMessage.info(languageManager.currentLang.toolsPage.copiedImg);
        } catch (err) {
            console.error("Failed to copy QR code image: ", err);
        }
    }

    _getPassKeyForQRCode(trackId) {
        // Takes the trackId with 5 characters and generates a passkey with 3 digits
        let num = parseInt(trackId);
        let x = ((num >> 3) ^ (num << 5)) & 0xFFFFF;
        return String(x % 1000).padStart(3, "0");
    }
}