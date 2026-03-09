/**
 * Template how to implement a Page
 * @extends Page
 */
class LoadingPyodidePage extends Page{
    constructor() {
        let content = {
            pgrBar: new ProgressBar(),
            note: new LoadingPyodideNote()
        }
        super(content, "loading-pyodide-page-container");
    }

    setup() {
        if (!super.beforeSetup()) return;

        this.pageDiv.appendChild(this.content.pgrBar.setup())
        this.pageDiv.appendChild(this.content.note.setup())

        super.afterSetup();
    }
}