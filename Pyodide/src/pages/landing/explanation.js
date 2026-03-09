class Explanation extends Content{
    constructor() {
        let idLangMap = new Map([
            ["landing-page-explanation1", () => languageManager.currentLang.landingPage.landingPageExplanation1]
        ])
        super(idLangMap, "landingPage-explanations");
    }

    get html(){
        return `
        <div id="${this.mainID}" class="container-fluid pt-5 pb-4" style="background-color: white">
            <p id="landing-page-explanation1" class="my-0 px-5 mx-auto" style="max-width: 750px"></p>
            <div id="landing-image-wrapper" style="position: relative; display: inline-block;">
                <img id="landing-page-image" src="src/resources/landingpage/Bild26.png" class="img-fluid pt-3" alt="overview">
            </div>
        </div>`;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }
}