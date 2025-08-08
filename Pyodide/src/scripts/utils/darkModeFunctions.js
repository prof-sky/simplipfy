function setupDarkModeSwitch() {
    const darkModeSwitch = document.getElementById("darkmode-switch");
    //darkModeSwitch.checked = true; not necessary, because default mode is set in beginning
    darkModeSwitch.addEventListener("change", () => {
        if (darkModeSwitch.checked) {
            changeToDarkMode();
            pushDarkModeEventMatomo(configDarkModeValues.Dark)
        } else {
            changeToLightMode();
            pushDarkModeEventMatomo(configDarkModeValues.Light)
        }
        closeNavbar();
    });
}

function setupGameModeSwitch() {
    const gameModeSwitch = document.getElementById("game-switch");
    gameModeSwitch.addEventListener("change", () => {
        state.gamification = !!gameModeSwitch.checked;
        closeNavbar();
        if (state.gamification) {
            //addLivesField();
            setupShakeAnimation();
        } else {
            //removeLivesAndShowLogo();
        }
    });
}


function changeToDarkMode() {
    colors.setDarkModeColors()
    updateAvailableBsClassesTo(colors.bsColorSchemeDark);
    updateNavigationColorsTo(colors.bootstrapDark, colors.languagesDarkBg);
    updateCheatSheetPageColorsTo(colors.bsColorSchemeDark);
    updateSimplifierPageColors();
    updateKirchhoffModalColors();
    updateWheatstoneModalColors();
    updateUploadPageColors();
    updateNewsPageColors(colors.bsColorSchemeDark);
    updateSelectorPageColors();
    updateAboutPageColors();
    updateToolPageColors();
    updateSettingsPageColors();
    if (circuitMapper !== null) {
        updateSelectorPageSvgStrokeColor(colors.lightModeSvgStrokeColor, colors.darkModeSvgStrokeColor);
    }
}

function changeToLightMode() {
    colors.setLightModeColors()
    updateAvailableBsClassesTo(colors.bsColorSchemeLight);
    updateNavigationColorsTo(colors.bootstrapWhite, colors.languagesLightBg);
    updateCheatSheetPageColorsTo(colors.bsColorSchemeLight);
    updateSimplifierPageColors();
    updateKirchhoffModalColors();
    updateWheatstoneModalColors();
    updateUploadPageColors();
    updateNewsPageColors(colors.bsColorSchemeLight);
    updateSelectorPageColors();
    updateAboutPageColors();
    updateToolPageColors();
    updateSettingsPageColors();
    if (circuitMapper !== null) {
        updateSelectorPageSvgStrokeColor(colors.darkModeSvgStrokeColor, colors.lightModeSvgStrokeColor);
    }
}

function updateSelectorPageColors() {
    updateSelectorPageNote();
    updateSelectorSvgs();
    if (state.selectorsBuild) {
        if (circuitMapper !== null) {
            let circuitSets = circuitMapper.circuitSets;
            if (state.circuitSets !== null && state.circuitSets !== undefined) {
                circuitSets = state.circuitSets; // Use saved circuitSets in case circuitMapper.circuitSets is currently switched to upload sets
            }
            for (let circuitSet of circuitSets) {
                if (circuitSet.identifier === circuitMapper.selectorIds.quick) {
                    const quickHeading = document.getElementById(`${circuitMapper.selectorIds.quick}-heading`);
                    quickHeading.style.color = colors.currentHeadingsForeground
                    continue;
                }
                const titleBtn = document.getElementById(`${circuitSet.identifier}-acc-btn`);
                titleBtn.style.color = colors.currentHeadingsForeground;
                let flushHeading = document.getElementById(`flush-heading-${circuitSet.identifier}`);
                if (flushHeading) flushHeading.style.backgroundColor = colors.currentBsBackground;
                let selectorCounter = document.getElementById(`${circuitSet.identifier}-selector-counter`);
                if (selectorCounter) selectorCounter.style.backgroundColor = colors.currentBsBackground;
            }
        }
        const accordionButtons = document.getElementsByClassName("accordion-button");
        for (const accordionButton of accordionButtons) {
            accordionButton.style.backgroundColor = colors.currentBsBackground;
        }
        const accordionBodies = document.getElementsByClassName("accordion-body");
        for (const accordionBody of accordionBodies) {
            accordionBody.style.backgroundColor = colors.currentBsBackground;
        }
        const checkBoxes = document.getElementsByClassName("vcCheckBox");
        for (const checkBox of checkBoxes) {
            checkBox.style.color = colors.currentForeground;
        }
        const overviewModalBtns = document.getElementsByClassName("modalOverviewBtn");
        for (const overviewModalBtn of overviewModalBtns) {
            overviewModalBtn.style.color = colors.currentHeadingsForeground;
            overviewModalBtn.style.border = `1px solid ${colors.currentHeadingsForeground}`;
        }

        updateOverviewModals();
    }
}

