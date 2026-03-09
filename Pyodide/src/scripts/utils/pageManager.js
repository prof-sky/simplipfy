/**
 * The class for managing the pages of the application.
 * It handles the setups and visibility of the different pages
 */

class PageManager {
    /** @type {Page} */
    current;
    /** @type {int} */
    #requestID = 0;

    constructor() {
        /**
         * registered pages
         * @type {Record<string, Page>}
         */

        /**
         * @typedef {"toolPage" | "settingsPage" | "aboutPage" | "editorPage" | "cheatSheetPage" | "landingPage" | "selectPage"} PageName
         */

        this.pages = {
            toolPage: new ToolsPage(),
            navigation: new NavigationPage(),
            settingsPage: new SettingsPage(),
            aboutPage: new AboutPage(),
            editorPage: new EditorPage(),
            cheatSheetPage: new CheatSheetPage(),
            landingPage: new LandingPage(),
            selectPage: new SelectPage(),
            loadingPage: new LoadingSomethingPage(),
            loadingPyodidePage: new LoadingPyodidePage(),
            stepwisePage: new StepwisePage(),
            kirchhoffPage: new KirchhoffPage(),
            wheatstonePage: new WheatstonePage(),
            magneticPage: new MagneticPage(),
        }

        this.timeout = conf.page.values.timeout;


        awaitVal(() => state.pyodideReady, () => this.afterPyodideLoaded())
        awaitVal(
            () => Object.values(this.pages).every(obj => obj.isSetUp === true) && state.pyodideReady,
            async () => {
                await this.setupEasterEggs()
                console.log("Easter eggs setup")
            },
            1000)
    }

    get requestID(){
        return this.#requestID;
    }

    /**
     * return all pages that are registered in {@link PageManager.pages}
     * @returns {Array<Page>}
     */
    get allPages(){
        return /** @type {Array<Page>} */ Object.values(pageManager.pages);
    }

    get pagesToSetup(){
        let excludes = [SelectPage, LoadingSomethingPage, LoadingPyodidePage, NavigationPage];
        return /** @type {Array<Page>} */ this.allPages.filter(page => !excludes.some(exclude => page instanceof exclude));
    }

    /** @param newPage {Page} the page that shall be displayed
     * @param history {boolean} adding the page to the history
     */
    showPage(newPage, history=true){
        this.hide();
        this.current = newPage;
        newPage.show();
		if (history) pageHistory.pushPage(newPage);
    }

