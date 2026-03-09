/**
 * Template how to implement a Content
 * @extends Content
 */
class SetLandingPage extends Content{
    constructor() {
        let idLangMap = new Map([
            ["setLandingPage-lp", () => languageManager.currentLang.settingsPage.landingPage],
            ["setLandingPage-sp", () => languageManager.currentLang.settingsPage.selectPage],
            ["setLandingPage-tp", () => languageManager.currentLang.settingsPage.toolsPage],
            ["setLandingPage-title", () => languageManager.currentLang.settingsPage.setLandingTitle],
            ["setLandingPage-heading", () => languageManager.currentLang.settingsPage.setLandingHeading],
        ])
        super(idLangMap, "SetLandingPageContainer");
    }

    get html(){
        return `
        <div id="${this.mainID}" style="max-width: 450px; margin-bottom: 48px" class="mx-auto">
            <p id="setLandingPage-heading" class="mt-5" style="font-weight: bold; color: white;">Set Landing Page</p>
            <p id="setLandingPage-title">${languageManager.currentLang.settingsPage.setLandingTitle}</p>
            <div class="form-check d-flex justify-content-left">
              <input id="setLandingPage-lp-input" class="form-check-input mx-2" type="radio" name="flexRadioDefault" id="flexRadioDefault1">
              <label id="setLandingPage-lp" class="form-check-label text-start" for="setLandingPage-lp-input">
                LandingPage
              </label>
            </div>
            <div class="form-check d-flex justify-content-left">
              <input id="setLandingPage-sp-input" class="form-check-input mx-2" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked>
              <label id="setLandingPage-sp" class="form-check-label text-start" for="setLandingPage-sp-input">
                SelectPage
              </label>
            </div>
            <div class="form-check d-flex justify-content-left">
              <input id="setLandingPage-tp-input" class="form-check-input mx-2" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked>
              <label id="setLandingPage-tp" class="form-check-label text-start" for="setLandingPage-tp-input">
                ToolsPage
              </label>
            </div>
        </div>
        `;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }

    updateColor() {
        /** @type {HTMLDivElement} */
        let div = document.getElementById(this.mainID)
        let labels = div.getElementsByTagName("label");
        for (let label of labels) {
            label.style.color = colors.current.foreground
        }
    }

    setLandingPage() {
        storageManager.firstPage.save("landingPage");
        document.getElementById("setLandingPage-lp-input").check = true
        console.log("Set first page to: landingPage")
    }

    setSelectPage() {
        storageManager.firstPage.save("selectPage");
        document.getElementById("setLandingPage-sp-input").check = true
        console.log("Set first page to: selectPage")
    }

    setToolsPage() {
        storageManager.firstPage.save("toolPage");
        document.getElementById("setLandingPage-tp-input").check = true
        console.log("Set first page to: toolPage")
    }

    addEventListeners() {
        document.getElementById("setLandingPage-lp-input").addEventListener("click", () => {
            this.setLandingPage();
        })
        document.getElementById("setLandingPage-sp-input").addEventListener("click", () => {
            this.setSelectPage();
        })
        document.getElementById("setLandingPage-tp-input").addEventListener("click", () => {
            this.setToolsPage();
        })
    }

    selectRadioBtn(){
        let [_, pageName] = storageManager.firstPage.load()
        if (pageName === "landingPage") {
            document.getElementById("setLandingPage-lp-input").checked = true;
        }
        else if(pageName === "selectPage"){
            document.getElementById("setLandingPage-sp-input").checked = true;
        }
        else if(pageName === "toolPage"){
            document.getElementById("setLandingPage-tp-input").checked = true;
        }
        else {
            console.warn("Unrecognized page name " + pageName + ",now set to landing page");
            this.setLandingPage();
        }
    }
}