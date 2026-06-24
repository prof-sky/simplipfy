/** Builds a carousel like {@link SelectorCarousel} but does not wait for the circuits to load, sets up a placeholders
 * and inserts data when loaded, used for the Tutorial on the learn page (in code {@link SelectPage}) in the {@link TutorialSelector} */
class SkeletonCarousel extends SelectorCarousel {
    isInitialized = false;
    initializationStarted = false;

    constructor(parent, circuitFiles, identifier, parentSelector) {
        super(parent, new CircuitSet(identifier, []), parentSelector);
        this.circuitFiles = circuitFiles;
        this.circuitSet.identifier = identifier;
    }

    /**
     * Initializes the carousel with placeholders, does not wait for the circuits to load, sets up a placeholder
     * @param svgFn {function} a function that returns the innerHTML of the svg element of the carousel item, used to display a placeholder svg until the actual circuit data is loaded
     */
    init(svgFn){
        if (this.initializationStarted) return;
        this.initializationStarted = true;

        this.overviewBtnDiv = this.overviewBtnElement;

        this.indicatorsDiv = this.indicatorContainerElement;
        this.parentDiv.appendChild(this.indicatorsDiv);

        this.carousel = this.createCarousel();
        this.bootstrapCarousel = new bootstrap.Carousel(this.carousel);
        this.parentDiv.appendChild(this.carousel);

        this.imgOverlay = this.carousel.querySelector(".img-overlay")
        this.imgOverlay.addEventListener("click", (event) => {
            this.toggleImgOverlay()
        })
        this.carousel.appendChild(this.imgOverlay);

        this.innerCarousel = this.carousel.querySelector(".carousel-inner");

        let carouselItem = this.templateItem();
        carouselItem.querySelector("svg").innerHTML = svgFn();
        this.innerCarousel.appendChild(carouselItem);

        // Setup specific circuit in overview modal
        this.indicatorsDiv.appendChild(this.indicatorBtn(0));

        this.nextBtn = this.carousel.querySelector(".carousel-control-next");
        this.prevBtn = this.carousel.querySelector(".carousel-control-prev");
        this.startBtn = this.carousel.querySelector(".circuitStartBtn");

        this.circuitNameContainer = this.circuitNameContainerElement("");
        this.parentDiv.appendChild(this.circuitNameContainer);

        this.isInitialized = true;
    }

    appendChildren(newParent, oldParent){
        let len = oldParent.children.length;
        for (let i = 0; i < len; i++) {
            newParent.appendChild(oldParent.firstElementChild);
        }
    }

    async afterCircuitsLoaded(){
        this.circuitSet = this.circuitFiles.getCircuitSet(this.identifier);
        let tmpParent = document.createElement("div");
        tmpParent.id = this.parentDiv.id;
        let final = new SelectorCarousel(tmpParent, this.circuitSet);
        await final.init();

        this.appendChildren(this.indicatorsDiv, final.indicatorsDiv);
        this.indicatorsDiv.firstElementChild.remove();

        this.appendChildren(this.innerCarousel, final.innerCarousel);
        this.innerCarousel.firstElementChild.remove();

        this.carousel.addEventListener("slid.bs.carousel", (event) => {
            this.carouselSlideChanged(event, this.indicatorsDiv, this.identifier);
        })

        let startBtn = this.startBtn
        startBtn.onclick = (event) => this.startBtnFn(event);
        startBtn.classList.remove("disabled");
        startBtn.querySelector(".progress-stripes")?.remove();
        startBtn.querySelector(".fill-layer")?.remove();
        startBtn.style.backgroundColor = colors.definitions.keyYellow

        this.selectCircuitInCarousel();
    }
}