function updateModalColors(modal) {
    modal.style.color = colors.currentHeadingsForeground;
    let modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
        modalContent.style.color = colors.currentForeground;
        modalContent.style.backgroundColor = colors.currentBsBackground;
        modalContent.style.border = `1px solid ${colors.currentForeground}`;
    }
    const sections = [
        ".modal-header",
        ".modal-body",
        ".modal-footer"
    ];
    sections.forEach(selector => {
        const el = modal.querySelector(selector);
        if (el) {
            el.style.color = colors.currentForeground;
            el.style.backgroundColor = colors.currentBsBackground;
        }
    });
}

function updateOverviewModals() {
    if (circuitMapper) {
        for (let circuitSet of circuitMapper.circuitSets) {
            const modal = document.getElementById(`${circuitSet.identifier}-overviewModal`);
            if (modal) {
                updateModalColors(modal);
            }
        }
    }
}

function updateUploadPageOverviewModals() {
    if (circuitMapper) {
        for (let circuitSet of circuitMapper.circuitSets) {
            const modal = document.getElementById(`${circuitSet.identifier}-upload-overviewModal`);
            if (modal) {
                updateModalColors(modal);
            }
        }
    }
}

function updateKirchhoffModalColors() {
    const info1 = document.getElementById("kirchhoffVInfoGif");
    const info2 = document.getElementById("kirchhoffIInfoGif");
    const gameOver = document.getElementById("gameOverModal");
    const extraLiveModal = document.getElementById("extraLiveModal");
    for (let modal of [info1, info2, gameOver, extraLiveModal]) {
        let content = modal.querySelector(".modal-content");
        content.style.color = colors.currentForeground;
        content.style.backgroundColor = colors.currentBsBackground;
        content.style.border = `1px solid ${colors.currentForeground}`;
    }
}

function updateWheatstoneModalColors() {
    const infoGif = document.getElementById("wheatstoneInfoModal");
    let content = infoGif.querySelector(".modal-content");
    content.style.color = colors.currentForeground;
    content.style.backgroundColor = colors.currentBsBackground;
    content.style.border = `1px solid ${colors.currentForeground}`;
}

function updateUploadModalColors() {
    const uploadModal = document.getElementById("uploadModal");
    const uploadModalContent = uploadModal.querySelector(".modal-content");
    uploadModalContent.style.color = colors.currentForeground;
    uploadModalContent.style.backgroundColor = colors.currentBsBackground;
    uploadModalContent.style.border = `1px solid ${colors.currentForeground}`;
    updateUploadPageOverviewModals();
}

function updateUploadOverviewModals() {
    const uploadAccordion = document.getElementById("upload-accordion");
    let usedAccordionHeadings = state.uploadCircuitSets?.map(circuitSet => circuitSet.identifier);
    if (usedAccordionHeadings) {
        for (let i = 0; i < usedAccordionHeadings.length; i++) {
            let overviewModalBtn = uploadAccordion.querySelector(`#${usedAccordionHeadings[i]}-upload-overviewModalBtn`);
            if (overviewModalBtn) {
                overviewModalBtn.style.color = colors.currentHeadingsForeground;
                overviewModalBtn.style.border = `1px solid ${colors.currentHeadingsForeground}`;
            }
            let uploadOverviewModal = document.querySelector(`#${usedAccordionHeadings[i]}-upload-overviewModal`);
            if (uploadOverviewModal) {
                let svgDivs = uploadOverviewModal.querySelectorAll(".svg-selector");
                if (svgDivs) {
                    for (const svgDiv of svgDivs) {
                        let svgData = svgDiv.innerHTML;
                        svgData = setSvgColorMode(svgData);
                        svgDiv.innerHTML = svgData;
                        svgDiv.style.border = `1px solid ${colors.currentForeground}`;
                    }
                }
                let modalContent = uploadOverviewModal.querySelector(".modal-content");
                if (modalContent) {
                    modalContent.style.color = colors.currentForeground;
                    modalContent.style.backgroundColor = colors.currentBsBackground;
                    modalContent.style.border = `1px solid ${colors.currentForeground}`;
                }
            }
        }
    }
}

