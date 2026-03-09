/** Builds a carousel like {@link SelectorCarousel} but does not wait for the circuits to load, sets up a placeholders
 * and inserts data when loaded, used for the Tutorial on the learn page (in code {@link SelectPage}) in the {@link TutorialSelector} */
class SkeletonCarousel extends SelectorCarousel {
    isInitialized = false;
    initializationStarted = false;

    constructor(parent, circuitFiles, identifier, parentSelector) {
        super(parent, new CircuitSet(window.definitions.selectorIDs.quickstart, []), parentSelector);
        this.circuitFiles = circuitFiles;
        this.circuitSet.identifier = identifier;
    }

    init(){
        if (this.initializationStarted) return;
        this.initializationStarted = true;

        this.overviewBtnDiv = this.overviewBtnElement;

        this.indicatorsDiv = this.indicatorContainerElement;
        this.parentDiv.appendChild(this.indicatorsDiv);

        this.carousel = this.createCarousel();
        this.parentDiv.appendChild(this.carousel);

        this.imgOverlay = this.carousel.querySelector(".img-overlay")
        this.imgOverlay.addEventListener("click", (event) => {
            this.toggleImgOverlay()
        })
        this.carousel.appendChild(this.imgOverlay);

        this.innerCarousel = this.carousel.querySelector(".carousel-inner")

        let carouselItem = this.templateItem();
        carouselItem.querySelector("svg").innerHTML = this.templateItemInnerHtml()
        this.innerCarousel.appendChild(carouselItem);

        // Setup specific circuit in overview modal
        this.indicatorsDiv.appendChild(this.indicatorBtn(-1));

        this.nextBtn = this.carousel.querySelector(".carousel-control-next");
        this.prevBtn = this.carousel.querySelector(".carousel-control-prev");

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

        this.startBtn = this.carousel.querySelector(".circuitStartBtn");
        let startBtn = this.startBtn
        startBtn.onclick = (event) => this.startBtnFn(event);
        startBtn.classList.remove("disabled");
        startBtn.querySelector(".progress-stripes").remove();
        startBtn.querySelector(".fill-layer").remove();
        startBtn.style.backgroundColor = colors.definitions.keyYellow

        this.circuitNameContainer = this.circuitNameContainerElement(this.identifier);
        this.circuitNameContainer.style.display = "none";

        this.parentDiv.appendChild(this.circuitNameContainer);
        this.selectCircuitInCarousel();
    }
}