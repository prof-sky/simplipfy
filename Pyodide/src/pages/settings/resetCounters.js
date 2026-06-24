class ResetCounters extends Content{
    resetLearnCountersBtn = null
    resetCustomCountersBtn = null
    resetAllCountersBtn = null

    /** @type {() => Selector} */
    tutorialSelector;
    /** @type {() => Selector} */
    customSelector;
    /** @type {() => Selector} */
    learnSelector;

    constructor() {
        let idLangMap = new Map([
            ["reset-custom-Counters-text", () => languageManager.currentLang.settingsPage.resetCustomCountersText],
            ["reset-custom-counters-btn", () => languageManager.currentLang.settingsPage.resetBtn],
            ["reset-learn-Counters-text", () => languageManager.currentLang.settingsPage.resetLearnCountersText],
            ["reset-learn-counters-btn", () => languageManager.currentLang.settingsPage.resetBtn],
            ["reset-all-Counters-text", () => languageManager.currentLang.settingsPage.resetAllCountersText],
            ["reset-all-counters-btn", () => languageManager.currentLang.settingsPage.resetBtn],
        ])
        super(idLangMap, "settings-ResetCounters");
        this.customSelector = () => pageManager.pages.toolPage.content.customCircuits.selector;
        this.learnSelector =  () => pageManager.pages.selectPage.content.accordion.selector;
        this.tutorialSelector = () => pageManager.pages.selectPage.content.tutorial;
    }

    getTextItem(id, text){
        let tmp = document.createElement("p");
        tmp.id = id;
        tmp.innerHTML = text;
        tmp.style.color = colors.current.foreground;
        tmp.classList.add("mx-auto", "mt-3");
        tmp.style.maxWidth = "400px";

        return tmp;
    }

    btn(btn, id, btnText){
        btn.id = id;
        btn.classList.add("btn", "btn-danger", "text-white", "mt-3", "px-5", "disabled");
        btn.style.color = colors.definitions.keyDark;
        btn.innerHTML = btnText;
    }

    setup() {
        let div = document.createElement("div");
        div.id = this.mainID

        div.appendChild(this.getTextItem("reset-learn-Counters-text", languageManager.currentLang.settingsPage.resetLearnCountersText));
        this.resetLearnCountersBtn = document.createElement("button");
        this.btn(this.resetLearnCountersBtn,"reset-learn-counters-btn", languageManager.currentLang.settingsPage.resetBtn);
        div.appendChild(this.resetLearnCountersBtn);

        div.appendChild(this.getTextItem("reset-custom-Counters-text", languageManager.currentLang.settingsPage.resetCustomCountersText));
        this.resetCustomCountersBtn = document.createElement("button");
        this.btn(this.resetCustomCountersBtn,"reset-custom-counters-btn", languageManager.currentLang.settingsPage.resetBtn);
        div.appendChild(this.resetCustomCountersBtn);

        div.appendChild(this.getTextItem("reset-all-Counters-text", languageManager.currentLang.settingsPage.resetAllCountersText));
        this.resetAllCountersBtn = document.createElement("button");
        this.btn(this.resetAllCountersBtn,"reset-all-counters-btn", languageManager.currentLang.settingsPage.resetBtn);
        div.appendChild(this.resetAllCountersBtn);

        return div;
    }

    updateColor() {
        let content = document.getElementById(this.mainID);
        content.style.backgroundColor = colors.current.bsBackground;
    }

    /**
     *
     * @param selector {Selector}
     * @param resetMsg {string}
     */
    resetDependingOnHash(selector, resetMsg){
        let hash = selector.circuitFiles.hash;

        storageManager.animationShown.resetHash(hash);
        storageManager.circuitsDone.resetHash(hash);

        selector.counters.update();
        UserMessage.info(resetMsg);
    }

    resetCustom(){
        if(!this.customSelector()){
            UserMessage.error(languageManager.currentLang.settingsPage.cantResetIfNotLoaded)
            return;
        }
        this.resetDependingOnHash(this.customSelector(), languageManager.currentLang.settingsPage.resetCustomCounters);
    }

    resetLearn(){
        this.resetDependingOnHash(this.learnSelector(), languageManager.currentLang.settingsPage.resetLearnCounters);
        this.tutorialSelector().counters.update();
    }

    resetAll(){
        storageManager.animationShown.reset();
        storageManager.circuitsDone.reset();

        storageManager.animationShown.addHash(serverFiles.hash);
        storageManager.circuitsDone.addHash(serverFiles.hash);

        if (customFiles){
            storageManager.animationShown.addHash(customFiles.hash);
            storageManager.circuitsDone.addHash(customFiles.hash);
        }

        this.learnSelector().counters.update();
        this.customSelector()?.counters.update();
        this.tutorialSelector().counters.update();

        UserMessage.info(languageManager.currentLang.settingsPage.resetAllCounters);
    }

    addEventListeners() {
        this.resetLearnCountersBtn.addEventListener("click", () => {
            this.resetLearn();
        });

        this.resetCustomCountersBtn.addEventListener("click", () => {
            this.resetCustom();
        });

        this.resetAllCountersBtn.addEventListener("click", () => {
            this.resetAll();
        });
    }
}