/**
 * Page used by {@link PageManager} if the requested page has to initialize itself before it can be shown.
 * @extends Page
 */
class LoadingSomethingPage extends Page{
    /** @type {HTMLDivElement} */
    pgrBarDiv = null;

    constructor() {
        let content = {
            spinner: new Spinner()
        }
        super(content, "loading-page-container", "noTitle");
    }

    setup() {
        if (!super.beforeSetup()) return;

        this.pageDiv.appendChild(this.content.spinner.setup())

        super.afterSetup();
    }

    show(animate=false) {
        let page = document.getElementById(this.id);
        page.classList.add("slide-in-right");
        page.style.display = "block";
        return true;
    }
}