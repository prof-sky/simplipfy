/**
 * On this Page an accordion with tasks is shown. The user selects one and after that a {@link SimplifierPage} is shown.
 * On the SimplifierPage the actual task can be solved.
 * @extends Page
 */
class SelectPage extends Page {

    constructor() {
        let content = {
            tutorial: new TutorialSelector(serverFiles),
            accordion: new TaskAccordeon(),
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "select-page-container", "Selector");
    }

    async show(){
        await super.show();
        this.content.accordion.selector.counters.update();
    }

    setup() {
        if (!super.beforeSetup()) return;

        this.pageDiv.appendChild(this.content.tutorial.setup());
        this.pageDiv.appendChild(this.content.accordion.setup());

        console.log("Selected page setup finished");

        super.afterSetup();
    }

    initialize() {
        if(!super.beforeInit()) return;
        this.content.tutorial.init();
        this.content.accordion.selector.init()
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

}