/**
 * This is the navigation that is always shown at the top of all Pages
 * @extends Page
 */
class NavigationPage extends Page{
    #isEnabled = true;
    #bootstrapCollapse = null;

    constructor() {
        let content = {
            navbar: new SideBar(),
        }
        super(content, "navbar", "noTitle");

        this.languageSelect = document.getElementById("Dropdown");
        this.darkModeSwitch = document.getElementById("darkmode-switch");
        this.gameModeSwitch = document.getElementById("game-switch");
        this.activeLangFlag = document.getElementById("activeLanguageFlag");
        this.navbarTitle = document.getElementById("navbarTitle");
        this.#bootstrapCollapse = new bootstrap.Collapse(document.getElementById("navbarSupportedContent"), { toggle: false });

        this.boundAutoCollapse = this.autoCollapse.bind(this);
    }

    setup() {
        //no super.beforeSetup() because ths page shall not be hidden after setup
        this.content.navbar.setup();
        this.#setBodyPaddingForFixedTopNavbar();
        this.#setupDarkModeSwitch();
        this.#setupGameModeSwitch();

        super.afterSetup();
    }

    toggleNavBar(){
        this.#bootstrapCollapse.toggle();
    }

    showNavBar(){
        this.#bootstrapCollapse.show();
    }

    hideNavBar(){
        this.#bootstrapCollapse.hide();
    }

    autoCollapse(event){
        if (!this.pageDiv.contains(event.target)) {
            event.stopPropagation();
            this.hideNavBar();
            this.setOpacity();
        }
    }

    setOpacity(){
        let newOpacity
        if (this.pageDiv.querySelector("button").classList.contains("collapsed")) {
            newOpacity = 1;
            document.body.removeEventListener("click", this.boundAutoCollapse);
        }
        else{
            document.body.addEventListener("click", this.boundAutoCollapse);
            newOpacity = 0.3;
        }
        pageManager.updatePageOpacity(newOpacity, null, true);
    }

    highlightNavigationLink(id){
        let navbar = document.getElementById(this.content.navbar.mainID);
        navbar.querySelector(".highlighted-navbar-link")?.classList.remove("highlighted-navbar-link")
        navbar.querySelector(`#${id}`)?.classList.add("highlighted-navbar-link");
    }

    addEventListeners() {
        const toggler = document.getElementById("nav-toggler");
        toggler.addEventListener("click", this.setOpacity.bind(this));
    }

    updateNavbarTitle(text){
        this.navbarTitle.textContent = text;
    }

    close() {
        const navbarToggler = document.getElementById("nav-toggler");
        navbarToggler.classList.add("collapsed");
        const navDropdown = document.getElementById("navbarSupportedContent");
        navDropdown.classList.remove("show");
        pageManager.updatePageOpacity(1, null, true)
    }

    disable(){
        let links = this.pageDiv.querySelector("ul").querySelectorAll("li.nav-item")
        for (let link of links) {
            /** @type {HTMLLIElement} */
            let _link = link.querySelector(".nav-link");
            _link.classList.add("disabled");
            _link.style.filter = "brightness(0.5)";
        }
        this.disableSettings()
        this.#isEnabled = false;
    }

    enable(){
        this.pageDiv.querySelector(".navbar-collapse").stylefilter = "brightness(1)";
        let links = this.pageDiv.querySelector("ul").querySelectorAll("li.nav-item")
        for (let link of links) {
            /** @type {HTMLLIElement} */
            let _link = link.querySelector(".nav-link");
            _link.classList.remove("disabled");
            _link.style.filter = "brightness(1.0)";
        }
        this.enableSettings()
        this.#isEnabled = true;
    }

    disableSettings() {
        this.languageSelect.disabled = true;
        this.darkModeSwitch.disabled = true;
        this.gameModeSwitch.disabled = true;
        this.activeLangFlag.style.filter = "brightness(0.5)";
    }

    enableSettings() {
        this.languageSelect.disabled = false;
        this.darkModeSwitch.disabled = false;
        this.gameModeSwitch.disabled = false;
        this.activeLangFlag.style.filter = "brightness(1)";
    }

    opacity(newOpacity = 1) {
        //override base implementation to keep opacity as is
    }

    setupEasterEggs() {
        setupSmoothStarsEasterEgg();
    }

    get isEnabled() {
        return this.#isEnabled;
    }

    #setBodyPaddingForFixedTopNavbar() {
        const navBar = document.getElementById("navbar");
        let height = navBar.offsetHeight;
        const body = document.getElementsByTagName("body")[0];
        document.body.style.paddingTop = height + "px";
    }

    #setupDarkModeSwitch() {
        const darkModeSwitch = document.getElementById("darkmode-switch");
        //darkModeSwitch.checked = true; not necessary, because default mode is set in beginning
        darkModeSwitch.addEventListener("change", () => {
            if (darkModeSwitch.checked) {
                storageManager.preferredColorScheme.save("dark")
                colors.setDarkModeColors();
                pushDarkModeEventMatomo(configDarkModeValues.Dark)
            } else {
                storageManager.preferredColorScheme.save("light")
                colors.setLightModeColors();
                pushDarkModeEventMatomo(configDarkModeValues.Light)
            }
            pageManager.updateColor();
            pageManager.pages.navigation.close();
        });
    }

    #setupGameModeSwitch() {
        const gameModeSwitch = document.getElementById("game-switch");
        gameModeSwitch.addEventListener("change", () => {
            state.gamification = !!gameModeSwitch.checked;
            pageManager.pages.navigation.close();
            if (state.gamification) {
                //addLivesField();
                setupShakeAnimation();
            } else {
                //removeLivesAndShowLogo();
            }
        });
    }

    updateLang() {
        super.updateLang();
        const lang = languageManager.langSymbol
        this.activeLangFlag.setAttribute("src", `src/resources/navigation/${lang}.png`)
        this.close();
        pushLanguageEventMatomo(configLanguageValues[lang]);
    }

    updateColor(bgClassName = "bg") {
        super.updateColor(bgClassName);
        this.pageDiv.querySelector("#navbarTitle").style.color = colors.current.foreground;
    }
}