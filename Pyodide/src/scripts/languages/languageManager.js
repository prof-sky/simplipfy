class LanguageManager {
    currentLang = german;

    async updatesLanguageFields() {
        this.updateLanguageLandingPage();
        this.updateLanguageSelectorPage();
        this.updateLanguageSimplifierPage();
        this.updateLanguageCheatSheetPage();
        this.updateLanguageUploadPage();
        this.updateLanguageToolPage();
        this.updateLanguageNewsPage();
        this.updateLanguageAboutPage();
        this.updateNavigation();
        this.updateLanguageSettingsPage();
        await MathJax.typesetPromise();
    }

    updateLanguageLandingPage() {
        document.getElementById("landing-page-greeting").innerHTML = this.currentLang.landingPageGreeting;
        document.getElementById("key-feature1heading").innerHTML = this.currentLang.keyFeature1heading;
        document.getElementById("key-feature1").innerHTML = this.currentLang.keyFeature1;
        document.getElementById("key-feature2").innerHTML = this.currentLang.keyFeature2;
        document.getElementById("key-feature2heading").innerHTML = this.currentLang.keyFeature2heading;
        document.getElementById("key-feature3").innerHTML = this.currentLang.keyFeature3;
        document.getElementById("key-feature3heading").innerHTML = this.currentLang.keyFeature3heading;
        document.getElementById("landing-page-explanation1").innerHTML = this.currentLang.landingPageExplanation1;
    }

    updateNavigation() {
        const navHomeLink = document.getElementById("nav-home");
        navHomeLink.innerHTML = this.currentLang.home.toUpperCase();
        const navSelectLink = document.getElementById("nav-select");
        navSelectLink.innerHTML = this.currentLang.simplifier.toUpperCase();
        const navCheatLink = document.getElementById("nav-cheat");
        navCheatLink.innerHTML = this.currentLang.cheatsheet.toUpperCase();
        const navUploadLink = document.getElementById("nav-upload");
        navUploadLink.innerHTML = this.currentLang.upload.toUpperCase();
        const navToolsLink = document.getElementById("nav-tools");
        navToolsLink.innerHTML = this.currentLang.tools.toUpperCase();
        const navAboutLink = document.getElementById("nav-about");
        navAboutLink.innerHTML = this.currentLang.about.toUpperCase();
        const navNewsLink = document.getElementById("nav-news");
        navNewsLink.innerHTML = this.currentLang.news.toUpperCase();
        const navDarkMode = document.getElementById("darkmode-label");
        navDarkMode.innerHTML = this.currentLang.darkmode.toUpperCase();
        const navGameMode = document.getElementById("game-label");
        navGameMode.innerHTML = this.currentLang.gamemode.toUpperCase();
        const navDataPrivacy = document.getElementById("nav-dataprivacy");
        navDataPrivacy.innerHTML = this.currentLang.dataprivacy;
        const navLegal = document.getElementById("nav-legal");
        navLegal.innerHTML = this.currentLang.legal;
        const navSettings = document.getElementById("nav-settings");
        navSettings.innerHTML = this.currentLang.settings.toUpperCase();
    }

    updateLanguageSelectorPage() {
        // circuit mapper is only instantiated in when start button pressed
        if (circuitMapper !== null) {
            for (let circuitSet of circuitMapper.circuitSets) {
                if (circuitSet.identifier === circuitMapper.selectorIds.quick) {
                    const quickHeading = document.getElementById(`${circuitMapper.selectorIds.quick}-heading`);
                    quickHeading.innerHTML = this.currentLang.selectorHeadings[circuitMapper.selectorIds.quick];
                    continue;
                }
                const titleBtn = document.getElementById(`${circuitSet.identifier}-acc-btn`);
                titleBtn.innerHTML = this.currentLang.selectorHeadings[circuitSet.identifier];
                const overviewModalBtn = document.getElementById(`${circuitSet.identifier}-overviewModalBtn`);
                overviewModalBtn.innerHTML = this.currentLang.overviewModalBtn;
            }
        }
    }

    updateLanguageSimplifierPage() {
        this.updateSimplifierModal();
        this.updateKirchhoffModal();
        this.updateGamificationModal();
        this.updateWheatstoneModal();
    }

    updateGamificationModal() {
        const gameOverHeading = document.getElementById("game-over-title");
        gameOverHeading.innerHTML = this.currentLang.gameOverHeading;
        const gameOverText = document.getElementById("game-over-text");
        gameOverText.innerHTML = this.currentLang.gameOverText;
        const gameOverCloseBtn = document.getElementById("game-over-close-btn");
        gameOverCloseBtn.innerHTML = this.currentLang.closeBtn;
        const extraLiveHeading = document.getElementById("extra-live-title");
        extraLiveHeading.innerHTML = this.currentLang.gameOverHeading;
        const extraLiveText = document.getElementById("extra-live-text");
        extraLiveText.innerHTML = this.currentLang.extraLiveText;
        const extraLiveCloseBtn = document.getElementById("extra-live-close-btn");
        extraLiveCloseBtn.innerHTML = this.currentLang.closeBtn;
    }

    updateKirchhoffModal() {
        const kirchVInfoGifHeading = document.getElementById("kirchV-info-gif-title");
        kirchVInfoGifHeading.innerHTML = this.currentLang.kirchVInfoGifHeading;
        const kirchVInfoGifText = document.getElementById("kirchV-info-gif-text");
        kirchVInfoGifText.innerHTML = this.currentLang.kirchVInfoGifText;
        const kirchVCloseBtn = document.getElementById("kirchV-info-gif-close-btn");
        kirchVCloseBtn.innerHTML = this.currentLang.closeBtn;
        const kirchIInfoGifHeading = document.getElementById("kirchI-info-gif-title");
        kirchIInfoGifHeading.innerHTML = this.currentLang.kirchIInfoGifHeading;
        const kirchIInfoGifText = document.getElementById("kirchI-info-gif-text");
        kirchIInfoGifText.innerHTML = this.currentLang.kirchIInfoGifText;
        const kirchICloseBtn = document.getElementById("kirchI-info-gif-close-btn");
        kirchICloseBtn.innerHTML = this.currentLang.closeBtn;
    }

    updateWheatstoneModal() {
        const wheatstoneInfoGifHeading = document.getElementById("wheatstone-info-gif-title");
        wheatstoneInfoGifHeading.innerHTML = this.currentLang.wheatstoneInfoGifHeading;
        const wheatstoneInfoGifText = document.getElementById("wheatstone-info-gif-text");
        wheatstoneInfoGifText.innerHTML = this.currentLang.wheatstoneInfoGifText;
        const wheatstoneCloseBtn = document.getElementById("wheatstone-info-gif-close-btn");
        wheatstoneCloseBtn.innerHTML = this.currentLang.closeBtn;
    }

    updateSimplifierModal() {
        const InfoGifCloseBtn = document.getElementById("info-gif-close-btn");
        InfoGifCloseBtn.innerHTML = this.currentLang.closeBtn;
        const infoGifHeading = document.getElementById("info-gif-title");
        infoGifHeading.innerHTML = this.currentLang.infoGifHeading;
        const infoGifText = document.getElementById("info-gif-text");
        infoGifText.innerHTML = this.currentLang.infoGifText;
    }

    updateUploadModal() {
        const uploadModalHeading = document.getElementById("upload-modal-title");
        uploadModalHeading.innerHTML = this.currentLang.uploadModalTitle;
        const uploadModalText = document.getElementById("upload-modal-text");
        uploadModalText.innerHTML = this.currentLang.uploadModalText;
        const uploadModalCloseBtn = document.getElementById("upload-modal-close-btn");
        uploadModalCloseBtn.innerHTML = this.currentLang.closeBtn;
    }

    updateLanguageCheatSheetPage() {
        const subHeading = document.getElementById("substitutionTableHeading");
        subHeading.innerHTML = this.currentLang.subTableHeading;
        const series = document.getElementById("seriesHeading");
        series.innerHTML = this.currentLang.subTableSeriesHeading;
        const parallel = document.getElementById("parallelHeading");
        parallel.innerHTML = this.currentLang.subTableParallelHeading;
        const subResCol = document.getElementById("subTableResHeading");
        subResCol.innerHTML = this.currentLang.resistorRowHeading;
        const subCapCol = document.getElementById("subTableCapHeading");
        subCapCol.innerHTML = this.currentLang.capacitorRowHeading;
        const subIndCol = document.getElementById("subTableIndHeading");
        subIndCol.innerHTML = this.currentLang.inductorRowHeading;

        const resReaHeading = document.getElementById("resistanceReactanceTableHeading");
        resReaHeading.innerHTML = this.currentLang.resReaTableHeading;
        const resCol = document.getElementById("resistance");
        resCol.innerHTML = this.currentLang.resistanceColHeading;
        const reaCol = document.getElementById("reactance");
        reaCol.innerHTML = this.currentLang.reactanceColHeading;
        const res = document.getElementById("resistor");
        res.innerHTML = this.currentLang.resistorRowHeading;
        const cap = document.getElementById("capacitor");
        cap.innerHTML = this.currentLang.capacitorRowHeading;
        const ind = document.getElementById("inductor");
        ind.innerHTML = this.currentLang.inductorRowHeading;

        const wheatHeading = document.getElementById("wheatstoneFormulaHeading");
        wheatHeading.innerHTML = this.currentLang.wheatstoneFormulaHeading;
        const wheatFormula = document.getElementById("wheatstoneFormula");
        wheatFormula.innerHTML = `$$${languageManager.currentLang.voltageSymbol}q \\cdot \\left(\\frac{R2}{R1 + R2} - \\frac{R4}{R3 + R4}\\right) = ${languageManager.currentLang.voltageSymbol}m$$`;
    }

    updateLanguageNewsPage() {
        const newsHeading = document.getElementById("news-heading");
        newsHeading.innerHTML = this.currentLang.newsHeading;

        for (let [i, news] of this.currentLang.newsList.entries()) {
            let date = news.date;
            let feature = news.text;

            let tdDate = document.getElementById(`news-date-${i}`);
            let tdFeature = document.getElementById(`news-feature-${i}`);
            tdDate.innerHTML = date;
            tdFeature.innerHTML = feature;
        }
    }

    updateLanguageAboutPage() {
        const aboutText = document.getElementById('about-text');
        aboutText.innerHTML = this.currentLang.aboutText;
    }

    updateLanguageSettingsPage() {
        const resetText = document.getElementById("reset-text");
        if (resetText) resetText.innerHTML = this.currentLang.resetText;
        const resetBtn = document.getElementById("reset-counters-btn");
        if (resetBtn) resetBtn.innerHTML = this.currentLang.resetBtn;
        let speedModeTitle = document.getElementById("speed-mode-settings-title");
        if (speedModeTitle) speedModeTitle.innerHTML = this.currentLang.speedModeSettingsTitle;
        let simplifierBaseTimeLabel = document.getElementById("simplifier-base-label");
        if (simplifierBaseTimeLabel) simplifierBaseTimeLabel.innerHTML = this.currentLang.simplifierBaseTimeLabel + " (" + state.simplifierSolveTimeMs / 1000 + "s)";
        let simplifierAddTimeLabel = document.getElementById("simplifier-add-label");
        if (simplifierAddTimeLabel) simplifierAddTimeLabel.innerHTML = this.currentLang.simplifierAddTimeLabel + " (" + state.simplifierAddTimeMs / 1000 + "s)";
        let kirchhoffBaseTimeLabel = document.getElementById("kirchhoff-base-label");
        if (kirchhoffBaseTimeLabel) kirchhoffBaseTimeLabel.innerHTML = this.currentLang.kirchhoffBaseTimeLabel + " (" + state.kirchhoffSolveTimeMs / 1000 + "s)";
        let kirchhoffAddTimeLabel = document.getElementById("kirchhoff-add-label");
        if (kirchhoffAddTimeLabel) kirchhoffAddTimeLabel.innerHTML = this.currentLang.kirchhoffAddTimeLabel + " (" + state.kirchhoffAddTimeMs / 1000 + "s)";
    }

    updateLanguageUploadPage() {
        this.updateUploadModal();
        const helpBtn = document.getElementById('upload-help-btn');
        if (helpBtn) {
            helpBtn.innerHTML = this.currentLang.uploadHelpBtn;
        }
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.innerHTML = this.currentLang.uploadBtn;
        }

        let usedAccordionHeadings = state.uploadCircuitSets?.map(circuitSet => circuitSet.identifier);
        if (usedAccordionHeadings) {
            // Accordion headings
            for (let i = 0; i < usedAccordionHeadings.length; i++) {
                const accBtn = document.getElementById(`${usedAccordionHeadings[i]}-acc-btn`);
                if (accBtn) {
                    accBtn.innerHTML = this.currentLang.selectorHeadings[usedAccordionHeadings[i]];
                }
            }
            let accordion = document.getElementById("upload-accordion");
            for (let i = 0; i < usedAccordionHeadings.length; i++) {
                let overviewModalBtn = accordion.querySelector(`#${usedAccordionHeadings[i]}-upload-overviewModalBtn`);
                if (overviewModalBtn) {
                    overviewModalBtn.innerHTML = this.currentLang.overviewModalBtn;
                }
            }
        }
    }

    updateLanguageToolPage() {
        this.updateLanguageQRGenerator();
        this.updateLanguageQRScanner();
        this.updateLanguageQRViewer();
        this.updateLanguageLiveDrawing();
        this.updateLanguageSVGGenerator();
        this.updateDescriptions();
    }

    updateDescriptions() {
        const qrGenDesc = document.getElementById("qr-gen-head-id");
        if (qrGenDesc) qrGenDesc.innerHTML = this.currentLang.descrQrGenHead;
        const qrScanDesc = document.getElementById(`qr-scan-head-id`);
        if (qrScanDesc) qrScanDesc.innerHTML = this.currentLang.descrQrScanHead;
        const qrViewerDesc = document.getElementById(`track-view-head-id`);
        if (qrViewerDesc) qrViewerDesc.innerHTML = this.currentLang.descrTrackViewerHead;
        const liveDrawingDesc = document.getElementById(`live-draw-head-id`);
        if (liveDrawingDesc) liveDrawingDesc.innerHTML = this.currentLang.descrLiveDrawHead;

        const qrGenText = document.getElementById(`qr-gen-text-id`);
        if (qrGenText) qrGenText.innerHTML = this.currentLang.descrQrGenText;
        const qrScanText = document.getElementById(`qr-scan-text-id`);
        if (qrScanText) qrScanText.innerHTML = this.currentLang.descrQrScanText;
        const qrViewerText = document.getElementById(`track-view-text-id`);
        if (qrViewerText) qrViewerText.innerHTML = this.currentLang.descrTrackViewerText;
        const liveDrawingText = document.getElementById(`live-draw-text-id`);
        if (liveDrawingText) liveDrawingText.innerHTML = this.currentLang.descrLiveDrawText;
    }

    updateLanguageQRGenerator() {
        let qrAccHeading = document.getElementById('qr-acc-heading');
        qrAccHeading.querySelector("button").innerHTML = this.currentLang.qrAccHeading;
        let helpBtn = document.getElementById('why-qr-code');
        helpBtn.innerHTML = this.currentLang.helpBtn;
        let generateQRCodeBtn = document.getElementById("generate-qr-code-btn");
        generateQRCodeBtn.innerHTML = this.currentLang.generateQrCode;
        let keyInfo = document.getElementById("keyInfo");
        keyInfo.innerHTML = this.currentLang.dontShareKey;
        let simplifierOption = document.getElementById("qr-simplifier-option");
        simplifierOption.innerHTML = this.currentLang.qrSimplifierOption;
        let kirchhoffOption = document.getElementById("qr-kirchhoff-option");
        kirchhoffOption.innerHTML = this.currentLang.qrKirchhoffOption;
    }

    updateLanguageQRScanner() {
        let scanQrCodeHeading = document.getElementById('qr-scan-acc-heading');
        scanQrCodeHeading.querySelector("button").innerHTML = this.currentLang.scanQRCodeHeading;
        let scanQrCodeBtn = document.getElementById('scan-qr-code-btn')?.querySelector("span");
        if (scanQrCodeBtn) {
            scanQrCodeBtn.innerHTML = this.currentLang.scanQrCodeBtn;
        }
        let helpBtn = document.getElementById('help-qr-scan');
        helpBtn.innerHTML = this.currentLang.helpBtn;
    }

    updateLanguageQRViewer() {
        let trackAccHeading = document.getElementById('track-acc-heading');
        trackAccHeading.querySelector("button").innerHTML = this.currentLang.trackAccHeading;
        let helpBtn = document.getElementById('help-track-viewer');
        helpBtn.innerHTML = this.currentLang.helpBtn;
    }

    updateLanguageLiveDrawing() {
        let liveDrawingHeading = document.getElementById('live-drawing-acc-heading');
        liveDrawingHeading.querySelector("button").innerHTML = this.currentLang.liveDrawingHeading;
        let tooltip = document.getElementById('question-tooltip');
        if (tooltip) {
            tooltip.setAttribute("data-bs-original-title", this.currentLang.netlistCommentTooltips);
        }
        let labelExample = document.getElementById("label-load-example");
        labelExample.innerHTML = this.currentLang.netlistExample;
        let labelGeneralize = document.getElementById("label-comments-switch-generalize");
        labelGeneralize.innerHTML = this.currentLang.generalize;
        let labelOptimizeMobile = document.getElementById("label-comments-switch-optimize-mobile");
        labelOptimizeMobile.innerHTML = this.currentLang.optimizeMobile;
        let labelOptimizeDesktop = document.getElementById("label-comments-switch-optimize-desktop");
        labelOptimizeDesktop.innerHTML = this.currentLang.optimizeDesktop;
        let labelShowNodes = document.getElementById("label-comments-switch-shownodes");
        labelShowNodes.innerHTML = this.currentLang.showNodes;
        let drawingFieldDiv = document.getElementById("drawing-field-div");
        if (drawingFieldDiv && state.pyodideReady) {
            drawingFieldDiv.innerHTML = this.currentLang.startTyping;
        }
    }

    updateLanguageSVGGenerator() {
        let svgAccHeading = document.getElementById('svg-gen-acc-heading');
        svgAccHeading.querySelector("button").innerHTML = this.currentLang.svgGeneratorHeading;
        let label = document.getElementById("description-label-svg-generator");
        label.innerHTML = this.currentLang.svgGeneratorText;
        let helpBtn = document.getElementById('svg-gen-help-btn');
        helpBtn.innerHTML = this.currentLang.helpBtn;
    }

    updateDataPrivacyPage() {
        const backBtn = document.getElementById('back-btn-data-privacy');
        backBtn.innerHTML = this.currentLang.dataPrivacyBackBtn;
    }

    updateLegalNoticePage() {
        const backBtn = document.getElementById('back-btn-legal');
        backBtn.innerHTML = this.currentLang.dataPrivacyBackBtn;
        const legalNoticeHeading = document.getElementById('legal-notice-heading');
        legalNoticeHeading.innerHTML = this.currentLang.legalNoticeHeading;
    }

}