function updateUploadSvgs() {
    const uploadAccordion = document.getElementById("upload-accordion");
    let svgDivs = uploadAccordion?.querySelectorAll(".svg-selector");
    if (svgDivs) {
        for (const svgDiv of svgDivs) {
            let svgData = svgDiv.innerHTML;
            svgData = setSvgColorMode(svgData);
            svgDiv.innerHTML = svgData;
        }
    }
}

function updateSelectorSvgs() {
    const uploadAccordion = document.getElementById("selector-accordion");
    let svgDivs = uploadAccordion?.querySelectorAll(".svg-selector");
    if (svgDivs) {
        for (const svgDiv of svgDivs) {
            let svgData = svgDiv.innerHTML;
            svgData = setSvgColorMode(svgData);
            svgDiv.innerHTML = svgData;
        }
    }
    // Quickstart
    let quickstartSvgDivs = document.getElementById(circuitMapper.selectorIds.quick + "-carousel")?.querySelectorAll(".svg-selector");
    if (quickstartSvgDivs) {
        for (const svgDiv of quickstartSvgDivs) {
            let svgData = svgDiv.innerHTML;
            svgData = setSvgColorMode(svgData);
            svgDiv.innerHTML = svgData;
        }
    }
}

function updateUploadAccordion() {
    const uploadAccordion = document.getElementById("upload-accordion");
    const uploadAccordionButtons = uploadAccordion?.getElementsByClassName("accordion-button");
    if (uploadAccordionButtons !== null && uploadAccordionButtons !== undefined) {
        for (const uploadAccordionButton of uploadAccordionButtons) {
            uploadAccordionButton.style.color = colors.currentHeadingsForeground;
            uploadAccordionButton.style.backgroundColor = colors.currentBsBackground;
        }
    }
    const uploadAccordionBodys = uploadAccordion?.getElementsByClassName("accordion-body");
    if (uploadAccordionBodys !== null && uploadAccordionBodys !== undefined) {
        for (const uploadAccordionBody of uploadAccordionBodys) {
            uploadAccordionBody.style.color = colors.currentForeground;
            uploadAccordionBody.style.backgroundColor = colors.currentBsBackground;
        }
    }
}

function updateUploadPageColors() {
    updateUploadModalColors();
    updateUploadAccordion();
    updateUploadSvgs();
    updateUploadOverviewModals();
}

function updateSimplifierPageColors() {
    // Info modal
    const infoGifHeader = document.getElementById("info-gif-header");
    infoGifHeader.style.color = colors.currentForeground;
    infoGifHeader.style.backgroundColor = colors.currentBsBackground;
    const infoGifBody = document.getElementById("info-gif-body");
    infoGifBody.style.color = colors.currentForeground;
    infoGifBody.style.backgroundColor = colors.currentBsBackground;
    const infoGifFooter = document.getElementById("info-gif-footer");
    infoGifFooter.style.color = colors.currentForeground;
    infoGifFooter.style.backgroundColor = colors.currentBsBackground;

    // Toggle buttons
    const toggleViewButtons = document.getElementsByClassName("toggle-view");
    for (const toggleViewButton of toggleViewButtons) {
        toggleViewButton.style.color = colors.currentForeground;
    }
}

function updateAboutPageColors() {
    const aboutText = document.getElementById("about-text");
    aboutText.style.color = colors.currentForeground;
}

function updateNewsPageColors(bsColorScheme) {
    const newsHeading = document.getElementById("news-heading");
    newsHeading.style.color = colors.currentForeground;
    const table = document.getElementById("news-text").querySelector(".table");
    updateBsClassesTo(bsColorScheme, "table", table);
}

