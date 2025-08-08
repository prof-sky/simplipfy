simplifierQRSelector = "si";
kirchhoffQRSelector = "kh";

function createGeneratorItem() {
    let accQRItem = document.createElement("div");
    accQRItem.classList.add("accordion-item");
    accQRItem.id = "qr-accordion-item";
    accQRItem.innerHTML = getQRCodeGeneratorHTML()
    return accQRItem;
}

function addQRCodeGeneratorEventlisteners() {
    let copyBtn = document.getElementById("copy-qr-code");
    copyBtn.addEventListener("click", async () => {
        await copyQRCodeHandler();
    });

    let uploadDirInput = document.getElementById("qr-code-dir-input");
    uploadDirInput.addEventListener("change", (event) => {
        state.fileForQrCode = event.target.files[0];
        // Activate generate button if file and selector chosen
        let selector = getSelector();
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
        let selector = getSelector();
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
        await generateQRCodeHandler();
        qrCodeBtn.disabled = false; // Re-enable button after processing
    });

    let whyQrCodeText = document.getElementById("why-qr-code");
    whyQrCodeText.addEventListener("click", () => {
        setTimeout(() => {
            showMessage(languageManager.currentLang.whyQrCodeTooltip, "info", false);
        });
    });
}

function getSelector() {
    let selector = document.getElementById("selector-select");
    let value = selector.value;
    if (value === "...") return null;
    if (value === simplifierQRSelector || value === kirchhoffQRSelector) {
        return value;
    } else {
        setTimeout(() => {showMessage("Error with value", "error")});
        console.error("Error for qr code -> selector with value: " + value);
        return null;
    }
}

