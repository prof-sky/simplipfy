/**
 * Display embedded editor for the project
 * @extends Page
 */
class EditorPage extends Page{
    constructor() {
        let content = {
            editor: new Editor(),
        }
        // <pageName>-page-container (id of div on index.html)
        super(content, "editor-page-container", "editor", "nav-editor");
    }

    afterPyodideLoaded() {
        let btn = document.getElementById("editor-simplipfy-btn");
        btn.classList.remove("disabled");
        btn.style.backgroundColor = colors.definitions.keyYellow
    }
}