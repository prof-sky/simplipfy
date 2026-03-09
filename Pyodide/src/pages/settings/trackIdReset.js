class TrackIdReset extends Content{
    resetCountersBtn = null

    constructor() {
        let idLangMap = new Map([
            ["reset-trackIDs-text", () => languageManager.currentLang.settingsPage.resetTrackIDsText],
            ["reset-trackIDs-btn", () => languageManager.currentLang.settingsPage.resetBtn]
        ])
        super(idLangMap, "settings-page-reset-track-id");
    }

    setup() {
        let div = document.createElement("div");
        div.id = this.mainID;
        let resetText = document.createElement("p");
        resetText.id = "reset-trackIDs-text";
        resetText.innerHTML = languageManager.currentLang.settingsPage.resetTrackIDsText;
        resetText.style.color = colors.current.foreground;
        resetText.classList.add("mx-auto");
        resetText.classList.add("mt-3");
        resetText.style.maxWidth = "400px";
        div.appendChild(resetText);

        // Add a button to reset the cached circuit counters
        this.resetCountersBtn = document.createElement("button");
        const resetCountersBtn = this.resetCountersBtn
        resetCountersBtn.id = "reset-trackIDs-btn";
        resetCountersBtn.classList.add("btn", "btn-danger", "text-white", "mt-3", "px-5");
        resetCountersBtn.style.color = colors.definitions.keyDark;
        resetCountersBtn.innerHTML = languageManager.currentLang.settingsPage.resetBtn;
        div.appendChild(resetCountersBtn);

        return div
    }

    updateColor() {
        let content = document.getElementById(this.mainID);
        content.style.backgroundColor = colors.current.bsBackground;
    }

    addEventListeners() {
        this.resetCountersBtn.addEventListener("click", () => {
            storageManager.trackingIDs.reset();
            setTimeout(() => {
                showMessage(languageManager.currentLang.settingsPage.resetMessage, "info")
            }, 0);
        });
    }
}