function updateSelectorPageNote() {
    const note = document.getElementById("progress-bar-note");
    note.style.color = colors.currentForeground;
}

function updateToolPageColors() {
    let accordion = document.getElementById("tool-accordion");
    let accordionButtons = accordion?.getElementsByClassName("accordion-button");
    if (accordionButtons !== null && accordionButtons !== undefined) {
        for (const accordionButton of accordionButtons) {
            accordionButton.style.color = colors.currentHeadingsForeground;
            accordionButton.style.backgroundColor = colors.currentBsBackground;
        }
    }
    let accordionBodys = accordion?.getElementsByClassName("accordion-body");
    if (accordionBodys !== null && accordionBodys !== undefined) {
        for (const accordionBody of accordionBodys) {
            accordionBody.style.color = colors.currentForeground;
            accordionBody.style.backgroundColor = colors.currentBsBackground;
        }
    }
    let whyNote = document.getElementById("why-qr-code");
    if (whyNote) {
        whyNote.style.color = colors.currentHeadingsForeground;
    }
    // update qr code colors
    let zipNote = document.getElementById("zip-link-help");
    if (zipNote) {
        zipNote.style.color = colors.currentForeground;
    }
    // Update live drawing fields
    const elements = [
        "drawing-field-div",
        "input-live-drawing",
        "comments-switch-div",
        "label-comments-switch-generalize",
        "label-comments-switch-optimize-desktop",
        "label-comments-switch-optimize-mobile",
        "label-load-example",
        "label-comments-switch-shownodes"
    ];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.color = colors.currentForeground;
            el.style.backgroundColor = colors.currentBsBackground;
        }
    });
    // Svg color
    let liveDrawingField = document.getElementById("drawing-field-div");
    let svgData = liveDrawingField?.innerHTML;
    if (svgData) {
        svgData = setSvgColorMode(svgData);
        liveDrawingField.innerHTML = svgData;
    }
    // Editor border
    let editorHtmlElement = document.getElementsByClassName("CodeMirror")[0];
    if (editorHtmlElement) {
        editorHtmlElement.style.border = `1px solid ${colors.currentForeground}`;
    }
    // SVG Generator
    let descriptionLabel = document.getElementById("description-label-svg-generator");
    if (descriptionLabel) {
        descriptionLabel.style.color = colors.currentForeground;
    }

    let trackIdDiv = document.getElementById("trackIdDiv");
    if (trackIdDiv) {
        trackIdDiv.style.color = colors.currentForeground;
    }

    // Update descriptions
    const qrGenDesc = document.getElementById("qr-gen-head-id");
    if (qrGenDesc) qrGenDesc.style.color = colors.currentHeadingsForeground;
    const qrScanDesc = document.getElementById(`qr-scan-head-id`);
    if (qrScanDesc) qrScanDesc.style.color = colors.currentHeadingsForeground;
    const qrViewerDesc = document.getElementById(`track-view-head-id`);
    if (qrViewerDesc) qrViewerDesc.style.color = colors.currentHeadingsForeground;
    const liveDrawingDesc = document.getElementById(`live-draw-head-id`);
    if (liveDrawingDesc) liveDrawingDesc.style.color = colors.currentHeadingsForeground;

    const qrGenText = document.getElementById(`qr-gen-text-id`);
    if (qrGenText) qrGenText.style.color = colors.currentForeground;
    const qrScanText = document.getElementById(`qr-scan-text-id`);
    if (qrScanText) qrScanText.style.color = colors.currentForeground;
    const qrViewerText = document.getElementById(`track-view-text-id`);
    if (qrViewerText) qrViewerText.style.color = colors.currentForeground;
    const liveDrawingText = document.getElementById(`live-draw-text-id`);
    if (liveDrawingText) liveDrawingText.style.color = colors.currentForeground;

}

function updateSettingsPageColors() {
    let divider1 = document.getElementById("settings-divider-1");
    if (divider1) divider1.style.color = colors.currentForeground;
    let settingsPage = document.getElementById("settings-page-container");
    let paragraphs = settingsPage.getElementsByTagName("p");
    for (const paragraph of paragraphs) {
        paragraph.style.color = colors.currentForeground;
    }
}