    /** @param newPage {Page} the page that shall be displayed
     * @param force {boolean} force the page change, if page is already set
     * @param history {boolean} adding the page to the history
     */
    async changePage(newPage, force=false, history=true){

		if (newPage === this.current && !force) return;

        if (!newPage.isSetUp){
            newPage.setup();
        }

        const requestID = ++this.#requestID;
        if (!newPage.isInitialized) {
            newPage.initialize()
            this.showPage(pageManager.pages.loadingPage);
            this.pages.navigation.close();
            this.pageReady(newPage, requestID).then(() => {
                if (requestID === this.#requestID) this.showPage(newPage, history)
                else console.warn(`change to page ${newPage.constructor.name} aborted, different page was requested in the meantime`)
            });
            return Promise.resolve(true);
		}

        this.showPage(newPage, history);
        return Promise.resolve(true)
    }

    /** @param page {Page}
     * @param requestID {int} the id of the page change request, necessary to abort showing the page if another page change was requested in the meantime
     * @param intervall {int}*/
    pageReady(page, requestID, intervall = 100){
        return this.ready(() => page.isSetUp && page.isInitialized, requestID, intervall);
    }

    /** @param checkFn {function}
     * @param requestID {int} the id of the page change request, necessary to abort showing the page if another page change was requested in the meantime
     * @param interval {int}
     * */
    ready(checkFn, requestID, interval = 100) {
        return new Promise((resolve, reject) => {
            if (typeof checkFn !== "function") {
                reject(new Error("checkFn must be a function returning a boolean"));
                return;
            }

            const timer = setInterval(() => {
                try {
                    if (checkFn()) {
                        clearInterval(timer);
                        clearTimeout(timeOut);
                        resolve();
                    }
                } catch (err) {
                    clearInterval(timer);
                    clearTimeout(timeOut);
                    reject(err);
                }
            }, interval);

            const timeOut = setTimeout(() => {
                clearTimeout(timer);
                if (requestID !== this.#requestID) return; //means page already changed
                // on page load time out the page is not shown and therefore not the last page in the history.
                this.changePage(pageHistory.currentPage(), false, false)
                showMessage(languageManager.currentLang.alerts.pageLoadingTimeOut, "error", false)
                reject(new Error("page load timeout"));
            }, this.timeout)
        });
    }

    /** @param newPage {Page} the page that shall be displayed
     * @param force {boolean} force the page change, if page is already set
     */
    changePageAnimated(newPage, force=false){
        throw Error("not implemented :(")
    }

    /**
     * hide the currently displayed page.
     * Also see {@link PageManager.changePage}
     * @private
     */
    hide(){
        if (!this.current) return
        this.current.hide();
    }

    /**
     * slide out the page to the left
     * @param fade {int} time the page slides out
     * @param hideOffset {int} time that is waited to hide the page after fade is done
     */
    slideOut(fade = 300, hideOffset = 500){
        if (!this.current) return;
        this.current.slideOut(fade, hideOffset);
    }

    /**
     * Setup simpliPFy.org
     *  @param {Page} startPage */
    async setup(startPage = this.pages.landingPage){
        await storageManager.language.load()
        this.setColorScheme(); // decide on which color to set up pages
        pageHistory = new PageHistory();

        startPage.setup();
        // track how often the page was loaded on landing page
        if (startPage === this.pages.landingPage) storageManager.landingPageVisits.increment()
        //landing pages is initialized when shown

        this.pages.loadingPage.setup();
        this.pages.loadingPage.initialize();

        this.pages.navigation.setup();
        this.pages.navigation.initialize();

        this.pages.loadingPyodidePage.setup();
        this.pages.loadingPyodidePage.initialize();

        this.showPage(startPage);

        //scroll bootstrap accordions into view when their body is displayed
        document.addEventListener('shown.bs.collapse', (Event) =>  {
            let pos = Event.target.parentElement.getBoundingClientRect();
            window.scrollTo(window.x, pos.y + window.scrollY - 60, {behavior: 'instant'});
        })
    }

    /**
     * call afterPyodideLoaded on all registered {@link Page}s in {@link PageManager.pages}
     */
    afterPyodideLoaded() {
        for (let page of Object.values(this.pages)) {
            page.afterPyodideLoaded();
        }
        modalXl.afterPyodideLoaded();
        modalSm.afterPyodideLoaded();
    }

    /**
     *
     * @param newOpacity {number} a number between 0 and 1, set opacity to this value
     * @param page {Page} the page the opacity shall be set of, can be null if all is true
     * @param all {boolean} if true opacity of all pages is set to newOpacity, page value is ignored
     */
    updatePageOpacity(newOpacity, page, all=false){
        let pages
        if (all){
            pages = Object.values(this.pages)
        }
        else{
            pages = [page]
        }

        for (let page of pages){
            page.opacity(newOpacity)
        }
    }

    /**
     * return an HTML element that is a thin line and can be used to separate content on pages
     * @param id {string} unique id for the element in the dom, is concatenated like this: "settings-divider-" + id
     * @returns {HTMLHRElement}
     */
    getPageDivider(id){
        let divider = document.createElement("hr");
        divider.classList.add("hr", "mt-5", "mb-3", "mx-auto", "pageDivider");
        divider.id = "settings-divider-" + id;
        divider.style.color = colors.current.foreground;
        divider.style.maxWidth = "600px";

        return divider;
    }

    /**
     * method used to enable the tooltips on the tools page (todo: see if this can be moved to live tracking)
     */
    enableTooltips() {
        // If DOM is loaded, execute, otherwise wait for it
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {enableTt();});
        } else {
            enableTt();
        }

        function enableTt() {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl =>
                new bootstrap.Tooltip(tooltipTriggerEl, {
                    container: "body", // append tooltip to body instead of specific divs to avoid overflow issues
                    customClass: "custom-tooltip",
                    trigger: "click"
                }));
        }
    }

    /**
     * method called if an error is produced in the code
     */
    onError() {
        let progressBar = document.getElementById('pgr-bar')
        progressBar.classList.remove('bg-warning');
        progressBar.classList.remove('progress-bar-striped');
        progressBar.classList.add('bg-danger');
        progressBar.style.width = "100%";
        languageManager.currentLang.selector.messages = ['An error occurred, please try to reload the page'];
        let pgrBarNote = document.getElementById('progress-bar-note');
        pgrBarNote.innerText = languageManager.currentLang.selector.messages[0];
        pgrBarNote.style.color = colors.current.foreground;
    }

    async setupEasterEggs() {
        await fetchEasterEggImages();
        for (let page of Object.values(this.pages)) {
            page.setupEasterEggs()
        }
    }

    /**
     * uses window.matchMedia to determine the browser language and set the page language accordingly
     */
    setColorScheme() {
        /** @type {colorScheme} */
        let colorScheme = storageManager.preferredColorScheme.load();

        const darkModeSwitch = document.getElementById("darkmode-switch");
        if (colorScheme === "light") {
            colors.setLightModeColors()
            darkModeSwitch.checked = false
        }
        else if (colorScheme === "dark") {
            colors.setDarkModeColors()
            darkModeSwitch.checked = true;
        }
        else {
            throw Error(`colorScheme ${colorScheme} not supported`);
        }

        updateBsClassesTo(colors.current.bsColorScheme, "bg", document.getElementById("simplifier-page-container"));
    }

    /**
     * update the color of each registered page in {@link PageManager.pages}
     */
    updateColor(){
        // update currently viewed page first
        let pages = this.allPages;
        let indexOfCurPage = pages.indexOf(this.current);
        pages.splice(indexOfCurPage, 1);

        this.current.updateColor();

        // update remaining pages
        for (let page of pages) {
            page.updateColor();
        }
    }

    /**
     * update the language of each registered page in {@link PageManager.pages}
     */
    async updateLang(){
        // update currently viewed page first
        let pages = this.allPages;
        let indexOfCurPage = pages.indexOf(this.current);
        pages.splice(indexOfCurPage, 1);

	    this.current.updateLang();
        await this.current.typesetPage();

        // update remaining pages
        for (let page of pages) {
            page.updateLang();
        }
        await MathJax.typesetPromise();
    }
}
