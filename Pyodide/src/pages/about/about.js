class About extends Content{
    constructor() {
        let idLangMap = new Map([
            ["about-text", () => languageManager.currentLang.dataLegal.aboutText]
        ])
        super(idLangMap, "about-page-about");
    }

    get html() {
        return `
        <div id="about-page-about" class="container-fluid pb-5 mb-5" style="max-width: 600px;">
            <h1 style="color: #ffc107">simpliPFy</h1>
        </div>
        `
    }

    setup() {
        /** @type  {HTMLTemplateElement} */
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        /** @type {HTMLParagraphElement} */
        let paragraph = document.createElement("p");
        paragraph.id = "about-text";
        paragraph.innerHTML = languageManager.currentLang.dataLegal.aboutText;

        template.content.firstElementChild.appendChild(paragraph);

        return template.content.firstElementChild;
    }

    updateColor() {
        /** @type {HTMLDivElement} */
        let about = document.getElementById(this.mainID);
        about.style.color = colors.current.foreground;
        about.style.backgroundColor = colors.current.bsBackground;
        /** @type {HTMLHeadingElement} */
        let aboutHeading = about.querySelector('h1');
        aboutHeading.style.color = colors.current.headingForeground;
        aboutHeading.style.backgroundColor = colors.current.bsBackground;
        /** @type {HTMLHeadingElement} */
        let libsHeading = about.querySelector('h3');
        libsHeading.style.color = colors.current.foreground;
        libsHeading.style.backgroundColor = colors.current.bsBackground;
        this.#changeListColor();

        /** @type {HTMLParagraphElement} */
        const aboutText = document.getElementById("about-text");
        aboutText.style.color = colors.current.foreground;
    }

    afterPyodideLoaded() {

    }

    #changeListColor(){
        let usedLibs = document.getElementById(this.mainID).querySelector("ul");
        if (usedLibs) {
            usedLibs.style.color = colors.current.foreground;
            usedLibs.style.backgroundColor = colors.current.bsBackground;
        }
    }

}