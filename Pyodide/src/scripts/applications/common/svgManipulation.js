function showArrows(svgDiv) {
    // Show arrows and symbol labels
    let arrows = svgDiv.querySelectorAll(".arrow");
    for (let arrow of arrows) {
        arrow.style.display = "block";
        if (colors.current.foreground === colors.definitions.keyDark) {
            arrow.style.opacity = "1"; // to make them more visible
        }
    }
}

class SimplifierPageSVG {
    /** @type {HTMLDivElement} */
    div
    /** @type {SvgMagician} */
    svg

    /** @param svg {string} the svg as a string
     * @param id {string} may be empty, id is build like this: svgDiv${idIdentifier}${state.pictureCounter}
     */
    constructor(svg, id) {
        this.svg = new SvgMagician(svg);

        /** @type {HTMLDivElement} */
        this.div = document.createElement('div');

        this.div.id = id;

        this.div.classList.add("svg-container", "p-2", "user-select-none");
        this.div.style.border = `1px solid ${colors.current.foreground}`;
        this.div.style.borderRadius = "6px";
        this.div.style.width = "350px";
        this.div.style.maxWidth = "350px;";
        this.div.style.position = "relative";

        this.div.appendChild(this.svg.element);
    }

    /**
     * element has to be rendered in the dom for this to work
     * @param {Array<string>} elementIds */
    highlightElements(elementIds){
        this.svg.highlightElements(elementIds);
    }
}

class KirchhoffPageSvgDiv extends SimplifierPageSVG{
    fontSize = 20;

    constructor(svg, selector, id) {
        super(svg, id);
        this.prepareSvg(selector);
    }

    prepareSvg(selector){
        this.svg.setLabelFontSize(this.fontSize);
        this.svg.hideElementLabels();
        this.svg.setColor("gray")
        this.svg.colorArrows();
        this.svg.lightHighlightElement(selector);
    }
}

class WheatstonePageSvgDiv extends SimplifierPageSVG {

    constructor(svg) {
        super(svg, `svgDiv${state.pictureCounter}`);
        this.svg.setLabelFontSize(this.fontSize);
        this.prepareSvg();
    }

    prepareSvg(){
        this.svg.hideVoltageArrows();
        this.svg.hideCurrentArrows();

        adaptVoltmeter(this.svg.element);
        adaptV1Label(this.svg.element);

        // Add value over element labels
        addValueLabels(this.svg.element);
        updateValueLabels(this.svg.element);

        // SVG Data written, now add eventListeners, only afterward because they would be removed on rewrite of svgData
        //addWheatstoneCircuitNavigator(this.div);
        addWheatstoneInfoHelpButton(this.div);
    }
}

class StepwisePageSvgDiv extends SimplifierPageSVG {
    elementsContainer

    constructor(svg) {
        super(svg, `svgDiv${state.pictureCounter}`);
        this.prepareSvg();
        this.elementsContainer = document.getElementById("next-elements-list");
    }

    prepareSvg(){
        let sourceNames = [];
        for (let source of state.step0Data.sources){
            sourceNames.push(source.Z.name);
        }
        this.svg.hideSpecificLabels(sourceNames);

        this.svg.hideCurrentArrows();
        this.svg.hideVoltageArrows();
        this.svg.hideItotArrow();

        this.svg.colorArrowsColorful();
        return this

    }

    makeElementsClickable(){
        if (!this.elementsContainer) this.elementsContainer = document.getElementById("next-elements-list");
        let elems = getElementsFromSvgContainer(this.div);
        elems = removeSourceFromElements(elems);
        elems.forEach(elem => {
            elem.addEventListener("click", () => chooseElement(elem, this.elementsContainer));
            elem.style.cursor = "pointer";
        })
    }
}
