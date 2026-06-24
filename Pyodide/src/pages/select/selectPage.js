/**
 * On this Page an accordion with tasks is shown. The user selects one and after that a {@link SimplifierPage} is shown.
 * On the SimplifierPage the actual task can be solved.
 * @extends Page
 */
class SelectPage extends Page {

    constructor() {
        let content = {
            tutorial: new TutorialSelector(),
            accordion: new TaskAccordeon(),
            scanner: new Scanner(),
        }
        // select-page-container (id of div on index.htlm)
        super(content, "select-page-container", "simplifier", "nav-select");
    }

    show(animate=false){
        super.show(animate);
        this.content.accordion.selector.counters.update();
        return true;
    }

    hide() {
        super.hide();
        this.content.scanner.carousel?.stopQrScanner();
    }

    setup() {
        if (!super.beforeSetup()) return;

        this.pageDiv.appendChild(this.content.tutorial.setup());
        this.pageDiv.appendChild(this.content.accordion.setup());
        this.pageDiv.appendChild(this.content.scanner.setup());

        console.log("Selected page setup finished");

        super.afterSetup();
    }

    async initialize() {
        if(!super.beforeInit()) return;
        await this.content.tutorial.init();
        await this.content.accordion.init()
        await this.content.scanner.init();
        super.afterInit();
    }

    updateColor(bgClassName = "bg") {
        super.updateColor(bgClassName);
        SvgMagician.updateSvgStrokeColor(document.getElementById(this.id));
    }

    setupEasterEggs() {
        let touchScreen = false;
        this.content.accordion.setupEasterEggs(touchScreen)
    }

    async reloadScanner() {
        document.getElementById(this.content.scanner.mainID).remove();

        scannerFiles = new ScannerFiles();
        await scannerFiles.init();

        this.content.scanner = new Scanner();

        this.pageDiv.appendChild(this.content.scanner.setup());

        /** @type {Scanner} */
        let scanner= this.content.scanner
        await scanner.init();
        scanner.carousel.startBtn.classList.remove("disabled");
        scanner.carousel.startBtn.style.backgroundColor = colors.definitions.keyYellow;

    }
}