class MagneticCircuitContainer extends ReusableContent {
    constructor() {
        let idLangMap = new Map([])
        super(idLangMap, "magnetic-CircuitContainer");
        this.changeElement = null;
    }

    get html(){
        return `
        <div class="circuit-container row justify-content-center my-2" >
            <div id="${this.id("svgDiv")}" class="svg-container p-2 user-select-none" style="border: 1px solid ${colors.current.svgStrokeColor}; border-radius: 6px; width: 350px; position: relative;">
            
            </div>
        </div>
        `
    }

    setup() {
        let bodyItem = document.createElement("div");
        bodyItem.id = this.mainID;

        // let svg = await state.solvers.magnetic.firstStep()
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" xml:lang="en" viewBox="-88.58800000000001 -29.48 307.38800000000003 140.28" preserveAspectRatio="xMidYMid meet">
            <circle cx="-37.80000000000002" cy="53.99999999999999" r="14.4"
                    style="stroke:black;fill:none;stroke-width:2.0;" id="V1_Circle" class="V1"/>
            <circle cx="19.799999999999994" cy="34.80000000000001" r="4.8"
                    style="stroke:black;fill:none;stroke-width:2.0;" id="V1_arc-r1" class="V1"/>
            <circle cx="19.799999999999994" cy="54.0" r="4.8" style="stroke:black;fill:none;stroke-width:2.0;"
                    id="V1_arc-r2" class="V1"/>
            <circle cx="19.79999999999999" cy="73.20000000000002" r="4.8"
                    style="stroke:black;fill:none;stroke-width:2.0;" id="V1_arc-r3" class="V1"/>
            <circle cx="-9.000000000000007" cy="44.400000000000006" r="4.8"
                    style="stroke:black;fill:none;stroke-width:2.0;" id="V1_arc-l1" class="V1"/>
            <circle cx="-9.000000000000012" cy="63.599999999999994" r="4.8"
                    style="stroke:black;fill:none;stroke-width:2.0;" id="V1_arc-l2" class="V1"/>
            <path d="M -37.80000000000002,64.8 L -37.80000000000002,52.199999999999996" id="V1_Arrow" class="V1"
                  style="stroke:black;fill:none;stroke-width:2.0;stroke-linecap:round;stroke-linejoin:round;"/>
            <path
                d="M -37.80000000000002 45.199999999999996 L -35.10000000000002 52.199999999999996 L -40.50000000000002 52.199999999999996 Z"
                style="stroke:black;fill:black;stroke-linecap:butt;stroke-linejoin:miter;" class="V1"/>
            <path d="M 5.3999999999999995,5.400000000000002 L 5.399999999999982,102.60000000000001" id="V1_Core"
                  class="V1"
                  style="stroke:gray;fill:none;stroke-width:28.8;stroke-linecap:square;stroke-linejoin:round;"/>
            <path
                d="M -37.80000000000002,39.599999999999994 L -37.80000000000002,29.999999999999993 L 19.799999999999997,30.000000000000007 M -9.00000000000001,49.2 L 19.799999999999994,49.2 M -9.000000000000012,68.39999999999999 L 19.79999999999999,68.39999999999999 M -9.000000000000014,78.0 L -37.800000000000026,78.0 L -37.800000000000026,68.39999999999999"
                id="V1_wires" class="V1"
                style="stroke:black;fill:none;stroke-width:2.0;stroke-linecap:butt;stroke-linejoin:round;"/>
            <path d="M 3.599999999999999,3.599999999999999 L 104.39999999999999,3.599999999999999" id="C1"
                  class="C1"
                  style="stroke:grey;fill:none;stroke-width:25.2;stroke-linecap:square;stroke-linejoin:round;"/>
            <path d="M 111.60000000000001,3.599999999999999 L 212.4,3.599999999999999" id="C2" class="C2"
                  style="stroke:grey;fill:none;stroke-width:25.2;stroke-linecap:square;stroke-linejoin:round;"/>
            <path d="M 104.39999999999999,3.5999999999999988 L 104.39999999999998,104.39999999999999" id="C3"
                  class="C3"
                  style="stroke:grey;fill:none;stroke-width:25.2;stroke-linecap:square;stroke-linejoin:round;"/>
            <path d="M 212.4,3.5999999999999988 L 212.39999999999998,104.39999999999999" id="C4" class="C4"
                  style="stroke:grey;fill:none;stroke-width:25.2;stroke-linecap:square;stroke-linejoin:round;"/>
            <path
                d="M 214.20000000000002,106.2 L 180.0,106.19999999999999 M 144.0,106.19999999999999 L 109.80000000000001,106.19999999999999"
                id="G1" class="G1"
                style="stroke:gray;fill:none;stroke-width:21.599999999999998;stroke-linecap:square;stroke-linejoin:round;"/>
            <path
                d="M 106.2,106.2 L 72.0,106.19999999999999 M 36.0,106.19999999999999 L 1.8000000000000096,106.19999999999999"
                id="G2" class="G2"
                style="stroke:gray;fill:none;stroke-width:21.599999999999998;stroke-linecap:square;stroke-linejoin:round;"/>
            <text x="-66.60000000000001" y="43.79199999999998" fill="black" font-size="14.0" font-family="sans"
                  text-anchor="end" class="element-label V1">
                <tspan x="-66.60000000000001" dy="14.0">V1</tspan>
            </text>
            <text x="54.0" y="-24.880000000000003" fill="black" font-size="14.0" font-family="sans" text-anchor="middle"
                  class="element-label C1">
                <tspan x="54.0" dy="14.0">C1</tspan>
            </text>
            <text x="162.0" y="-24.880000000000003" fill="black" font-size="14.0" font-family="sans"
                  text-anchor="middle" class="element-label C2">
                <tspan x="162.0" dy="14.0">C2</tspan>
            </text>
            <text x="90.0" y="43.791999999999994" fill="black" font-size="14.0" font-family="sans" text-anchor="end"
                  class="element-label C3">
                <tspan x="90.0" dy="14.0">C3</tspan>
            </text>
            <text x="198.0" y="43.791999999999994" fill="black" font-size="14.0" font-family="sans" text-anchor="end"
                  class="element-label C4">
                <tspan x="198.0" dy="14.0">C4</tspan>
            </text>
            <text x="162.0" y="77.71999999999998" fill="black" font-size="14.0" font-family="sans" text-anchor="middle"
                  class="element-label G1">
                <tspan x="162.0" dy="14.0">G1</tspan>
            </text>
            <text x="54.00000000000001" y="77.71999999999998" fill="black" font-size="14.0" font-family="sans"
                  text-anchor="middle" class="element-label G2">
                <tspan x="54.00000000000001" dy="14.0">G2</tspan>
            </text>
        </svg>`;
        let preparedSvg = new SvgMagician(svg);

        bodyItem.innerHTML = this.html;
        let svgDiv = bodyItem.querySelector(`#${this.id("svgDiv")}`);
        svgDiv.appendChild(preparedSvg.element);
        this.isSetUp = true;
        this.root = bodyItem;
        this.addEventListeners();
        return bodyItem;
    }

