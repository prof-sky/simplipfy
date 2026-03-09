/**
 * Manipulates a svg to be displayed on the webpage. E.g. can hide or show elements, change the color of the svg ...
 */
class SvgMagician {
    /** @type {SVGElement} */
    element;
    currentStrokeColor = colors.definitions.keyDark;
    #prepare;
    /**
     * @param svg {string | SVGElement}
     * @param generalPrepare {boolean} execute the generalPrepare function
     */
    constructor(svg, generalPrepare = true) {
        if (typeof svg === "string" || svg instanceof String){
            let elm = document.createElement("template");
            elm.innerHTML = svg;
            elm = elm.content.firstElementChild;
            this.element = elm;
        }
        else if (svg instanceof SVGElement){
            this.element = svg;
        }
        else {
            throw new Error(`Unsupported type ${svg.constructor.name} for svg parameter`);
        }

        this.setColor();
        if (generalPrepare) this.generalPrepare();
    }

    static updateSvgStrokeColor(content){
        let svgs = content.querySelectorAll("svg");
        for (let svg of svgs) {
            svg.innerHTML = svg.innerHTML.replaceAll(colors.last.svgStrokeColor, colors.current.foreground);
        }
    }

    generalPrepare(){
        this.setSvgWidthTo(100);
        this.fillLabels();
        this.updateColor();

        return this;
    }

    onlyElementLabels(){
        this.fillLabels();
        this.hideSvgArrows();
        this.updateColor();

        return this;
    }

    prepareForSelector(){
        this.hideSvgArrows();
        this.hideLabels();

        return this;
    }

    get copy(){
        return this.element.cloneNode(true);
    }

    /** @param width {int} sets the width in % from 0 to 100 */
    setSvgWidthTo(width) {
        this.element.setAttribute("width", "100%"); // replace dd.ddd with width
        return this;
    }

    _setColor(from, to){
        this.element.innerHTML = this.element.innerHTML.replaceAll(from, to);
    }

    setColor(color){
        if (color === this.currentStrokeColor) return;
        this._setColor(this.currentStrokeColor, color)
        this.currentStrokeColor = color
        return this;
    }

    updateColor(){
        if (this.currentStrokeColor === colors.current.svgStrokeColor) return;
        this.setColor(colors.current.svgStrokeColor);
        return this;
    }

    showArrows() {
        // Show arrows and symbol labels
        let arrows = this.element.querySelectorAll(".arrow");
        for (let arrow of arrows) {
            arrow.style.display = "block";
            if (colors.current.foreground === colors.definitions.keyDark) {
                arrow.style.opacity = "1"; // to make them more visible
            }
        }
        return this;
    }

    /**
     *
     * @param fontSize {int}
     */
    setLabelFontSize(fontSize) {
        let _fontSize = String(fontSize) + "px";
        let labels = this.element.querySelectorAll("text.arrow");
        labels.forEach(label => label.style.fontSize = _fontSize);
        return this;
    }

    colorArrows() {
        let labels = this.element.querySelectorAll(".arrow");
        for (let label of labels) {
            if (label.classList.contains("voltage-label")) {
                label.style.color = colors.current.foreground;
                label.style.stroke = colors.current.foreground;
                label.style.fill = colors.current.foreground;
            } else if (label.classList.contains("current-label")) {
                label.style.color = colors.current.foreground;
                label.style.stroke = colors.current.foreground;
                label.style.fill = colors.current.foreground;
            }
        }
        return this;
    }

    colorArrowsColorful() {
        let labels = this.element.querySelectorAll(".arrow");
        for (let label of labels) {
            if (label.classList.contains("voltage-label")) {
                label.style.color = colors.definitions.voltageBlue;
                label.style.stroke = colors.definitions.voltageBlue;
                label.style.fill = colors.definitions.voltageBlue;
                label.style.opacity = "0.8";
            } else if (label.classList.contains("current-label")) {
                label.style.color = colors.definitions.currentRed;
                label.style.stroke = colors.definitions.currentRed;
                label.style.fill = colors.definitions.currentRed;
                label.style.opacity = "0.8";
            }
        }
        return this;
    }

    hideVoltageArrows() {
        let voltageArrows = this.element.querySelectorAll(".arrow.voltage-label");
        for (let arrow of voltageArrows) {
            arrow.style.display = "none";
        }
        return this;
    }

    hideItotArrow() {
        let itotArrow = this.element.querySelectorAll(`.current-label.arrow.I${languageManager.currentLang.simplifier.totalSuffix}`);
        for (let arrow of itotArrow) {
            arrow.style.display = "none";
        }
        return this;
    }

    showVoltageArrows() {
        let voltageArrows = this.element.querySelectorAll(".arrow.voltage-label");
        for (let arrow of voltageArrows) {
            arrow.style.display = "block";
        }
        return this;
    }

    hideCurrentArrows() {
        let currentArrows = this.element.querySelectorAll(".arrow.current-label");
        for (let arrow of currentArrows) {
            arrow.style.display = "none";
        }
        return this;
    }

    showCurrentArrows() {
        let currentArrows = this.element.querySelectorAll(".arrow.current-label");
        for (let arrow of currentArrows) {
            arrow.style.display = "block";
        }
        return this;
    }

    hideSpecificLabels(toHide) {
        for (let label of toHide){
            let sourceLabel = this.element.querySelector(`.element-label.${label}`);
            if (sourceLabel !== null) {
                sourceLabel.style.display = "none";
            }
        }
        return this;
    }

    lightHighlightElement(selector){
        if (selector === "volt") {
            this.hideCurrentArrows();
            for (let element of state.doneVoltages) {
                lightHighlightElement(this.element, element, selector);
            }
        } else if (selector === "curr") {
            this.hideVoltageArrows();
            this.hideItotArrow();
            for (let element of state.doneCurrents) {
                lightHighlightElement(this.element, element, selector);
            }
        }
        return this;
    }

    hideElementLabels() {
        let labels = this.element.querySelectorAll(".element-label");
        labels.forEach(label => label.style.display = "none");
        return this;
    }

    hideLabels() {
        let labels = this.element.querySelectorAll(".element-label");
        labels.forEach(label => label.style.display = "none");
        return this;
    }

    hideSvgArrows() {
        let arrows = this.element.getElementsByClassName("arrow");
        for (let arrow of arrows) arrow.style.display = "none";
        return this;
    }

    fillLabels(){
        fillLabels(this.element);
        return this;
    }
}