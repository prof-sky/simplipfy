/**
 * Base class for all Pages. Defines standard implementations if possible
 * @abstract
 * @extends FunctionsInterface
 */
class Page extends FunctionsInterface{
    /**
     * string is an internal name for content displayed on this page, content is the
     * associated content to the string
     * @type {Object<string, Content>}
     */
    content;
    /**
     * the id with wich the page div can be found in the dom
     * @type {string}
     */
    id;
    /**
     * is a reference to the element where the page content is displayed
     * @type {HTMLElement}
     */
    pageDiv;
    /**
     * when the page was added to the dom and all elements have their event listeners the page is set
     *  up and this value is true. Is set by {@link Page.setup}
     * @type {boolean}
     */
    isSetUp = false
    /**
     * if the setup method was called this value changes to true
     * @type {boolean}
     */
    setUpStarted = false;
    /**
     * when the page is ready to show this value changes to true, is set by {@link Page.initialize}
     * @type {boolean}
     */
    isInitialized = false;
    /**
     * if initialization method was called this value changes to true
     * @type {boolean}
     */
    initializationStarted = false;
    /**
     * is set to true if {@link Page.afterPyodideLoaded} was executed. Is used to determine if a page
     * missed the first call by {@link PageManager} after pyodide was loaded
     *  @type {boolean}
     */
    pyodideCallBackDone = false;
    /** @type {string} */
    _titleId;
    /**
     * the element id that is highlighted on the navbar when this page is shown
     * @type {string | undefined}
     */
    highlightOnNavbar = undefined;


    constructor(content, id, titleId, highlightOnNavbar = undefined) {
        super();
        this._titleId = titleId;
        this.content = content
        this.id = id;
        this.highlightOnNavbar = highlightOnNavbar;
        this.pageDiv = document.getElementById(id);
    }

    get navigationTitle() {
        return languageManager.currentLang.navigation[this._titleId].toUpperCase();
    }

    /**
     * Execute before custom code in setup method of derived class
     * @returns {boolean} returns true if the setup can continue false otherwise */
    beforeSetup(){
        if (this.isSetUp || this.setUpStarted) return false;
        this.hide();
        this.setUpStarted = true;
        return true
    }

    /**
     * Execute after custom code in setup method of derived class
     */
    afterSetup(){
        this.addEventListeners();
        this.isSetUp = true;
    }

    /**
     * Page standard implementation of setup, usually should be overwritten in child
     * @returns {DocumentFragment}
     */
    setup(){
        this.beforeSetup();
        this.afterSetup();
        return new DocumentFragment()
    }

    /**
     * Execute before custom code in initialize method of derived class
     * @returns {boolean} returns true if the init can continue false otherwise  */
    beforeInit(){
        if(this.initializationStarted) return false;
        if (!this.isSetUp) {
            console.log("init called before setup, setup started... pageClass: " + this.constructor.name)
            this.setup();
        }

        this.initializationStarted = true; // avoid starting the init multiple times
        return true;
    }

    /**
     * Execute after custom code in initialize method of derived class
     */
    afterInit(){
        this.isInitialized = true;
        this.updateColor();
        this.updateLang();
        this.initializationStarted = false;
    }

    /**
     * Page standard implementation of initialize, should be overwritten in child
     */
    initialize(){
        // if the page has to do some things that take longer and may be async override this method in the child
        // the page manager then shows a loading page and waits until this.isInitialized = true
        if (!this.beforeInit()) return;
        this.afterInit();
    }

    /**
     * displays the page container by adding style=block
     * @param animate {boolean} slides in the page from the left (experimental)
     * @returns {boolean}
     */
    show(animate=false){
        // page manager handles this with a loading page with the changePage() method
        // this asserts that a page never can be displayed without being setup and initialized properly

        // if a page is shown without being set up there will be errors
        if (!this.isSetUp){
            this.setup();
        }
        // content may not be displayed correctly or out of date if it is not initialized
        if (!this.isInitialized) {
            this.initialize()
        }
        // assert that a page is fully set up even if it was set up later and missed the promised based call to
        // afterPyodideLoaded
        if (!this.pyodideCallBackDone && state.backendReady) this.afterPyodideLoaded()

        let page = this.pageDiv;
        if (animate) {
            page.classList.remove('out-left', "in-right");
            page.classList.add("in-right");
        }
        page.style.display = "block";
        this.matomoEvent();

        return true;
    }

    matomoEvent(){
        pushPageViewMatomo(this.title)
    }

    /**
     * hides the page container by adding style=none
     */
    hide(){
        this.pageDiv.style.display = "none";
    }

    /**
     * slide the page out of view to the left (experimental)
     */
    slideOut(){
        // don't know at wich state slide out is used, remove both
        this.pageDiv.classList.remove('in-right', 'out-left');
        this.pageDiv.classList.add("out-left");
        setTimeout(()=> this.pageDiv.style.display = "none", 200)
    }

    /**
     * call addEventListeners on each Content that is registered in {@link Page.content}
     */
    addEventListeners() {
        for(let content of Object.values(this.content)) {
            content.addEventListeners();
        }
    }

    /**
     * call updateLang on each Content that is registered in {@link Page.content}
     */
    updateLang() {
        if (!this.isSetUp || !this.isInitialized) return;
        for(let content of Object.values(this.content)) {
            content.updateLang();
        }
    }

    /**
     * some containers need an update of the bs class that bootstrap displays them in the right color
     * @param bgClassName {string} <bgClassName>-dark standard value is bg, is passed to updateBsClass()
     */
    updateColor(bgClassName="bg") {
        if (!this.isSetUp || !this.isInitialized) return;
        for(let content of Object.values(this.content)) {
            content.updateColor();
        }
        this.updateBsClass(bgClassName);
    }

    /**
     * execute code that depends on Pyodide instance fully loaded
     */
    afterPyodideLoaded() {
        if (this.pyodideCallBackDone) return;
        this.pyodideCallBackDone = true;
        // override in child and call this implementation, if something depends on pyodide loaded
    }

    updateBsClass(className = "bg"){
        let element = document.getElementById(this.id);
        let colorScheme = colors.current.bsColorScheme;

        if (colorScheme === ColorManager.lightMode.bsColorScheme) {
            switchBsClassToLight(className, element);
        } else if (colorScheme === ColorManager.darkMode.bsColorScheme) {
            switchBsClassToDark(className, element);
        } else {
            throw Error("Only light or dark colorScheme");
        }
    }

    /**
     * change the opacity of this page
     * @param newOpacity {number} float value between 0 and 1
     */
    opacity(newOpacity = 1) {
        this.pageDiv.style.opacity = newOpacity.toString();
    }

    /**
     * If called forces the page manager to recall initialize on next page load, effects depend on
     * implementation of {@link Page.initialize}
     * */
    invalidate(){
        this.isInitialized = false;
        this.initializationStarted = false;
    }

    /**
     * If a page has Easter-Eggs load and setup everything in this method. This method is called by the
     * {@link PageManager} when the page finished loading to avoid loading "unnecessary" stuff before the page is
     * functional
     */
    setupEasterEggs(){

    }

    /**
     * Calls MathJax.typesetPromise() on this page
     * @returns {Promise<void>}
     */
    async typesetPage(){
        if (!this.isSetUp) return;
        await MathJax.typesetPromise(["#" + this.id])
    }
}