    addEventListeners() {
        let svgDiv = this.root.querySelector(`#${this.id("svgDiv")}`);
        let svgElement = svgDiv.querySelector("svg");

        const knownPrefixes = ["V", "C", "G"];
        const componentClasses = new Set();


        svgElement.querySelectorAll("[class]").forEach(el => {
            el.classList.forEach(cls => {
                if (knownPrefixes.some(prefix => cls.startsWith(prefix))) {
                    componentClasses.add(cls);
                }
            });
        });

        const selector = [...componentClasses]
            .map(c => `[class~="${c}"]`).join(", ");

        svgElement.addEventListener("click", (e) => {
            const target = e.target;
            if (!(target instanceof SVGElement)) return;

            const component = target.closest(selector);
            if (!component) return;

            const matchedClass = [...componentClasses].find(c =>
                component.classList.contains(c)
            );
            if (!matchedClass) return;

            let allParts = this.root.querySelectorAll(`.${matchedClass}`);
            const isSelected = svgElement.querySelector(`.${matchedClass}.selected`) !== null;
            if (!isSelected) {
                state.selectedElements.push(matchedClass);
                allParts.forEach(part => {
                    part.classList.add("selected");

                });
            }
            else {
                let id = state.selectedElements.indexOf(matchedClass);
                state.selectedElements.splice(id, 1);
                allParts.forEach(part => {
                    part.classList.remove("selected")
                });
            }

            const prefix = knownPrefixes.find(p => matchedClass.startsWith(p));
            if (prefix === "V") this.changeSelectSource(matchedClass, isSelected);
            if (prefix === "C" || prefix === "G") this.changeSelectCore(matchedClass, isSelected);
        });
    }

    /**
     * @param classname {string}
     * @param isSelected {boolean}
     * **/
    changeSelectSource(classname, isSelected) {
        let svgElement = this.root.querySelector(`#${this.id("svgDiv")} svg`);
        let allParts = svgElement.getElementsByClassName(classname);
        let core = svgElement.querySelector(`#${classname}_Core`);
        let text = svgElement.querySelector(`.element-label.${classname}`);

        if (isSelected) {
            for (let e of allParts) {
                e.style.fill = "none";
                e.style.stroke = colors.current.svgStrokeColor;
            }
            core.style.stroke = "gray";
            text.style.stroke = "none";
            text.style.fill = colors.current.svgStrokeColor;
            state.selectedElements = state.selectedElements.filter(otherClass => otherClass !== classname)

        } else {
            for (let e of allParts) {
                e.style.fill = "none";
                e.style.stroke = window.definitions.colors.keyYellow;
            }
            core.style.stroke = window.definitions.colors.keyYellowLightened;
            text.style.stroke = "none";
            text.style.fill = window.definitions.colors.keyYellow;
            if(!state.selectedElements.includes(classname)) {
                state.selectedElements.push(classname);
            }
        }
        this.changeElement?.(classname);
    }
    
    changeSelectCore(classname, isSelected) {
        let svgElement = this.root.querySelector(`#${this.id("svgDiv")} svg`);
        let core = svgElement.querySelector(`#${classname}`);
        let text = svgElement.querySelector(`.element-label.${classname}`);

        if (isSelected) {
            core.style.stroke = "gray";
            text.style.fill = colors.current.svgStrokeColor;
            state.selectedElements = state.selectedElements.filter(otherClass => otherClass !== classname);
        } else {
            core.style.stroke = window.definitions.colors.keyYellowLightened;
            text.style.fill = window.definitions.colors.keyYellow;
            if(!state.selectedElements.includes(classname)) {
                state.selectedElements.push(classname);
            }
        }
        this.changeElement?.(classname);
    }


    disable(){

    }
}