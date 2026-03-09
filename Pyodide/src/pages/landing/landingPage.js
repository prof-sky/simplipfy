/**
 * First Page shown when simplipfy.org is visited
 * @extends Page
 */
class LandingPage extends Page{
    constructor() {
        let content = {
            mainWelcome: new MainWelcome(),
            startButton: new StartButton(),
            keyFeatures: new KeyFeatures(),
            explanation: new Explanation(),
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "landing-page-container", "LandingPage");
    }

    async initialize() {
        if (!super.beforeInit()) return;
        await this.content.mainWelcome.initialize();
        super.afterInit();
    }

    setup() {
        if (!super.beforeSetup()) return;
        let landingPage = this.pageDiv
        landingPage.appendChild(this.content.mainWelcome.setup());
        landingPage.appendChild(this.content.startButton.setup());
        landingPage.appendChild(this.content.keyFeatures.setup());
        landingPage.appendChild(this.content.explanation.setup());

        this.#enableStartBtnAndSimplifierLink();

        super.afterSetup();
    }

    show(){
        super.show();
        // todo this might be the reason the container is visible
        resetLandingPageContainers();
        pageManager.pages.navigation.enableSettings();
        for (let feature of document.querySelectorAll(".feature-container")) {
            feature.classList.remove("visible");
        }
        document.title = "simpliPFy";
        pushPageViewMatomo();
        scrollBodyToTop();
        this.pageDiv.classList.remove("slide-out-left");
        this.pageDiv.classList.remove("slide-in-right");
    }

    afterPyodideLoaded() {
        super.afterPyodideLoaded();
        this.content.startButton.afterPyodideLoaded();
    }

    #enableStartBtnAndSimplifierLink() {
        document.getElementById("nav-select").classList.remove("disabled");
        document.getElementById("start-button").classList.remove("disabled");
        document.getElementById("start-button").style.animation = "pulse 2s infinite";
    }

    setupEasterEggs() {
        setupMascotEasterEgg();
        setupMemeViewer();
    }

}