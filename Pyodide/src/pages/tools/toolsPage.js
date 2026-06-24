/**
 * Page that shows some handy tools
 * @extends Page
 */
class ToolsPage extends Page {

    constructor(props) {
        let content = {
            "qrCodeGenerator": new QrCodeGeneratorTools(),
            "liveTracker": new LiveTracker(),
            "liveDrawing": new LiveDrawing(),
            "customCircuits": new CustomCircuits(),
            "descriptions": new Descriptions(),
            }

        super(content, "tool-page-container", "tools", "nav-tools");
    }

    updateLang() {
        let accBtns = document.getElementsByClassName("accordion-button-tool");
        for (let btn of accBtns) {
            let textIdentifier = `${btn.id.split("-")[0]}Heading`;
            btn.textContent = languageManager.currentLang.toolsPage[textIdentifier];
        }

        super.updateLang();
    }

    hide() {
        super.hide();
        /** @type {LiveTracker} */
        const tracker = this.content.liveTracker
        tracker.stopUpdatingTables;
    }

    updateColor() {
        //each element that uses colors.current.foreground needs to be manually updated after dark-/ lightmode change
        this.#updateToolPageColors();
        super.updateColor();
    }

    show(animate=false){
        super.show(animate);

        /** @type {Selector} */
        let selector = this.content.customCircuits.selector
        if (selector){
            selector.counters.update();
        }

        /** @type {LiveTracker} */
        const tracker = this.content.liveTracker
        tracker.startUpdatingTables;

        return true;
    }

    setup() {
        if (this.isSetUp === true) return;
        this.hide();
        // Create accordion for tools

        let toolAccordion = this.#createToolAccordion();

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

        for (const [name, tool] of Object.entries(/** @type {Map<string, AccordionContent | Content>} */ this.content)) {
            if (name === "descriptions") continue;

            let accordionHeader = document.createElement("h2");
            accordionHeader.classList.add("accordion-header");
            accordionHeader.id = `${name}-accordion-heading`;

            let accordionBtn = document.createElement("button");
            accordionBtn.classList.add("accordion-button", "accordion-button-tool", "collapsed");
            accordionBtn.id = `${name}-accordion-button`;
            accordionBtn.setAttribute("data-bs-toggle", "collapse");
            accordionBtn.setAttribute("data-bs-target", `#${name}-accordion-collapse`);
            accordionBtn.setAttribute("aria-expanded", "false");
            accordionBtn.setAttribute("aria-controls", `${name}-accordion-collapse`);
            accordionBtn.textContent = tool.heading;

            accordionHeader.appendChild(accordionBtn);

            let accordionCollapse = document.createElement("div");
            accordionCollapse.classList.add("accordion-collapse", "collapse");
            accordionCollapse.id = `${name}-accordion-collapse`;
            accordionCollapse.setAttribute("aria-labelledby", `${name}-accordion-heading`);
            accordionCollapse.setAttribute("data-bs-parent",  "#tool-accordion");

            let accordionBody = document.createElement("div");
            accordionBody.classList.add("accordion-body");
            accordionBody.id = `${name}-accordion-body`;
            accordionBody.appendChild(tool.setup());

            accordionCollapse.appendChild(accordionBody);

            const accordionItem = document.createElement("div");
            accordionItem.classList.add("accordion-item");

            accordionItem.appendChild(accordionHeader);
            accordionItem.appendChild(accordionCollapse);

            toolAccordion.appendChild(accordionItem);
        }

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