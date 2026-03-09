class SideBar extends Content{
    navHomeLink = null;
    navSelectLink = null;
    navCheatLink = null;
    navUploadLink = null;
    navToolsLink = null;
    navAboutLink = null;
    navSettingsLink = null;
    navLogo = null;
    selectEnglish = null;
    selectGerman = null;

    constructor() {
        let idLangMap = new Map([
            ["nav-home", () => languageManager.currentLang.navigation.home.toUpperCase()],
            ["nav-select", () => languageManager.currentLang.navigation.simplifier.toUpperCase()],
            ["nav-editor", () => languageManager.currentLang.navigation.editor.toUpperCase()],
            ["nav-cheat", () => languageManager.currentLang.navigation.cheatsheet.toUpperCase()],
            ["nav-tools", () => languageManager.currentLang.navigation.tools.toUpperCase()],
            ["nav-about", () => languageManager.currentLang.navigation.about.toUpperCase()],
            ["darkmode-label", () => languageManager.currentLang.navigation.darkmode.toUpperCase()],
            ["game-label", () => languageManager.currentLang.navigation.gamemode.toUpperCase()],
            ["nav-dataprivacy", () => languageManager.currentLang.navigation.dataprivacy],
            ["nav-legal", () => languageManager.currentLang.navigation.legal],
            ["nav-settings", () => languageManager.currentLang.navigation.settings.toUpperCase()],
        ])
        super(idLangMap, "navbarSupportedContent");
    }

    updateLang() {
        super.updateLang();
    }

    setup() {
        this.updateLang();

        this.navHomeLink = document.getElementById("nav-home");
        this.navSelectLink = document.getElementById("nav-select");
        this.navEditorLink = document.getElementById("nav-editor");
        this.navCheatLink = document.getElementById("nav-cheat");
        this.navUploadLink = document.getElementById("nav-upload");
        this.navToolsLink = document.getElementById("nav-tools");
        this.navAboutLink = document.getElementById("nav-about");
        this.navSettingsLink = document.getElementById("nav-settings");
        this.navLogo = document.getElementById("nav-logo");
        this.selectEnglish = document.getElementById("select-english");
        this.selectGerman = document.getElementById("select-german");

        this.navLogo.style.cursor = "default";
        this.navLogo.style.userSelect = "none";

        this.addEventListeners();
    }

    addEventListeners() {
        this.navHomeLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.landingPage);
        })
        this.navSelectLink.addEventListener("click", async () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.selectPage);
        })
        this.navEditorLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.editorPage);
        })
        this.navCheatLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.cheatSheetPage);
        })
        this.navToolsLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.toolPage);
        });
        this.navAboutLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.aboutPage);
        })
        this.navSettingsLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.settingsPage);
        });
        this.navLogo.addEventListener("click", () => {
            if (!pageManager.pages.navigation.isEnabled) return
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            pageManager.pages.navigation.close();
            pageManager.changePage(pageManager.pages.landingPage);
        })
        this.selectEnglish.addEventListener("click",async () => {
            await languageManager.setLang(window.definitions.shortLanguageSymbols.english);
            pageManager.updateLang();
        })
        this.selectGerman.addEventListener("click",async () => {
            await languageManager.setLang(window.definitions.shortLanguageSymbols.german);
            pageManager.updateLang();
        })
    }

    updateColor() {
        document.getElementById("navbarSupportedContent").style.backgroundColor = colors.current.bsBackground;

        // update nav links
        const navLinks = document.getElementsByClassName("nav-link");
        for (/** @type {HTMLElement} */ const navLink of navLinks) {
            navLink.style.color = colors.current.foreground;
        }

        // learning (nav to select page) color yellow
        /** @type {HTMLElement} */
        let navSelect = document.getElementById("nav-select");
        navSelect.style.color = colors.definitions.keyYellow;

        // languages select
        for (let elm of ["darkmode-label", "game-label", "Dropdown", "languagesDropdown",
            "select-english", "select-german"]){
            document.getElementById(elm).style.color = colors.current.foreground
        }

        updateBsClassesTo(colors.current.bsColorScheme, "bg", document.getElementById("navbar"));
        updateBsClassesTo(colors.current.bsColorScheme, "navbar", document.getElementById("navbar"));

        document.getElementById("languagesDropdown").style.backgroundColor = colors.current.languagesBg;
    }
}