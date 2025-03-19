class PageManager {
    constructor(document) {
        this.landingPage = document.getElementById("landing-page-container");
        this.selectPage = document.getElementById("select-page-container");
        this.simplifierPage = document.getElementById("simplifier-page-container");
        this.cheatSheet = document.getElementById("cheat-sheet-container");
        this.aboutPage = document.getElementById("about-page-container");
        this.languageSelect = document.getElementById("Dropdown");
        this.darkModeSwitch = document.getElementById("darkmode-switch");
        this.activeLangFlag = document.getElementById("activeLanguageFlag");
        this.pages = [this.landingPage, this.selectPage, this.simplifierPage, this.cheatSheet, this.aboutPage]
    }

    showLandingPage() {
        this.landingPage.style.display = "block";
        this.selectPage.style.display = "none";
        this.simplifierPage.style.display = "none";
        this.cheatSheet.style.display = "none";
        this.aboutPage.style.display = "none";
        this.enableSettings();
        for (let feature of document.querySelectorAll(".feature-container")) {
            feature.classList.remove("visible");
        }
        document.title = "simpliPFy";
        pushPageViewMatomo();
        scrollBodyToTop();
    }

    showSelectPage() {
        state.valuesShown = new Map(); // by default symbols shown
        this.landingPage.style.display = "none";
        this.selectPage.style.display = "block";
        this.simplifierPage.style.display = "none";
        this.cheatSheet.style.display = "none";
        this.aboutPage.style.display = "none";
        this.enableSettings();
        document.title = "Circuit Selection";
        if (state.pyodideReady) {
            pushPageViewMatomo("Ready");
        } else {
            pushPageViewMatomo("Loading");
        }
        scrollBodyToTop();
    }

    showSimplifierPage() {
        this.landingPage.style.display = "none";
        this.selectPage.style.display = "none";
        this.simplifierPage.style.display = "block";
        this.cheatSheet.style.display = "none";
        this.aboutPage.style.display = "none";
        this.disableSettings();
        document.title = "Simplifier";
        pushPageViewMatomo();
        scrollBodyToTop();
    }

    showCheatSheet() {
        this.landingPage.style.display = "none";
        this.selectPage.style.display = "none";
        this.simplifierPage.style.display = "none";
        this.cheatSheet.style.display = "block";
        this.aboutPage.style.display = "none";
        this.enableSettings();
        document.title = "Cheat Sheet";
        pushPageViewMatomo();
        scrollBodyToTop();
    }

    showAboutPage() {
        this.landingPage.style.display = "none";
        this.selectPage.style.display = "none";
        this.simplifierPage.style.display = "none";
        this.cheatSheet.style.display = "none";
        this.aboutPage.style.display = "block";
        this.enableSettings();
        document.title = "About";
        pushPageViewMatomo();
        scrollBodyToTop();
    }

    disableSettings() {
        this.languageSelect.disabled = true;
        this.darkModeSwitch.disabled = true;
        this.activeLangFlag.style.filter = "brightness(0.5)";
    }

    enableSettings() {
        this.languageSelect.disabled = false;
        this.darkModeSwitch.disabled = false;
        this.activeLangFlag.style.filter = "brightness(1)";
    }

    // ########################## Setups ########################################
    setupLandingPage() {
        languageManager.updateLanguageLandingPage();

        const landingStartButton = document.getElementById("start-button");
        landingStartButton.addEventListener("click", async () => {
            await this.landingPageStartBtnClicked()
        })
        // Left - right animation for feature containers
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    for (let feature of document.querySelectorAll(".feature-container")) {
                        feature.classList.add("visible");
                    }
                }
            });
        }, { threshold: 1});
        const trigger = document.getElementById("trigger");
        observer.observe(trigger);
    }

    async landingPageStartBtnClicked() {
        if (state.pyodideLoading || state.pyodideReady) {
            this.showSelectPage();
        } else {
            try{
                this.showSelectPage();
                setPgrBarTo(0);
                const note = showWaitingNote();
                setPgrBarTo(1);
                state.pyodideLoading = true;
                // Get the pyodide instance and setup pages with functionality
                state.pyodide = await loadPyodide();
                setInterval(() => {
                        note.innerHTML = languageManager.currentLang.messages[Math.floor(Math.random() * languageManager.currentLang.messages.length)]},
                    8000);
                setPgrBarTo(5);
                // Map all circuits into map and build the selectors
                circuitMapper = new CircuitMapper();
                await circuitMapper.mapCircuits();

                setPgrBarTo(10);
                selectorBuilder.buildSelectorsForAllCircuitSets();
                updateSelectorPageColors();

                hideQuickstart();
                hideAccordion();

                // Starts with 10%
                await packageManager.doLoadsAndImports();
                if (packageManager.catchedError){
                    //this has local error handling, so we need to rethrow an error to break out
                    pageManager.onError()
                    throw new Error("packageManager error")
                }

                selectorBuilder.adaptSelectorFrameColor();

                this.hideProgressBar();

                showQuickstart();
                showAccordion();
                note.innerHTML = "";

                pageManager.setupSelectPage();
            }
            catch (error){
                console.error(error)
                pageManager.onError()
            }
        }
    }

    setupSelectPage() {
        // Fill accordion and carousels with svg data
        languageManager.updateLanguageSelectorPage();
        for (const circuitSet of circuitMapper.circuitSets) {
            selectorBuilder.setupSelector(circuitSet, this);
        }
    }

    setupNavigation() {
        const navHomeLink = document.getElementById("nav-home");
        const navSelectLink = document.getElementById("nav-select");
        const navCheatLink = document.getElementById("nav-cheat");
        const navAboutLink = document.getElementById("nav-about");
        const navLogo = document.getElementById("nav-logo");
        const selectEnglish = document.getElementById("select-english");
        const selectGerman = document.getElementById("select-german");

        navHomeLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            closeNavbar();
            this.showLandingPage();
        })
        navSelectLink.addEventListener("click", async () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            closeNavbar();
            if (state.pyodideReady) {
                this.showSelectPage();
            }
            else {
                await this.landingPageStartBtnClicked();
            }
        })
        navCheatLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showCheatSheet();
        })
        navAboutLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showAboutPage();
        })
        navLogo.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            closeNavbar();
            this.showLandingPage();
        })
        selectEnglish.addEventListener("click", () => {
            languageManager.currentLang = english;
            const activeFlagIcon = document.getElementById("activeLanguageFlag");
            activeFlagIcon.setAttribute("src", "src/resources/navigation/uk.png");
            closeNavbar();
            languageManager.updatesLanguageFields();
            pushLanguageEventMatomo(configLanguageValues.English);
        })
        selectGerman.addEventListener("click", () => {
            languageManager.currentLang = german;
            const activeFlagIcon = document.getElementById("activeLanguageFlag");
            activeFlagIcon.setAttribute("src", "src/resources/navigation/germany.png");
            closeNavbar();
            languageManager.updatesLanguageFields();
            pushLanguageEventMatomo(configLanguageValues.German);
        })

        const toggler = document.getElementById("nav-toggler");
        toggler.addEventListener("click", () => {
            this.updatePagesOpacity();
        })

        const activeFlagIcon = document.getElementById("activeLanguageFlag");
        if (languageManager.currentLang === german) {
            activeFlagIcon.setAttribute("src", "src/resources/navigation/germany.png");
        }
        else if (languageManager.currentLang === english) {
            activeFlagIcon.setAttribute("src", "src/resources/navigation/uk.png");
        }
    }

    updatePagesOpacity() {
        const toggler = document.getElementById("nav-toggler");
        for (let page of this.pages) {
            if (toggler.classList.contains("collapsed")) {
                page.style.opacity = "1";
            } else {
                page.style.opacity = "0.3";
            }
        }
    }

    setupSimplifierPage() {
        languageManager.updateLanguageSimplifierPage();
        updateSimplifierPageColors();
    }

    setupCheatSheet() {
        languageManager.updateLanguageCheatSheetPage();

        // Substitution table
        const resSer = document.getElementById("resistorSeries");
        const resPar = document.getElementById("resistorParallel");
        const capSer = document.getElementById("capacitorSeries");
        const capPar = document.getElementById("capacitorParallel");
        const indSer = document.getElementById("inductorSeries");
        const indPar = document.getElementById("inductorParallel");

        resSer.innerHTML = "$$R = R1 + R2 + ...$$";
        resPar.innerHTML = "$$\\frac{1}{R} = \\frac{1}{R1} + \\frac{1}{R2} + ...$$";

        capSer.innerHTML = "$$\\frac{1}{C} = \\frac{1}{C1} + \\frac{1}{C2} + ...$$";
        capPar.innerHTML = "$$C = C1 + C2 + ...$$";

        indSer.innerHTML = "$$L = L1 + L2 + ...$$";
        indPar.innerHTML = "$$\\frac{1}{L} = \\frac{1}{L1} + \\frac{1}{L2} + ...$$";

        const pSub = document.getElementById("pSub");
        pSub.innerHTML = "<br><br><br>"

        // Complex R X table
        const resRes = document.getElementById("resistorResistance");
        resRes.innerHTML = "$$R$$";
        const resRea = document.getElementById("resistorReactance");
        resRea.innerHTML = "$$0$$";

        const capRes = document.getElementById("capacitorResistance");
        capRes.innerHTML = "$$0$$";
        const capRea = document.getElementById("capacitorReactance");
        capRea.innerHTML = "$$-\\frac{1}{ \\omega \\cdot C}$$";

        const indRes = document.getElementById("inductorResistance");
        indRes.innerHTML = "$$0$$";
        const indRea = document.getElementById("inductorReactance");
        indRea.innerHTML = "$$ \\omega \\cdot L$$";

        const pRX = document.getElementById("pRX");
        pRX.innerHTML = "$$\\mathbf{Z} = R + j \\cdot X$$" +
            "$$\\mathbf{Z} = R + j \\cdot \\sqrt{X_L - X_C}$$"
        pRX.style.color = colors.currentForeground;

        whenAvailable("MathJax", () => {
            MathJax.typeset();
        });
    }

    setupAboutPage() {
        languageManager.updateLanguageAboutPage();
        updateAboutPageColors();
    }

    onError() {
        let progressBar = document.getElementById('pgr-bar')
        progressBar.classList.remove('bg-warning');
        progressBar.classList.remove('progress-bar-striped');
        progressBar.classList.add('bg-danger');
        languageManager.currentLang.messages = ['An error occurred, please try to reload the page'];
        document.getElementById('progress-bar-note').innerText = languageManager.currentLang.messages[0];
        this.catchedError = true
    }

    hideProgressBar(){
        let progressBarContainer = document.getElementById("pgr-bar-container");
        progressBarContainer.style.display = "none";
        document.title = "Circuit Selection";
        pushPageViewMatomo("Ready");
        state.pyodideReady = true;
        state.pyodideLoading = false;
    }
}