function generateRandomCode(length) {
    //const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

async function generateQRCodeHandler() {
    let selector = getSelector();
    if (selector === null) {
        setTimeout(() => {
            showMessage("Choose a selector")
        });
        return;
    }

    // Generate session with 5 random characters
    let randomSession = generateRandomCode(5);
    // check if localhost or production
    let url = window.location.href;
    if (url && url.includes("localhost")) {
        console.log("Running in development mode, using random session ID: " + randomSession);
    } else {
        // TODO, this may be not necessary or even clever because it only returns currently viewed Sessions
        let sessions = await getLiveDBSessions();
        while (sessions.includes(randomSession)) {
            randomSession = Math.random().toString(36).substring(2, 15);
        }
    }

    // Read the file content
    let file = state.fileForQrCode;
    let reader = new FileReader();
    reader.onload = async (event) => {
        let netlist = event.target.result;
        let compressedNetlist = LZString.compressToEncodedURIComponent(netlist);

        // dev.simplipfy or simplipfy
        let baseUrl = window.location.origin;

        let link = `${baseUrl}/#id=${randomSession}&sel=${selector}&net=${compressedNetlist}`
        console.log(link);
        let qrCode = document.getElementById("qrcode");
        qrCode.innerHTML = ""; // Clear previous QR code
        let correctlevel = QRCode.CorrectLevel.H; // Start with highest level
        for (let i = 0; i < 10; i++) {
            try {
                let qrcode = new QRCode(qrCode, {
                    text: link,
                    width: 250,
                    height: 250,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: correctlevel,
                });
                break; // If successful, exit the loop
            } catch (error) {
                if (error.message.includes("code length overflow")) {
                    qrCode.innerHTML = ""; // Clear previous QR code
                    // Try a lower correct level
                    if (correctlevel === QRCode.CorrectLevel.H) {
                        correctlevel = QRCode.CorrectLevel.Q;
                    } else if (correctlevel === QRCode.CorrectLevel.Q) {
                        correctlevel = QRCode.CorrectLevel.M;
                    } else if (correctlevel === QRCode.CorrectLevel.M) {
                        correctlevel = QRCode.CorrectLevel.L;
                    } else if (correctlevel === QRCode.CorrectLevel.L) {
                        // If already at lowest level, break the loop
                        console.error("Could not generate QR code with any correct level.");
                        setTimeout(() => {showMessage("Error in QR Code length!", "error")}, 0);
                        break;
                    }
                }
            }
        }
        let copyBtn = document.getElementById("copy-qr-code");
        copyBtn.removeAttribute("hidden");
        qrCode.removeAttribute("hidden");

        // Cache the netlist
        localStorage.setItem(randomSession, netlist);
    }
    reader.readAsText(file);

    // Generate passkey
    let passkey = getPassKeyForQRCode(randomSession);

    let trackDiv = document.getElementById("trackIdDiv");
    trackDiv.innerHTML = "TrackingID: " + randomSession + "<br>" + "Key: " + passkey;
    trackDiv.style.color = colors.currentForeground;

    let keyInfo = document.getElementById("keyInfo");
    keyInfo.removeAttribute("hidden");

    // Set tracking id into browser storage
    let filename = state.fileForQrCode.name;
    // Check if filename is too long, truncate if necessary
    if (filename.length > 20) {
        filename = filename.substring(0, 20) + "...";
    }

    let storeText = `${randomSession}-${passkey}_${filename}`;
    let trackIds = JSON.parse(localStorage.getItem("trackIds")) || [];
    if (!trackIds.includes(storeText)) {
        trackIds.push(storeText);
        localStorage.setItem("trackIds", JSON.stringify(trackIds));
    }
}

async function copyQRCodeHandler() {
    let qrCodeDiv = document.getElementById("qrcode");
    let img = qrCodeDiv.querySelector("img");
    if (!img) return;
    try {
        // Create a blob from the image data URL and copy it to the clipboard
        let dataUrl = img.src;
        let blob = dataURLtoBlob(dataUrl);
        const item = new ClipboardItem({[blob.type]: blob});
        await navigator.clipboard.write([item]);
        showMessage(languageManager.currentLang.copiedImg, "info");
    } catch (err) {
        console.error("Failed to copy QR code image: ", err);
    }
}

function getQRCodeGeneratorHTML() {
    return `
            <h2 class="accordion-header" id="qr-acc-heading">
                <button class="accordion-button collapsed" style="flex-direction: column; padding-bottom: 0;" type="button" data-bs-toggle="collapse" data-bs-target="#qr-acc-collapse" aria-expanded="false" aria-controls="qr-acc-collapse">
                    ${languageManager.currentLang.qrAccHeading}
                </button>
            </h2>
            <div id="qr-acc-collapse" class="accordion-collapse collapse" aria-labelledby="qr-acc-heading" data-bs-parent="#tool-accordion">
                <div class="accordion-body">
                    <p style="color: ${colors.currentHeadingsForeground}; cursor: pointer;" id="why-qr-code">${languageManager.currentLang.helpBtn}</p>
                    <input class="form-control mx-auto" type="file" id="qr-code-dir-input" style="width: fit-content; max-width: 350px; color: white; background-color: rgb(33, 37, 41);">
                    <select id= "selector-select" class="form-select mx-auto my-2" style="width: 200px;">
                      <option selected disabled>...</option>
                      <option id="qr-simplifier-option" value="${simplifierQRSelector}">${languageManager.currentLang.qrSimplifierOption}</option>
                      <option id="qr-kirchhoff-option" value="${kirchhoffQRSelector}">${languageManager.currentLang.qrKirchhoffOption}</option>
                    </select>
                    <button id="generate-qr-code-btn" type="button" class="btn btn-warning my-3" disabled>
                        ${languageManager.currentLang.generateQrCode}
                    </button>
                    <p id="trackIdDiv" class="text-center mb-0" style="color: ${colors.currentForeground}; font-size:large; font-weight:bold"></p>
                    <p class="form-text" id="keyInfo" style="color: grey" hidden>${languageManager.currentLang.dontShareKey}</p>
                    <div id="qrcode" style="width: fit-content; background-color: white; padding: 50px; border-radius: 15px;" class="my-2 mx-auto" hidden></div>
                    <button class="btn btn-warning" id="copy-qr-code" hidden>${languageManager.currentLang.copyBtn}</button>
                </div>
            </div>`;
}

function getPassKeyForQRCode(trackId) {
    // Takes the trackId with 5 characters and generates a passkey with 3 digits
    let num = parseInt(trackId);
    let x = ((num >> 3) ^ (num << 5)) & 0xFFFFF;
    return String(x % 1000).padStart(3, "0");
}