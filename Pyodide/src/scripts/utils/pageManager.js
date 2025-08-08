/**
 * The class for managing the pages of the application.
 * It handles the setups and visibility of the different pages
 * @tutorial pageManagerUsage
 */
class PageManager {
    constructor() {
        this.landingPage = document.getElementById("landing-page-container");
        this.selectPage = document.getElementById("select-page-container");
        this.simplifierPage = document.getElementById("simplifier-page-container");
        this.cheatSheet = document.getElementById("cheat-sheet-container");
        this.uploadPage = document.getElementById("upload-page-container");
        this.newsPage = document.getElementById("news-page-container");
        this.aboutPage = document.getElementById("about-page-container");
        this.toolPage = document.getElementById("tool-page-container");
        this.settingsPage = document.getElementById("settings-page-container");
        this.languageSelect = document.getElementById("Dropdown");
        this.darkModeSwitch = document.getElementById("darkmode-switch");
        this.gameModeSwitch = document.getElementById("game-switch");
        this.activeLangFlag = document.getElementById("activeLanguageFlag");
        // Add pages here if adapted
        this.pages = [
            this.landingPage, this.selectPage, this.simplifierPage,
            this.cheatSheet, this.uploadPage, this.aboutPage,
            this.newsPage, this.toolPage, this.settingsPage]
        // Also remember to update for new pages
        // - create container in index.html
        // - adapt updateAvailableBsClassesTo()
        // - adapt updatesLanguageFields()
        // - changeToDarkMode with the right updatePageColors function
        // Also adapt the navigation and links in it (languageManager etc)
    }

    _showPage(page) {
        this.pages.forEach(p => {
            if (p === page) {
                p.style.display = "block";
            } else {
                p.style.display = "none";
            }
        });
    }

    showLandingPage() {
        resetLandingPageContainers();
        this._showPage(this.landingPage);
        this.enableSettings();
        for (let feature of document.querySelectorAll(".feature-container")) {
            feature.classList.remove("visible");
        }
        document.title = "simpliPFy";
        pushPageViewMatomo();
        scrollBodyToTop();
        this.landingPage.classList.remove("slide-out-left");
        this.landingPage.classList.remove("slide-in-right");
    }

    showSelectPage() {
        state.valuesShown = new Map(); // by default symbols shown
        this._showPage(this.selectPage);
        this.enableSettings();
        pushPageViewMatomo("Selector");
        scrollBodyToTop();
        //resetLives();
        if (state.circuitSets !== null) {
            // in case the selector page was not yet build, just for safety
            circuitMapper.circuitSets = state.circuitSets; // reload default set
        }
    }

    showSimplifierPage() {
        const landingPage = document.getElementById("landing-page-container");
        const selectorPage = document.getElementById("select-page-container");
        const uploadPage = document.getElementById("upload-page-container");
        const simplifierPage = document.getElementById("simplifier-page-container");
        const toolPage = document.getElementById("tool-page-container");
        setTimeout(() => {
            simplifierPage.style.display = "block";
            simplifierPage.classList.add("slide-in-right");
            selectorPage.classList.add("slide-out-left");
            selectorPage.style.opacity = "0.1";
            if (uploadPage.style.display === "block") {
                uploadPage.classList.add("slide-out-left");
                uploadPage.style.opacity = "0.1";
            }
            if (toolPage.style.display === "block") {
                toolPage.classList.add("slide-out-left");
                toolPage.style.opacity = "0.1";
            }
            if (landingPage.style.display === "block") {
                landingPage.classList.add("slide-out-left");
                landingPage.style.opacity = "0.1";
            }
        }, 300);

        setTimeout(() => {
            selectorPage.style.display = "none";
            uploadPage.style.display = "none";
            toolPage.style.display = "none";
            landingPage.style.display = "none";
            scrollBodyToTop();
        }, 800);
    }

    async showCheatSheet() {
        this._showPage(this.cheatSheet);
        this.enableSettings();
        pushPageViewMatomo("Cheat Sheet");
        scrollBodyToTop();
        await MathJax.typesetPromise();
    }

