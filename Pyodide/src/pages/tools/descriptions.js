class Descriptions extends Content{
    constructor() {
        let idLangMap = new Map([
            ["qr-gen-head-id", () => languageManager.currentLang.toolsPage.descrTexts.qrGenHead],
            ["qr-gen-text-id", () => languageManager.currentLang.toolsPage.descrTexts.qrGenText],
            ["track-view-head-id", () => languageManager.currentLang.toolsPage.descrTexts.trackViewerHead],
            ["track-view-text-id", () => languageManager.currentLang.toolsPage.descrTexts.trackViewerText],
            ["live-draw-head-id", () => languageManager.currentLang.toolsPage.descrTexts.liveDrawHead],
            ["live-draw-text-id", () => languageManager.currentLang.toolsPage.descrTexts.liveDrawText],
            ["custom-circuit-gen-head-id", () => languageManager.currentLang.toolsPage.descrTexts.customCircuitsHead],
            ["custom-circuit-gen-text-id", () => languageManager.currentLang.toolsPage.descrTexts.customCircuitsText],
        ])

        super(idLangMap, "tool-description");
    }

    setup(){
        if (this.isSetUp === true) return;

        let descriptions = this.#createDescriptionDiv()

        this.isSetUp = true;
        return descriptions;
    }

    updateColor() {
        // Update descriptions
        let content = document.getElementById(this.mainID);
        let headings = content.querySelectorAll("h5")
        for (let heading of headings) {
            heading.style.color = colors.current.headingForeground;
        }
        let texts = content.querySelectorAll("p")
        for (let text of texts) {
            text.style.color = colors.current.foreground;
        }
    }

    #createDescriptionDiv() {
        const descriptionDiv = document.createElement("div");
        descriptionDiv.id = "tool-description";
        descriptionDiv.style.color = colors.current.foreground;
        descriptionDiv.style.padding = "2rem";
        descriptionDiv.style.borderRadius = "12px";
        descriptionDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        descriptionDiv.style.maxWidth = "600px";
        descriptionDiv.style.margin = "2rem auto";
        descriptionDiv.style.lineHeight = "1.6";

        // if uneven number of descriptions call generateGirdToolItem with param divClass:
        // "col-12 d-flex w-50 mx-auto"

        let path = "src/resources/tools/"
        descriptionDiv.innerHTML = `
            <div class="container">
                <div class="row g-4">
                    ${this.#generateGridToolItem("qr-gen", languageManager.currentLang.toolsPage.descrTexts.qrGenHead, languageManager.currentLang.toolsPage.descrTexts.qrGenText, path+"qrIcon.svg")}
                    ${this.#generateGridToolItem("track-view", languageManager.currentLang.toolsPage.descrTexts.trackViewerHead, languageManager.currentLang.toolsPage.descrTexts.trackViewerText, path+"teacherLaptop.svg")}
                    ${this.#generateGridToolItem("live-draw", languageManager.currentLang.toolsPage.descrTexts.liveDrawHead, languageManager.currentLang.toolsPage.descrTexts.liveDrawText, path+"keyboard.svg")}
                    ${this.#generateGridToolItem("custom-circuit-gen", languageManager.currentLang.toolsPage.descrTexts.customCircuitsHead, languageManager.currentLang.toolsPage.descrTexts.customCircuitsText, path+"customZipFile.svg")}
                </div>
            </div>
        `;

        //center last col element, remove if tool count is even
        document.getElementById("svg-gen");

        let headings = descriptionDiv.querySelectorAll("h5");
        for (let heading of headings) {
            heading.style.color = colors.current.headingForeground;
        }

        let paragraphs = descriptionDiv.querySelectorAll("p");
        for (let paragraph of paragraphs) {
            paragraph.style.color = colors.current.foreground;
            paragraph.style.fontSize = "1rem";
            paragraph.style.marginBottom = "1rem";
            paragraph.style.marginInline = "auto";
            paragraph.style.textAlign = "center";
        }

        return descriptionDiv;
    }

    #generateGridToolItem(id, heading, text, iconSrc, divClass = "col-12 col-md-6 d-flex") {
        return `<div class="${divClass}">
                <div class="text-center text-light h-100 w-100 d-flex flex-column justify-content-between p-3 rounded">
                    <div>
                        <div class="mb-3">
                            <img src="${iconSrc}" style="height: 40px" alt="${heading}" class="img-fluid">
                        </div>
                        <h5 id="${id}-head-id">${heading}</h5>
                        <p id="${id}-text-id" class="mt-2">${text}</p>
                    </div>
                </div>
            </div>`;
    }

}