function updateNavigationColorsTo(navigationToggleBgColor, languagesBgColor) {
    document.getElementById("navbarSupportedContent").style.backgroundColor = navigationToggleBgColor;
    updateNavLinkColorTo(colors.currentForeground);
    updateNavSelectColorTo(colors.keyYellow);
    updateLanguageSelectorColor(languagesBgColor);
}

function updateNavSelectColorTo(color) {
    let navSelect = document.getElementById("nav-select");
    navSelect.style.color = color;
}

function updateAvailableBsClassesTo(colorScheme) {
    updateBsClassesTo(colorScheme, "bg", document.getElementById("bootstrap-overrides"));  // body
    updateBsClassesTo(colorScheme, "bg", document.getElementById("navbar"));
    updateBsClassesTo(colorScheme, "navbar", document.getElementById("navbar"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("cheat-sheet-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("simplifier-page-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("select-page-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("about-page-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("news-page-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("upload-page-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("tool-page-container"));
    updateBsClassesTo(colorScheme, "bg", document.getElementById("settings-page-container"));
}


function updateBsClassesTo(colorScheme, className, element) {
    if (colorScheme === colors.bsColorSchemeLight) {
        switchBsClassToLight(className, element);
    } else if (colorScheme === colors.bsColorSchemeDark) {
        switchBsClassToDark(className, element);
    } else {
        throw Error("Only light or dark colorScheme");
    }
}

function updateNavLinkColorTo(color) {
    const navLinks = document.getElementsByClassName("nav-link");
    for (const navLink of navLinks) {
        navLink.style.color = color;
    }
}

function updateCheatSheetPageColorsTo(bsColorScheme) {
    const tables = document.getElementsByClassName("table");
    for (const table of tables) {
        updateBsClassesTo(bsColorScheme, "table", table);
    }
    const formula = document.getElementById("pRX");
    formula.style.color = colors.currentForeground;
    const wheatFormula = document.getElementById("wheatstoneFormula");
    wheatFormula.style.color = colors.currentForeground;
}

function updateSelectorPageSvgStrokeColor(fromSvgColor, toSvgColor) {
    if (state.selectorsBuild) {
        // Change border color of selectors
        const svgSelectors = document.getElementsByClassName("svg-selector");
        for (const svgSelector of svgSelectors) {
            svgSelector.style.borderColor = colors.currentForeground;
        }
        // Change svg color
        for (const circuitSet of circuitMapper.circuitSets) {
            for (const circuit of circuitSet.set) {
                // Carousels
                let svgData = document.getElementById(circuit.circuitDivID).innerHTML;
                svgData = svgData.replaceAll(fromSvgColor, toSvgColor);
                document.getElementById(circuit.circuitDivID).innerHTML = svgData;
                // Overview modal, can be null for quickstart for example
                let modal = document.getElementById(`${circuit.circuitDivID}-overviewModal`);
                if (modal !== null) {
                    let svgDataModal = modal.innerHTML;
                    svgDataModal = svgDataModal.replaceAll(fromSvgColor, toSvgColor);
                    document.getElementById(`${circuit.circuitDivID}-overviewModal`).innerHTML = svgDataModal; // overview
                }
            }
        }
    }
}

function updateLanguageSelectorColor(languagesBackground) {
    document.getElementById("darkmode-label").style.color = colors.currentForeground;
    document.getElementById("game-label").style.color = colors.currentForeground;
    document.getElementById("Dropdown").style.color = colors.currentForeground;
    document.getElementById("languagesDropdown").style.color = colors.currentForeground;
    document.getElementById("select-english").style.color = colors.currentForeground;
    document.getElementById("select-german").style.color = colors.currentForeground;
    document.getElementById("select-french").style.color = colors.currentForeground;
    document.getElementById("languagesDropdown").style.backgroundColor = languagesBackground;
}

function switchBsClassToLight(field, container) {
    if (container === null || container === undefined) {
        return;
    }
    container.classList.remove(`${field}-dark`);
    container.classList.add(`${field}-light`);
}

function switchBsClassToDark(field, container) {
    if (container === null || container === undefined) {
        return;
    }
    container.classList.remove(`${field}-light`);
    container.classList.add(`${field}-dark`);
}
