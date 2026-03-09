class KeyFeatures extends Content{
    constructor() {
        let idLangMap = new Map([
            ["key-feature1heading", () => languageManager.currentLang.landingPage.keyFeature1heading],
            ["key-feature1", () => languageManager.currentLang.landingPage.keyFeature1],
            ["key-feature2heading", () => languageManager.currentLang.landingPage.keyFeature2heading],
            ["key-feature2", () => languageManager.currentLang.landingPage.keyFeature2],
            ["key-feature3heading", () => languageManager.currentLang.landingPage.keyFeature3heading],
            ["key-feature3", () => languageManager.currentLang.landingPage.keyFeature3],
        ])
        super(idLangMap, "landingPage-keyFeatures");
    }

    get html(){
        return `
        <div id="${this.mainID}" class="container-fluid p-0">
            <div class="container-fluid py-5 feature-container" id="feature-container1">
                <p class="feature-heading" id="key-feature1heading">${languageManager.currentLang.landingPage.keyFeature1heading}</p>
                <p class="feature-body px-5" id="key-feature1">${languageManager.currentLang.landingPage.keyFeature1}</p>
            </div>
            <div class="container-fluid py-5 feature-container" id="feature-container2">
                <p class="feature-heading" id="key-feature2heading">${languageManager.currentLang.landingPage.keyFeature2heading}</p>
                <p class="feature-body px-5" id="key-feature2">${languageManager.currentLang.landingPage.keyFeature2}</p>
            </div>
            <div class="container-fluid py-5 feature-container" id="feature-container3">
                <p class="feature-heading" id="key-feature3heading">${languageManager.currentLang.landingPage.keyFeature3heading}</p>
                <p class="feature-body px-5" id="key-feature3">${languageManager.currentLang.landingPage.keyFeature3}</p>
            </div>
        </div>`;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }
}