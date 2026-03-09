/**
 * Template how to implement a Content
 * @extends Content
 */
class contentTemplate extends Content{
    constructor() {
        let idLangMap = new Map([
            ["some-id", () => "languageManager.currentLang.somePage.someString"]
        ])
        super(idLangMap, "contentDiv");
    }

    get html(){
        return `
        <div></div>
        `;
    }

    setup() {
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }

    updateLang() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

    updateColor() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

    addEventListeners() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

    afterPyodideLoaded() {
        //remove if no class specific code is needed, you may want to extend your own code with the base implementation
    }

}