class ResetScannerCarousel extends Content {
    resetSafedScannerValuesBtn = null

    constructor() {
        let idLangMap = new Map([
            ["reset-scanner-carousel-text", () => languageManager.currentLang.settingsPage.resetScannerCarousel],
            ["reset-scanner-carousel-btn", () => languageManager.currentLang.settingsPage.resetBtn]
        ])
        super(idLangMap, "settings-page-reset-scanner-carousel");
    }

    setup() {
        let div = document.createElement("div");
        div.id = this.mainID;
        let resetText = document.createElement("p");
        resetText.id = "reset-scanner-carousel-text";
        resetText.innerHTML = languageManager.currentLang.settingsPage.resetScannerCarousel;
        resetText.style.color = colors.current.foreground;
        resetText.classList.add("mx-auto", "mt-3");
        resetText.style.maxWidth = "400px";
        div.appendChild(resetText);

        // Add a button to reset the cached circuit counters
        this.resetSafedScannerValuesBtn = document.createElement("button");
        const resetSafedScannerValuesBtn = this.resetSafedScannerValuesBtn
        resetSafedScannerValuesBtn.id = "reset-scanner-carousel-btn";
        resetSafedScannerValuesBtn.classList.add("btn", "btn-danger", "text-white", "mt-3", "px-5", "disabled");
        resetSafedScannerValuesBtn.style.color = colors.definitions.keyDark;
        resetSafedScannerValuesBtn.innerHTML = languageManager.currentLang.settingsPage.resetBtn;
        div.appendChild(resetSafedScannerValuesBtn);

        return div
    }

    updateColor() {
        let content = document.getElementById(this.mainID);
        content.style.backgroundColor = colors.current.bsBackground;
    }

    addEventListeners() {
        this.resetSafedScannerValuesBtn.addEventListener("click",async () => {
            await storageManager.scannedCircuits.reset();
            await pageManager.pages.selectPage.reloadScanner();
            UserMessage.info(languageManager.currentLang.settingsPage.resetMessage);
        });
    }
}