    showUploadPage() {
        this._showPage(this.uploadPage);
        this.enableSettings();
        pushPageViewMatomo("Upload");
        scrollBodyToTop();
        this.uploadPage.classList.remove("slide-out-left");

        if (state.uploadCircuitSets !== null) {
            circuitMapper.circuitSets = state.uploadCircuitSets; // reload upload set
        }
        if (state.isLinkedZip && !state.isLinkedAlertShown) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.uploadNote, "info", false, "upload-note");
            },0);
            state.isLinkedAlertShown = true;
        }
    }

    showNewsPage() {
        this._showPage(this.newsPage);
        this.enableSettings();
        pushPageViewMatomo("News");
        scrollBodyToTop();
    }

    showAboutPage() {
        this._showPage(this.aboutPage);
        this.enableSettings();
        pushPageViewMatomo("About");
        scrollBodyToTop();
    }

    showToolPage() {
        this._showPage(this.toolPage);
        this.enableSettings();
        this.toolPage.classList.remove("slide-out-left");
        pushPageViewMatomo("Tools");
        scrollBodyToTop();
    }

    showSettingsPage() {
        this._showPage(this.settingsPage);
        this.enableSettings();
        pushPageViewMatomo("Settings");
        scrollBodyToTop();
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

    // ########################## Setups ########################################
    setupLandingPage() {
        languageManager.updateLanguageLandingPage();

        this.addImagesToCarousel();

        const landingStartButton = document.getElementById("start-button");
        landingStartButton.addEventListener("click", async () => {
            await this.landingPageStartBtnClicked();
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

    addImagesToCarousel() {
        // Default "Bild2" already loaded in index.html, this is only additionally
        let carousel = document.getElementById("landing-page-carousel");
        let images = [
            "src/resources/landingpage/Bild3.png",
            "src/resources/landingpage/Bild4.png",
            "src/resources/landingpage/Bild7.png",
            "src/resources/landingpage/Bild8.png",
            "src/resources/landingpage/Bild9.png",
            "src/resources/landingpage/Bild12.png",
            "src/resources/landingpage/Bild14.png",
            "src/resources/landingpage/Bild16.png"
        ]
        for (let imageSrc of images) {
            let img = `<img src="${imageSrc}" alt="Example Image">`;
            let item = document.createElement("div");
            item.classList.add("carousel-item");
            item.innerHTML = img;
            carousel.appendChild(item);
        }
    }

    async landingPageStartBtnClicked() {
        try {
            this.showSelectPage();
            if (!state.selectorsBuild) {
                const note = showWaitingNote();
                setPgrBarTo(60);

                await state.circuitsLoadedPromise;
                await state.overviewSvgsLoadedPromise;

                selectorBuilder.adaptSelectorFrameColor();
                this.hideProgressBar();
                note.innerHTML = "";

                showQuickstart();
                showAccordion();

                state.selectorsBuild = true;
                updateSelectorPageColors(); // after setting selectorsBuild true

                if (state.pyodideReady) {
                    enableBlockedStuff();
                }
                state.options = await getWheatstoneValues();
                selectorBuilder.updateSelectorCounters(); // update for wheatstone values
                setupSelectPageEasterEggs(); // after everything is loaded
            }
        } catch (error) {
            console.error(error)
            pageManager.onError();
            setTimeout(() => {
                showMessage(error, "error", false);
            });
        }

    }

    async setupSelectPage() {
        return new Promise(async (resolve) => {
            // Fill accordion and carousels with svg data
            languageManager.updateLanguageSelectorPage();
            for (const circuitSet of circuitMapper.circuitSets) {
                await selectorBuilder.setupSelector(circuitSet, this);
            }
            resolve();
        });
    }

    setupNavigation() {
        languageManager.updateNavigation();

        const navHomeLink = document.getElementById("nav-home");
        const navSelectLink = document.getElementById("nav-select");
        const navCheatLink = document.getElementById("nav-cheat");
        const navUploadLink = document.getElementById("nav-upload");
        const navToolsLink = document.getElementById("nav-tools");
        const navNewsLink = document.getElementById("nav-news");
        const navAboutLink = document.getElementById("nav-about");
        const navSettingsLink = document.getElementById("nav-settings");
        const navLogo = document.getElementById("nav-logo");
        const selectEnglish = document.getElementById("select-english");
        const selectGerman = document.getElementById("select-german");
        const selectFrench = document.getElementById("select-french");

        navLogo.style.cursor = "default";
        navLogo.style.userSelect = "none";

        navHomeLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            closeNavbar();
            this.showLandingPage();
        })
        navSelectLink.addEventListener("click", async () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            closeNavbar();
            if (state.pyodideReady && state.selectorsBuild) {
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
        navUploadLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showUploadPage();
        });
        navToolsLink.addEventListener("click", () => {
           checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showToolPage();
        });
        navNewsLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showNewsPage();
        });
        navAboutLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showAboutPage();
        })
        navSettingsLink.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();
            closeNavbar();
            this.showSettingsPage();
        });
        navLogo.addEventListener("click", () => {
            checkIfSimplifierPageNeedsReset();  // must be in front of page change
            closeNavbar();
            this.showLandingPage();
        })
        selectEnglish.addEventListener("click", () => {
            languageManager.currentLang = english;
            localStorage.setItem("language", englishShortSymbol);
            this.activeLangFlag.setAttribute("src", "src/resources/navigation/uk.png");
            closeNavbar();
            languageManager.updatesLanguageFields();
            pushLanguageEventMatomo(configLanguageValues.English);
        })
        selectGerman.addEventListener("click", () => {
            languageManager.currentLang = german;
            localStorage.setItem("language", germanShortSymbol);
            this.activeLangFlag.setAttribute("src", "src/resources/navigation/germany.png");
            closeNavbar();
            languageManager.updatesLanguageFields();
            pushLanguageEventMatomo(configLanguageValues.German);
        })
        selectFrench.addEventListener("click", () => {
            languageManager.currentLang = french;
            localStorage.setItem("language", frenchShortSymbol);
            this.activeLangFlag.setAttribute("src", "src/resources/navigation/french.png");
            closeNavbar();
            languageManager.updatesLanguageFields();
            pushLanguageEventMatomo(configLanguageValues.French);
        })

        const toggler = document.getElementById("nav-toggler");
        toggler.addEventListener("click", () => {
            this.updatePagesOpacity();
        })

        if (languageManager.currentLang === german) {
            this.activeLangFlag.setAttribute("src", "src/resources/navigation/germany.png");
        } else if (languageManager.currentLang === english) {
            this.activeLangFlag.setAttribute("src", "src/resources/navigation/uk.png");
        } else if (languageManager.currentLang === french) {
            this.activeLangFlag.setAttribute("src", "src/resources/navigation/french.png");
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
        updateKirchhoffModalColors();
        updateWheatstoneModalColors();
        updateUploadModalColors();
        if (state.gamification) {
            setupShakeAnimation();
        }
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
        pRX.innerHTML = "$$\\underline{Z} = R + j \\cdot X$$" +
            "$$\\underline{Z} = R + j \\cdot \\sqrt{X_L - X_C}$$"
        pRX.style.color = colors.currentForeground;

        const wheatstoneFormula = document.getElementById("wheatstoneFormula");
        wheatstoneFormula.innerHTML = `$$${languageManager.currentLang.voltageSymbol}q \\cdot \\left(\\frac{R2}{R1 + R2} - \\frac{R4}{R3 + R4}\\right) = ${languageManager.currentLang.voltageSymbol}m$$`;
        wheatstoneFormula.style.color = colors.currentForeground;
    }

    setupNewsPage() {
        this.createNewsTable();
        languageManager.updateLanguageNewsPage();
        updateNewsPageColors(colors.currentBsColorScheme);
    }

    setupAboutPage() {
        languageManager.updateLanguageAboutPage();
        updateAboutPageColors();
        this.changeListPadding();
    }

    changeListPadding() {
        let usedLibs = this.aboutPage.querySelector("ul");
        if (usedLibs) {
            usedLibs.style.paddingLeft = "0";
        }
    }

    setupSettingsPage() {
        this.createSettingsContent();
    }

    createSettingsContent() {
        this.createCounterReset();
        this.createSpeedModeSetting();
    }

    createCounterReset() {
        let div = document.createElement("div");
        let resetText = document.createElement("p");
        resetText.id = "reset-text";
        resetText.innerHTML = languageManager.currentLang.resetText;
        resetText.style.color = colors.currentForeground;
        resetText.classList.add("mx-auto");
        resetText.classList.add("mt-3");
        resetText.style.maxWidth = "400px";
        div.appendChild(resetText);

        // Add a button to reset the cached circuit counters
        const resetCountersBtn = document.createElement("button");
        resetCountersBtn.id = "reset-counters-btn";
        resetCountersBtn.classList.add("btn", "btn-danger", "text-white", "mt-3", "px-5");
        resetCountersBtn.style.color = colors.keyDark;
        resetCountersBtn.disabled = true;
        resetCountersBtn.innerHTML = languageManager.currentLang.resetBtn;
        div.appendChild(resetCountersBtn);
        this.settingsPage.appendChild(div);

        resetCountersBtn.addEventListener("click", () => {
            selectorBuilder.resetCircuitCounters();
            selectorBuilder.updateSelectorCounters();
            setTimeout(() => {
                showMessage(languageManager.currentLang.resetMessage, "info")
            }, 0);
        });
    }

    createSpeedModeSetting() {
        // Add for ranges for the speed mode
        // In seconds:
        let stepSize = 0.5;
        let simplBaseTimeMin = 3;
        let simplBaseTimeMax = 20;
        let simplAddTimeMin = 0;
        let simplAddTimeMax = 5;
        let kirchhoffBaseTimeMin = 3;
        let kirchhoffBaseTimeMax = 20;
        let kirchhoffAddTimeMin = 0;
        let kirchhoffAddTimeMax = 5;

        // Add divider
        let divider = document.createElement("hr");
        divider.classList.add("hr", "mt-5", "mb-3", "mx-auto");
        divider.id = "settings-divier-1";
        divider.style.color = colors.currentForeground;
        divider.style.maxWidth = "600px";
        this.settingsPage.appendChild(divider);

        let div = document.createElement("div");
        let speedModeTitle = document.createElement("p");
        speedModeTitle.id = "speed-mode-settings-title";
        speedModeTitle.classList.add("mt-5");
        speedModeTitle.innerHTML = `<b>${languageManager.currentLang.speedModeSettingsTitle}</b>`;
        speedModeTitle.style.color = colors.currentForeground;
        div.appendChild(speedModeTitle);

        // ========================= Range 1 - Simplifier Base time ========================
        let simplifierBaseRange = document.createElement("input");
        simplifierBaseRange.type = "range";
        simplifierBaseRange.classList.add("form-range", "mx-auto");
        simplifierBaseRange.id = "simplifier-base-range";
        simplifierBaseRange.min = simplBaseTimeMin.toString();
        simplifierBaseRange.max = simplBaseTimeMax.toString();
        simplifierBaseRange.step = stepSize.toString();
        simplifierBaseRange.value = (state.simplifierSolveTimeMs / 1000).toString();
        simplifierBaseRange.style.width = "90%";
        simplifierBaseRange.style.maxWidth = "450px";

        let simplifierBaseLabel = document.createElement("p");
        simplifierBaseLabel.id = "simplifier-base-label";
        simplifierBaseLabel.style.color = colors.currentForeground;
        simplifierBaseLabel.innerHTML = languageManager.currentLang.simplifierBaseTimeLabel + ` (${(state.simplifierSolveTimeMs / 1000).toFixed(1)}s)`;

        // Update the value when the range is changed
        simplifierBaseRange.addEventListener("input", () => {
            state.simplifierSolveTimeMs = parseFloat(simplifierBaseRange.value) * 1000;
            simplifierBaseLabel.innerHTML = languageManager.currentLang.simplifierBaseTimeLabel + ` (${(state.simplifierSolveTimeMs / 1000).toFixed(1)}s)`;
        });
        div.appendChild(simplifierBaseLabel);
        div.appendChild(simplifierBaseRange);

        // ========================= Range 2 - Simplifier Add time ========================
        let simplifierAddRange = document.createElement("input");
        simplifierAddRange.type = "range";
        simplifierAddRange.classList.add("form-range", "mx-auto");
        simplifierAddRange.id = "simplifier-add-range";
        simplifierAddRange.min = simplAddTimeMin.toString();
        simplifierAddRange.max = simplAddTimeMax.toString();
        simplifierAddRange.step = stepSize.toString();
        simplifierAddRange.value = (state.simplifierAddTimeMs / 1000).toString();
        simplifierAddRange.style.width = "90%";
        simplifierAddRange.style.maxWidth = "450px";

        let simplifierAddLabel = document.createElement("p");
        simplifierAddLabel.id = "simplifier-add-label";
        simplifierAddLabel.style.color = colors.currentForeground;
        simplifierAddLabel.innerHTML = languageManager.currentLang.simplifierAddTimeLabel + ` (${(state.simplifierAddTimeMs / 1000).toFixed(1)}s)`;

        // Update the value when the range is changed
        simplifierAddRange.addEventListener("input", () => {
            state.simplifierAddTimeMs = parseFloat(simplifierAddRange.value) * 1000;
            simplifierAddLabel.innerHTML = languageManager.currentLang.simplifierAddTimeLabel + ` (${(state.simplifierAddTimeMs / 1000).toFixed(1)}s)`;
        });
        div.appendChild(simplifierAddLabel);
        div.appendChild(simplifierAddRange);

        // ========================= Range 3 - Kirchhoff Base time ========================
        let kirchhoffBaseRange = document.createElement("input");
        kirchhoffBaseRange.type = "range";
        kirchhoffBaseRange.classList.add("form-range", "mx-auto");
        kirchhoffBaseRange.id = "kirchhoff-base-range";
        kirchhoffBaseRange.min = kirchhoffBaseTimeMin.toString();
        kirchhoffBaseRange.max = kirchhoffBaseTimeMax.toString();
        kirchhoffBaseRange.step = stepSize.toString();
        kirchhoffBaseRange.value = (state.kirchhoffSolveTimeMs / 1000).toString();
        kirchhoffBaseRange.style.width = "90%";
        kirchhoffBaseRange.style.maxWidth = "450px";

        let kirchhoffBaseLabel = document.createElement("p");
        kirchhoffBaseLabel.id = "kirchhoff-base-label";
        kirchhoffBaseLabel.style.color = colors.currentForeground;
        kirchhoffBaseLabel.innerHTML = languageManager.currentLang.kirchhoffBaseTimeLabel + ` (${(state.kirchhoffSolveTimeMs / 1000).toFixed(1)}s)`;

        // Update the value when the range is changed
        kirchhoffBaseRange.addEventListener("input", () => {
            state.kirchhoffSolveTimeMs = parseFloat(kirchhoffBaseRange.value) * 1000;
            kirchhoffBaseLabel.innerHTML = languageManager.currentLang.kirchhoffBaseTimeLabel + ` (${(state.kirchhoffSolveTimeMs / 1000).toFixed(1)}s)`;
        });
        div.appendChild(kirchhoffBaseLabel);
        div.appendChild(kirchhoffBaseRange);

        // ========================= Range 3 - Kirchhoff Base time ========================
        let kirchhoffAddRange = document.createElement("input");
        kirchhoffAddRange.type = "range";
        kirchhoffAddRange.classList.add("form-range", "mx-auto");
        kirchhoffAddRange.id = "kirchhoff-add-range";
        kirchhoffAddRange.min = kirchhoffAddTimeMin.toString();
        kirchhoffAddRange.max = kirchhoffAddTimeMax.toString();
        kirchhoffAddRange.step = stepSize.toString();
        kirchhoffAddRange.value = (state.kirchhoffAddTimeMs / 1000).toString();
        kirchhoffAddRange.style.width = "90%";
        kirchhoffAddRange.style.maxWidth = "450px";

        let kirchhoffAddLabel = document.createElement("p");
        kirchhoffAddLabel.id = "kirchhoff-add-label";
        kirchhoffAddLabel.style.color = colors.currentForeground;
        kirchhoffAddLabel.innerHTML = languageManager.currentLang.kirchhoffBaseTimeLabel + ` (${(state.kirchhoffAddTimeMs / 1000).toFixed(1)}s)`;

        // Update the value when the range is changed
        kirchhoffAddRange.addEventListener("input", () => {
            state.kirchhoffAddTimeMs = parseFloat(kirchhoffAddRange.value) * 1000;
            kirchhoffAddLabel.innerHTML = languageManager.currentLang.kirchhoffBaseTimeLabel + ` (${(state.kirchhoffAddTimeMs / 1000).toFixed(1)}s)`;
        });
        div.appendChild(kirchhoffAddLabel);
        div.appendChild(kirchhoffAddRange);

        this.settingsPage.appendChild(div);
    }

    setupUploadPage() {
        languageManager.updateLanguageUploadPage();
        let uploadContainer = document.getElementById("upload-page-container");

        let div = document.createElement("div");
        div.classList.add("mb-3");
        div.id = "upload-div";

        let input = this.createZipDirInput();
        div.appendChild(input);

        let helpBtn = this.createHelpBtn();
        input.insertAdjacentElement("beforebegin", helpBtn);

        let btn = this.createUploadBtn();
        input.insertAdjacentElement("afterend", btn);

        input.addEventListener("change", (event) => {
            state.selectedZipDir = event.target.files[0];
            if (state.pyodideReady) {
                btn.classList.remove("disabled");
            }
            document.getElementById("upload-note")?.remove();
        });

        btn.addEventListener("click", async () => {
            btn.classList.add("disabled");
            input.value = "";
            await this.uploadBtnClickedHandler();
        });

        uploadContainer.appendChild(div);
        updateUploadPageColors();
    }

    async uploadBtnClickedHandler() {
        if (!state.selectedZipDir) {
            setTimeout(() => {
                showMessage(languageManager.currentLang.alertNoDirSelected, "info");
            }, 0);
            return;
        }

        try {
            // Clear accordion
            let accordion = document.getElementById("upload-accordion");
            if (accordion) {
                accordion.remove();
            }
            // Let default circuits load first to make sure there are no conflicts
            await state.overviewSvgsLoadedPromise;
            this.clearCircuitSets();

            // Reads the circuits from the zip file, map for user circuits
            await circuitMapper.mapCircuits(true);
            let res = await circuitMapper.checkCircuitStructure(circuitMapper.circuitDirs);
            if (res < 0) {
                return;
            }
            selectorBuilder.buildUploadSelectors();
            for (const circuitSet of circuitMapper.circuitSets) {
                await selectorBuilder.setupSelector(circuitSet, this, true);
            }
            // Save loaded set, parse(stringify()) to remove references
            state.uploadCircuitSets = JSON.parse(JSON.stringify(circuitMapper.circuitSets));

            updateUploadPageColors();
            languageManager.updateLanguageUploadPage();
        } catch (err) {
            console.error(languageManager.currentLang.alertErrorSettingUpOwnCircuits, err);
        }
    }

    setupToolPage() {
        // Create accordion for tools
        let toolAccordion = this.createToolAccordion();
        // Add QR Generator
        let accQRItem = createGeneratorItem();
        toolAccordion.appendChild(accQRItem);
        // Add QR Code scanner
        let accScannerItem = createScannerItem();
        toolAccordion.appendChild(accScannerItem);
        // Add trackViewer
        let tracker = createTrackViewerItem();
        toolAccordion.appendChild(tracker);
        // Add live drawing
        let accLiveDrawItem = createLiveDrawingItem();
        toolAccordion.appendChild(accLiveDrawItem);
        // Add svg Generator
        let accSvgItem = createSvgGeneratorItem();
        toolAccordion.appendChild(accSvgItem);

        this.toolPage.appendChild(toolAccordion);

        let descriptionDiv = this.createDescriptionDiv();
        this.toolPage.appendChild(descriptionDiv);

        languageManager.updateLanguageToolPage();
        updateToolPageColors();

        // Eventlisteners and further setups
        addQRCodeGeneratorEventlisteners();
        addQrCodeScannerEventlisteners();
        addLiveDrawingEventlisteners();
        addSvgGeneratorEventlisteners();
        addTrackViewerEventlisteners();
    }

    createDescriptionDiv() {
        const descriptionDiv = document.createElement("div");
        descriptionDiv.id = "tool-description";
        descriptionDiv.style.color = colors.currentForeground;
        descriptionDiv.style.padding = "2rem";
        descriptionDiv.style.borderRadius = "12px";
        descriptionDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        descriptionDiv.style.maxWidth = "800px";
        descriptionDiv.style.margin = "2rem auto";
        descriptionDiv.style.lineHeight = "1.6";

        descriptionDiv.innerHTML = `
            <div class="container">
                <div class="row g-4">
                    ${this.generateGridToolItem("qr-gen", languageManager.currentLang.descrQrGenHead, languageManager.currentLang.descrQrGenText, "src/resources/tools/qrIcon.svg")}
                    ${this.generateGridToolItem("qr-scan", languageManager.currentLang.descrQrScanHead, languageManager.currentLang.descrQrScanText, "src/resources/tools/scanQR.svg")}
                    ${this.generateGridToolItem("track-view", languageManager.currentLang.descrTrackViewerHead, languageManager.currentLang.descrTrackViewerText, "src/resources/tools/teacherLaptop.svg")}
                    ${this.generateGridToolItem("live-draw", languageManager.currentLang.descrLiveDrawHead, languageManager.currentLang.descrLiveDrawText, "src/resources/tools/keyboard.svg")}
                </div>
            </div>
        `;

        let headings = descriptionDiv.querySelectorAll("h5");
        for (let heading of headings) {
            heading.style.color = colors.currentHeadingsForeground;
        }

        let paragraphs = descriptionDiv.querySelectorAll("p");
        for (let paragraph of paragraphs) {
            paragraph.style.color = colors.currentForeground;
            paragraph.style.fontSize = "1rem";
            paragraph.style.marginBottom = "1rem";
            paragraph.style.marginInline = "auto";
            paragraph.style.textAlign = "center";
        }

        return descriptionDiv;
    }

    generateGridToolItem(id, heading, text, iconSrc) {
        return `<div class="col-12 col-md-6 d-flex">
                <div class="text-center text-light h-100 w-100 d-flex flex-column justify-content-between p-3 rounded">
                    <div>
                        <div class="mb-3">
                            <img src="${iconSrc}" style="height: 40px" alt="${heading}" class="img-fluid">
                        </div>
                        <h5 id="${id}-head-id">${heading}</h5>
                        <p id="${id}-text-id" class="mt-2">${text}</p>
                    </div>
                </div>
            </div>`;
    }


    createToolAccordion() {
        let toolAccordion = document.createElement("div");
        toolAccordion.classList.add("accordion", "accordion-flush", "mt-5", "mx-auto");
        toolAccordion.id = "tool-accordion";
        toolAccordion.setAttribute("role", "tablist");
        toolAccordion.setAttribute("aria-multiselectable", "true");
        toolAccordion.setAttribute("aria-label", "Tools");
        toolAccordion.style.width = "100%";
        toolAccordion.style.maxWidth = "750px";
        toolAccordion.style.color = colors.currentForeground;
        toolAccordion.style.backgroundColor = colors.currentBsBackground;
        return toolAccordion;
    }

    createUploadBtn() {
        let btn = document.createElement("button");
        btn.id = "upload-btn";
        btn.classList.add("btn", "btn-warning", "text-dark", "mt-3", "px-5", "circuitStartBtn", "disabled");
        btn.innerHTML = `<div class="fill-layer"></div>
                        <div class="progress-stripes"></div>    
                        <span class="button-text">${languageManager.currentLang.uploadBtn}</span>`;
        return btn;
    }

    createZipDirInput() {
        let input = document.createElement("input");
        input.classList.add("form-control");
        input.classList.add("mx-auto");
        input.setAttribute("type", "file");
        input.setAttribute("id", "zip-dir-upload-input");
        input.setAttribute("accept", ".zip");
        input.style.width = "fit-content";
        input.style.maxWidth = "350px";
        input.style.color = colors.currentForeground;
        input.style.backgroundColor = colors.currentBsBackground;
        return input;
    }

    clearCircuitSets() {
        circuitMapper.circuitSets.length = 0;
        circuitMapper._quickstart.set.length = 0;
        circuitMapper._mixed.set.length = 0;
        circuitMapper._resistor.set.length = 0;
        circuitMapper._capacitor.set.length = 0;
        circuitMapper._inductor.set.length = 0;
        circuitMapper._symbolic.set.length = 0;
        circuitMapper._kirchhoff.set.length = 0;
        circuitMapper._wheatstone.set.length = 0;
    }

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

    onError() {
        let progressBar = document.getElementById('pgr-bar')
        progressBar.classList.remove('bg-warning');
        progressBar.classList.remove('progress-bar-striped');
        progressBar.classList.add('bg-danger');
        progressBar.style.width = "100%";
        languageManager.currentLang.messages = ['An error occurred, please try to reload the page'];
        let pgrBarNote = document.getElementById('progress-bar-note');
        pgrBarNote.innerText = languageManager.currentLang.messages[0];
        pgrBarNote.style.color = colors.currentForeground;
    }

    createNewsTable() {
        const newsText = document.getElementById("news-text");
        newsText.innerHTML = "";

        let table = document.createElement("table");
        table.classList.add("table");
        table.classList.add("table-dark");

        let tbody = document.createElement("tbody");
        for (let [i, news] of languageManager.currentLang.newsList.entries()) {
            let date = news.date;
            let dateId = `news-date-${i}`;
            let feature = news.text;
            let featureId = `news-feature-${i}`;

            let tr = document.createElement("tr");
            let tdDate = document.createElement("td");
            tdDate.innerHTML = date;
            tdDate.id = dateId;
            tdDate.style.whiteSpace = "nowrap";
            tdDate.style.textAlign = "left";
            tdDate.style.verticalAlign = "top";
            let tdFeature = document.createElement("td");
            tdFeature.innerHTML = feature;
            tdFeature.id = featureId;
            tdFeature.style.textAlign = "left";
            tdFeature.style.verticalAlign = "top";
            tdFeature.style.whiteSpace = "pre-wrap"; // allows \n in text
            tr.appendChild(tdDate);
            tr.appendChild(tdFeature);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        newsText.appendChild(table);
    }

    hideProgressBar(){
        let progressBarContainer = document.getElementById("pgr-bar-container");
        progressBarContainer.style.display = "none";
        pushPageViewMatomo("Ready");
    }

    createHelpBtn() {
        let infoBtn = document.createElement("button");
        infoBtn.type = "button";
        infoBtn.classList.add("btn", "btn-primary", "my-5");
        infoBtn.style.color = colors.keyYellow;
        infoBtn.style.border = `1px solid ${colors.keyYellow}`;
        infoBtn.style.background = "none";
        infoBtn.innerText = languageManager.currentLang.uploadHelpBtn;
        infoBtn.setAttribute("data-bs-toggle", "modal");
        infoBtn.setAttribute("data-bs-target", "#uploadModal");
        infoBtn.id = "upload-help-btn";
        infoBtn.onclick = () => {infoBtn.blur()};  // make sure focus is removed when opening modal
        return infoBtn;
    }

    async setupEasterEggs() {
        await state.circuitsLoadedPromise; // first things first, here pyodide and circuits are loaded
        fetchEasterEggImages();
        setupLandingPageEasterEggs();
        setupCheatSheetEasterEggs();
    }
}
