/**
 * Page that shows some handy tools
 * @extends Page
 */
class ToolsPage extends Page {
    constructor(props) {
        let content = {
            "qrCodeGenerator": new QrCodeGenerator(),
            "qrScanner": new QrScanner(),
            "liveTracker": new LiveTracker(),
            "liveDrawing": new LiveDrawing(),
            "svgGenerator": new SvgGenerator(),
            "customCircuits": new CustomCircuits(),
            "descriptions": new Descriptions(),
            }

        super(content, "tool-page-container", "ToolsPage");
    }

    updateLang() {
        super.updateLang();
    }

    updateColor() {
        //each element that uses colors.current.foreground needs to be manually updated after dark-/ lightmode change
        this.#updateToolPageColors();
        super.updateColor();
    }

    async show(){
        await super.show();
        /** @type {Selector} */
        let selector = this.content.customCircuits.selector
        if (selector){
            selector.counters.update();
        }
    }

    setup() {
        if (this.isSetUp === true) return;
        this.hide();
        // Create accordion for tools

        let toolAccordion = this.#createToolAccordion();

        toolAccordion.appendChild(this.content.qrCodeGenerator.setup());
        toolAccordion.appendChild(this.content.qrScanner.setup());
        toolAccordion.appendChild(this.content.liveTracker.setup());
        toolAccordion.appendChild(this.content.liveDrawing.setup());
        toolAccordion.appendChild(this.content.svgGenerator.setup());
        toolAccordion.appendChild(this.content.customCircuits.setup());
        this.pageDiv.appendChild(toolAccordion);

        this.pageDiv.appendChild(this.content.descriptions.setup());
        super.setup();
    }

    afterPyodideLoaded() {
        this.content.liveDrawing.afterPyodideLoaded();
    }

    #createToolAccordion() {
        let toolAccordion = document.createElement("div");
        toolAccordion.classList.add("accordion", "accordion-flush", "m-5", "mx-auto");
        toolAccordion.id = "tool-accordion";
        toolAccordion.setAttribute("role", "tablist");
        toolAccordion.setAttribute("aria-multiselectable", "true");
        toolAccordion.setAttribute("aria-label", "Tools");
        toolAccordion.style.width = "100%";
        toolAccordion.style.maxWidth = "600px";
        toolAccordion.style.color = colors.current.foreground;
        toolAccordion.style.backgroundColor = colors.current.bsBackground;
        return toolAccordion;
    }

    #updateToolPageColors() {
        let accordion = document.getElementById("tool-accordion");
        let accordionButtons = accordion?.getElementsByClassName("accordion-button");
        if (accordionButtons !== null && accordionButtons !== undefined) {
            for (const accordionButton of accordionButtons) {
                accordionButton.style.color = colors.current.headingForeground;
                accordionButton.style.backgroundColor = colors.current.bsBackground;
            }
        }
        let accordionBodys = accordion?.getElementsByClassName("accordion-body");
        if (accordionBodys !== null && accordionBodys !== undefined) {
            for (const accordionBody of accordionBodys) {
                accordionBody.style.color = colors.current.foreground;
                accordionBody.style.backgroundColor = colors.current.bsBackground;
            }
        }
    }
}