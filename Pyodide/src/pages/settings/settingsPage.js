/**
 * Page that shows some settings
 * @extends Page
 */
class SettingsPage extends Page{
    constructor() {
        let content = {
            resetCounters: new ResetCounters(),
            resetTrackingIds: new TrackIdReset(),
            resetScannerCarousel: new ResetScannerCarousel(),
            speedMode: new SpeedMode(),
            setLandingPage: new SetLandingPage(),
        }
        super(content, "settings-page-container", "settings", "nav-settings");
    }

    setup() {
        if (!super.beforeSetup()) return;
        let container = document.getElementById(this.id)
        container.appendChild(this.content.resetCounters.setup());
        container.appendChild(pageManager.getPageDivider("-resetCounter-resetTrackingIds"));
        container.appendChild(this.content.resetTrackingIds.setup());
        container.appendChild(pageManager.getPageDivider("-resetTrackingIds-resetScannerCarousel"));
        container.appendChild(this.content.resetScannerCarousel.setup());
        container.appendChild(pageManager.getPageDivider("-resetScannerCarousel-speedMode"));
        container.appendChild(this.content.speedMode.setup());
        container.appendChild(pageManager.getPageDivider("-speedMode-setLandingPage"));
        container.appendChild(this.content.setLandingPage.setup());

        super.afterSetup();
    }

    initialize() {
        if (!super.beforeInit()) return awaitVal(() => this.isInitialized, () => {}); //this could create an endless wait if a class is not setup and the init is not called again

        /** @type {SetLandingPage} */
        let setLandingPage = this.content.setLandingPage;
        setLandingPage.selectRadioBtn()

        super.afterInit();
    }

    updateColor() {
        super.updateColor();

        let settingsPage = this.pageDiv;
        let paragraphs = settingsPage.getElementsByTagName("p");
        for (const paragraph of paragraphs) {
            paragraph.style.color = colors.current.foreground;
        }

        let dividers = settingsPage.querySelectorAll(".pageDivider");
        for (let divider of dividers) {
            divider.style.color = colors.current.foreground;
        }
    }

    afterPyodideLoaded() {
        this.pageDiv.querySelectorAll("button").forEach((btn) => btn.classList.remove("disabled"));
    }
}