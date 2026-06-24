class StartButton extends Content{
    constructor() {
        let idLangMap = new Map([
            ["start-button", () => languageManager.currentLang.landingPage.startBtn]
        ])
        super(idLangMap, "start-container");
    }

    get html(){
        return `
        <div class="container-fluid py-5" id="${this.mainID}">
            <button class="btn my-4 px-5" id="start-button">START</button>
        </div>`;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }

    addEventListeners() {
        const landingStartButton = document.getElementById("start-button");
        landingStartButton.addEventListener("click", async () => {
            await this.startBtnClicked();
        })
    }

    afterPyodideLoaded() {
        let startBtns = document.getElementsByClassName("circuitStartBtn");
        for (let btn of startBtns) {
            btn.style.backgroundColor = colors.definitions.keyYellow;
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

    async startBtnClicked(){
        try {
            pageManager.changePage(pageManager.pages.selectPage);

        } catch (error) {
            console.trace(error)
            console.error(error)
            pageManager.onError();
            UserMessage.error(error);
        }
    }

}