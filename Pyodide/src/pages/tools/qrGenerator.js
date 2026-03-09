class QrCodeGenerator extends Content {
    simplifierQRSelector = "si";
    kirchhoffQRSelector = "kh";
    symbolicQRSelector = "sy"

    constructor() {
        let idLangMap = new Map([
            ["help-generate-qr-code", () => languageManager.currentLang.toolsPage.helpBtn],
            ["generate-qr-code-btn", () => languageManager.currentLang.toolsPage.generateQrCode],
            ["keyInfo", () => languageManager.currentLang.toolsPage.dontShareKey],
            ["qr-simplifier-option", () => languageManager.currentLang.toolsPage.qrSimplifierOption],
            ["qr-symbolic-option", () => languageManager.currentLang.toolsPage.qrSymbolicOption],
            ["qr-kirchhoff-option", () => languageManager.currentLang.toolsPage.qrKirchhoffOption],
            ["copy-qr-code", () => languageManager.currentLang.toolsPage.copyBtn],
        ])
        super(idLangMap, "qr-accordion-item");
    }

    get html(){
        return `
            <h2 class="accordion-header" id="qr-acc-heading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#qr-acc-collapse" aria-expanded="false" aria-controls="qr-acc-collapse">
                    ${languageManager.currentLang.toolsPage.genQrAccHeading}
                </button>
            </h2>
            <div id="qr-acc-collapse" class="accordion-collapse collapse" aria-labelledby="qr-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                    <button onclick="modalXl.show(new QrGeneratorModal())" class="btn btn-outline-warning mx-auto my-1" style="color: ${colors.current.headingForeground}; cursor: pointer;" id="help-generate-qr-code">${languageManager.currentLang.toolsPage.helpBtn}</button>
                    <input class="form-control mx-auto" type="file" id="qr-code-dir-input" style="width: fit-content; max-width: 350px; color: white; background-color: rgb(33, 37, 41);">
                    <select id= "selector-select" class="form-select mx-auto my-2" style="width: 200px;">
                      <option selected disabled>...</option>
                      <option id="qr-simplifier-option" value="${this.simplifierQRSelector}">${languageManager.currentLang.toolsPage.qrSimplifierOption}</option>
                       <option id="qr-symbolic-option" value="${this.symbolicQRSelector}">${languageManager.currentLang.toolsPage.qrSymbolicOption}</option>
                      <option id="qr-kirchhoff-option" value="${this.kirchhoffQRSelector}">${languageManager.currentLang.toolsPage.qrKirchhoffOption}</option>
                    </select>
                    <button id="generate-qr-code-btn" type="button" class="btn btn-warning my-3" disabled>
                        ${languageManager.currentLang.toolsPage.generateQrCode}
                    </button>
                    <p id="trackIdDiv" class="text-center mb-0" style="color: ${colors.current.foreground}; font-size:large; font-weight:bold"></p>
                    <p class="form-text" id="keyInfo" style="color: grey" hidden>${languageManager.currentLang.toolsPage.dontShareKey}</p>
                    <div id="qrcode" style="width: fit-content; background-color: white; padding: 50px; border-radius: 15px;" class="my-2 mx-auto" hidden></div>
                    <button class="btn btn-warning" id="copy-qr-code" hidden>${languageManager.currentLang.toolsPage.copyBtn}</button>
                </div>
            </div>
            `
    }

    setup(){
        let accQRItem = document.createElement("div");
        accQRItem.classList.add("accordion-item");
        accQRItem.id = this.mainID;
        accQRItem.innerHTML = this.html
        this.isSetUp = true;

        return accQRItem;
    }

    addEventListeners() {
        let copyBtn = document.getElementById("copy-qr-code");
        copyBtn.addEventListener("click", async () => {
            await this.#copyQRCodeHandler();
        });

        let uploadDirInput = document.getElementById("qr-code-dir-input");
        uploadDirInput.addEventListener("change", (event) => {
            state.fileForQrCode = event.target.files[0];
            // Activate generate button if file and selector chosen
            let selector = this.#getSelector();
            let btn = document.getElementById("generate-qr-code-btn");
            if ((selector !== null) && (state.fileForQrCode !== null) && (state.fileForQrCode !== undefined)) {
                btn.removeAttribute("disabled");
            } else {
                btn.setAttribute("disabled", "true");
            }
        });

        let select = document.getElementById("selector-select");
        select.addEventListener("change", () => {
            // Activate generate button if file and selector chosen
            let selector = this.#getSelector();
            let btn = document.getElementById("generate-qr-code-btn");
            if ((selector !== null) && (state.fileForQrCode !== null) && (state.fileForQrCode !== undefined)) {
                btn.removeAttribute("disabled");
            } else {
                btn.setAttribute("disabled", "true");
            }
        });

        let qrCodeBtn = document.getElementById("generate-qr-code-btn");
        qrCodeBtn.addEventListener("click", async () => {
            qrCodeBtn.disabled = true; // Disable button to prevent multiple clicks
            await this.#generateQRCodeHandler();
            qrCodeBtn.disabled = false; // Re-enable button after processing
        });
    }

    updateColor() {
        let fileInput = document.getElementById("qr-code-dir-input");
        if (fileInput) {
            fileInput.style.backgroundColor = colors.current.bsBackground;
            fileInput.style.color = colors.current.foreground;
        }

        let selectOpt = document.getElementById("selector-select");
        if (selectOpt) {
            selectOpt.style.backgroundColor = colors.current.bsBackground;
            selectOpt.style.color = colors.current.foreground;
        }

        let whyNote = document.getElementById("help-generate-qr-code");
        if (whyNote) {
            whyNote.style.color = colors.current.foreground;
        }
    }

    updateLang() {
        let scanQRCodeAccHeading = document.getElementById('qr-acc-heading');
        scanQRCodeAccHeading.querySelector("button").innerHTML = languageManager.currentLang.toolsPage.genQrAccHeading;
        super.updateLang();
    }

    #getSelector() {
        let selector = document.getElementById("selector-select");
        let value = selector.value;
        if (value === "...") return null;
        if (value === this.simplifierQRSelector || value === this.kirchhoffQRSelector || value === this.symbolicQRSelector) {
            return value;
        } else {
            setTimeout(() => {showMessage("Error with value", "error")});
            console.error("Error for qr code -> selector with value: " + value);
            return null;
        }
    }

    #generateRandomCode(length) {
        //const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const chars = '0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    #readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    }

    async #generateQRCodeHandler() {
        let selector = this.#getSelector();
        if (selector === null) {
            setTimeout(() => showMessage("Choose a selector"));
            return;
        }

        let randomSession = this.#generateRandomCode(5);
        let url = window.location.origin;
        if (url.includes("localhost")) {
            console.log("Running in development mode, using random session ID: " + randomSession);
            console.log(`Using href: ${window.location.href}`)
            // don't use href generally to use redirect to the newest versions in releases
            // use href at localhost to work for docker
            url = window.location.href
        }
        else{
            console.log("Using origin: " + url);
        }

        let file = state.fileForQrCode;

        let netlist;
        try {
            netlist = await this.#readFileAsText(file);
        } catch (err) {
            console.error("File read error:", err);
            return;
        }

        let compressedNetlist = LZString.compressToEncodedURIComponent(netlist);
        if(!url.endsWith("/")) url += "/";
        let link = `${url}#id=${randomSession}&sel=${selector}&net=${compressedNetlist}`;


        console.log(link);

        let qrCode = document.getElementById("qrcode");
        qrCode.innerHTML = "";

        let correctlevel = QRCode.CorrectLevel.H;
        for (let i = 0; i < 10; i++) {
            try {
                new QRCode(qrCode, {
                    text: link,
                    width: 250,
                    height: 250,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: correctlevel,
                });
                break;
            } catch (error) {
                if (error.message.includes("code length overflow")) {
                    qrCode.innerHTML = "";
                    if (correctlevel === QRCode.CorrectLevel.H) {
                        correctlevel = QRCode.CorrectLevel.Q;
                    } else if (correctlevel === QRCode.CorrectLevel.Q) {
                        correctlevel = QRCode.CorrectLevel.M;
                    } else if (correctlevel === QRCode.CorrectLevel.M) {
                        correctlevel = QRCode.CorrectLevel.L;
                    } else {
                        console.error("Could not generate QR code.");
                        setTimeout(() => showMessage("Error in QR Code length!", "error"), 0);
                        break;
                    }
                }
            }
        }

        document.getElementById("copy-qr-code").removeAttribute("hidden");
        qrCode.removeAttribute("hidden");

        let passkey = this.#getPassKeyForQRCode(randomSession);
        let trackDiv = document.getElementById("trackIdDiv");
        trackDiv.innerHTML = `TrackingID: ${randomSession}<br>Key: ${passkey}`;
        trackDiv.style.color = colors.current.foreground;
        document.getElementById("keyInfo").removeAttribute("hidden");

        let filename = file.name;
        if (filename.length > 20) {
            filename = filename.substring(0, 20) + "...";
        }

        storageManager.trackingIDs.saveValue(randomSession, passkey, filename, netlist);
    }

    async #copyQRCodeHandler() {
        let qrCodeDiv = document.getElementById("qrcode");
        let img = qrCodeDiv.querySelector("img");
        if (!img) return;
        try {
            // Create a blob from the image data URL and copy it to the clipboard
            let dataUrl = img.src;
            let blob = dataURLtoBlob(dataUrl);
            const item = new ClipboardItem({[blob.type]: blob});
            await navigator.clipboard.write([item]);
            showMessage(languageManager.currentLang.toolsPage.copiedImg, "info");
        } catch (err) {
            console.error("Failed to copy QR code image: ", err);
        }
    }

    #getPassKeyForQRCode(trackId) {
        // Takes the trackId with 5 characters and generates a passkey with 3 digits
        let num = parseInt(trackId);
        let x = ((num >> 3) ^ (num << 5)) & 0xFFFFF;
        return String(x % 1000).padStart(3, "0");
    }
}