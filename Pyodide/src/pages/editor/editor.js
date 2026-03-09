class Editor extends Content{
    constructor() {
        let idLangMap = new Map([
            []
        ])
        super(idLangMap, "editor-page-editor");
    }

    get html() {
        return ``
    }

    setup() {
        /** @type  {HTMLTemplateElement} */
        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        return template.content.firstElementChild;
    }

    updateLang() {
        i18n = languageManager.currentLang.editorPage.editorStrings;
    }

    updateColor() {
        colors.setMode(setDarkMode, setLightMode);
        update_schematics();
    }

}