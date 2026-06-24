class QrCodeGeneratorEditor extends QrCodeGeneratorTools {
    simplifierQRSelector = "si";
    kirchhoffQRSelector = "kh";
    symbolicQRSelector = "sy"
    heading = languageManager.currentLang.toolsPage.qrCodeGeneratorHeading;

    constructor() {
        super(undefined, "qr-generator");
        this.idLangMap = new Map([
            [this.id("generate-qr-code-btn"), () => languageManager.currentLang.toolsPage.generateQrCode],
            [this.id("qr-simplifier-option"), () => languageManager.currentLang.toolsPage.qrSimplifierOption],
            [this.id("qr-symbolic-option"), () => languageManager.currentLang.toolsPage.qrSymbolicOption],
            [this.id("qr-kirchhoff-option"), () => languageManager.currentLang.toolsPage.qrKirchhoffOption],
            [this.id("copy-qr-code"), () => languageManager.currentLang.toolsPage.copyBtn],
            [this.id("tracking-qr-code"), () => languageManager.currentLang.toolsPage.trackingPage],
        ])
    }

    get html(){
        return `
            <select id="${this.id("selector-select")}" class="form-select mx-auto my-2" style="width: 200px;">
                <option selected disabled>...</option>
                <option id="${this.id("qr-simplifier-option")}" value="${this.simplifierQRSelector}">${languageManager.currentLang.toolsPage.qrSimplifierOption}</option>
                <option id="${this.id("qr-symbolic-option")}" value="${this.symbolicQRSelector}">${languageManager.currentLang.toolsPage.qrSymbolicOption}</option>
                <option id="${this.id("qr-kirchhoff-option")}" value="${this.kirchhoffQRSelector}">${languageManager.currentLang.toolsPage.qrKirchhoffOption}</option>
            </select>
            <button id="${this.id("generate-qr-code-btn")}" type="button" class="btn btn-warning my-3 d-inline-block" disabled>
                ${languageManager.currentLang.toolsPage.generateQrCode}
            </button>
            <div id="${this.id("qrcode")}" style="width: fit-content; background-color: white; padding: 50px; border-radius: 15px;" class="my-2 mx-auto" hidden></div>
            <button id="${this.id("copy-qr-code")}" class="btn btn-warning my-1" hidden>${languageManager.currentLang.toolsPage.copyBtn}</button>   
            <button id="${this.id("tracking-qr-code")}" class="btn btn-warning my-1" hidden>${languageManager.currentLang.toolsPage.trackingPage}</button>
        `
    }

    setup(){
        let accQRItem = document.createElement("div");
        accQRItem.id = this.mainID;
        accQRItem.style.display = "flex";
        accQRItem.style.flexDirection = "column";
        accQRItem.style.justifyContent = "center";
        accQRItem.style.alignItems = "center";
        accQRItem.innerHTML = this.html
        this.root = accQRItem;

        this.isSetUp = true;

        return accQRItem;
    }

    /** @returns {Promise<string>} */
    async getNetlist() {
        return state.netlistForQrCode;
    }

    addEventListeners() {
        let copyBtn = this.root.querySelector("#" + this.id("copy-qr-code"));
        copyBtn.addEventListener("click", async () => {
            await this._copyQRCodeHandler();
        });

        let select = this.root.querySelector("#" + this.id("selector-select"));
        select.addEventListener("change", () => {
            // Activate generate button if file and selector chosen
            let selector = this._getSelector();
            let btn = document.getElementById(this.id("generate-qr-code-btn"));
            if ((selector !== null) && (state.netlistForQrCode !== null) && (state.netlistForQrCode !== undefined)) {
                btn.removeAttribute("disabled");
            } else {
                btn.setAttribute("disabled", "true");
            }
        });

        let qrCodeBtn = this.root.querySelector("#" + this.id("generate-qr-code-btn"));
        qrCodeBtn.addEventListener("click", async () => {
            qrCodeBtn.disabled = true; // Disable button to prevent multiple clicks
            let data = await this._generateQRCodeHandler(document.getElementById(this.id("qrcode")), this.getNetlist.bind(this), "Editor Netlist");
            this._unhideElements();
            state.trackingData = data;
            qrCodeBtn.disabled = false; // Re-enable button after processing
        });

        let trackBtn = this.root.querySelector("#" + this.id("tracking-qr-code"));
        trackBtn.addEventListener("click", async () => {
            modalXl.hide();
            pageManager.waitTillReady(
                pageManager.pages.trackingPage,
                pageManager.pages.loadingPyodidePage,
                () => state.backendReady && state.solversReady
            );
        }
        );
    }

    updateColor() {
        let selectOpt = this.root.querySelector("#"+ this.id("selector-select"));
        if (selectOpt) {
            selectOpt.style.backgroundColor = colors.current.bsBackground;
            selectOpt.style.color = colors.current.foreground;
        }
    }

    updateLang() {
        this.heading = languageManager.currentLang.toolsPage.qrCodeGeneratorHeading;
        super.updateLang();
    }
}