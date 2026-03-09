/**
 * The counter manager manages the counter elements displayed after an accordion heading
 */
class CounterManager {
    /** @type {Map<string, CounterElement>} */
    elems = new Map()
    /** @type {Page} */
    pageToShowAnimationOn = SelectPage;
    hasAllElements = false;

    /**
     * @param selector {Selector}
     * @param pageToShowAnimationOn {typeof Page}
     * @param exclude {Array<window.definitions.selectorIDs>}
     * */
    constructor(selector,pageToShowAnimationOn, exclude= window.definitions.noCounter) {
        this.selector = selector;
        this.exclude = exclude;
        this.pageToShowAnimationOn = pageToShowAnimationOn;
    }

    add(element, identifier){
        if (this.exclude.includes(identifier)) return

        if (identifier === window.definitions.selectorIDs.wheatstone) {
            this.elems.set(identifier, new WheatstoneCounterElement(element, identifier, this.selector, this.pageToShowAnimationOn));
        }
        else {
            this.elems.set(identifier, new CounterElement(element, identifier, this.selector, this.pageToShowAnimationOn));
        }

    }

    remove(identifier){
        this.elems.delete(identifier);
    }

    hide(){
        document.getElementById(this.selector.mainID).querySelectorAll(".counter-element").forEach(element => {
            element.classList.remove("d-inline-flex");
            element.classList.add("d-none");
        })
    }

    show(){
        document.getElementById(this.selector.mainID).querySelectorAll(".counter-element").forEach(element => {
            element.classList.remove("d-none");
            element.classList.add("d-inline-flex");
        })
    }

    get allCircuitsDone(){
        let allDone = true;
        for (let elm of this.elems.values()){
            if (!elm.allCircuitsDone){
                allDone = false;
                break;
            }
        }
        return allDone
    }

    update(identifier = undefined) {
        if (identifier === undefined) {
            identifier = this.elems.keys()
        }
        else {
            identifier = [identifier];
        }

        let knownIdentifiers = Array.from(this.elems.keys())

        for (let _id of identifier) {
            if (!knownIdentifiers.includes(_id)){
                console.warn(`${_id} has no counter element`)
                return;
            }

            this.elems.get(_id).update();
        }

        if (this.hasAllElements && this.allCircuitsDone) {
            awaitVal(
                () => (pageManager.current instanceof this.pageToShowAnimationOn),
                () => (SelectorAnimations.addSmoothStarsOverLogo())
            )
        }
    }
}

/** Object manages the counter displayed after an accordion heading e.g. on the learn page (in code {@link SelectPage})
 * used in the {@link Selector} class.*/
class CounterElement {
    #count = 0;
    #totalCount = 0;
    hash;

    /**
     * @param element {HTMLElement}
     * @param identifier {window.definitions.selectorIDs}
     * @param selector {Selector}
     * @param pageToShowAnimationOn {typeof Page}
     * */
    constructor(element, identifier, selector, pageToShowAnimationOn) {
        this.element = element;
        this.identifier = identifier;
        this.selector = selector;
        this.pageToShowAnimationOn = pageToShowAnimationOn;
        this.circuitFiles = selector.circuitFiles;
        this.hash = selector.circuitFiles.hash;
    }

    get allCircuitsDone() {
        return this.#count >= this.#totalCount;
    }

    /** @param count {Number} */
    set currentCount(count) {
        this.#count = count;
        this.element.children[0].innerHTML = String(count);
    }

    /** @param count {Number} */
    set totalCount(count) {
        this.#totalCount = count;
        this.element.children[2].innerHTML = String(count);
    }

    selectorItem(identifier){
        return this.selector.items.get(identifier);
    }

    selectorCarouselItems(identifier){
        return this.selector.items.get(identifier).querySelector(".carousel-inner").children;
    }

    addDoneToClassList(idx){
        let carouselItem = this.selectorCarouselItems()[idx]
        if (carouselItem.classList.contains('active')) {
            carouselItem.classList.remove('active');
            carouselItem.classList.add("done");
            carouselItem.classList.add('active');
        }
        else {
            carouselItem.classList.add("done");
        }
    }

    checkAllCircuitsDone(){
        let allCircuitsDone = this.allCircuitsDone
        if (allCircuitsDone) {
            let identifier = this.identifier;
            this.element.style.setProperty(
                "color",
                colors.definitions.keyYellow,
                "important"
            );
            let animationShown = storageManager.animationShown.loadValue(this.hash, identifier)
            if (!animationShown) {
                storageManager.animationShown.setValue(this.hash, identifier, true);
                awaitVal(
                    () => (pageManager.current instanceof this.pageToShowAnimationOn),
                    () => (SelectorAnimations.showFinishedSelectorAnimation(identifier)),
                    300);
            }
        }
        else {
            this.element.style.removeProperty("color");
        }
        return allCircuitsDone;
    }

    update(){
        let identifier = this.identifier;
        // set number of done circuits/available circuits
        let circuitMaps = this.circuitFiles.getCircuitSet(identifier).circuitMaps;

        // Search in storage for done circuits
        // Storage will store e.g.: doneCircuits-res = ["00_hetznecker.txt", "01_ohm.txt"]
        let doneCircuits = storageManager.circuitsDone.loadValue(this.hash, identifier);

        // Check names of done circuits with available circuits
        let doneCount = 0;
        for (let i = 0; i < circuitMaps.length; i++) {
            if (doneCircuits.includes(circuitMaps[i].saveName)) {
                doneCount++;
                this.selector.addDoneToClassList(this.identifier, i)
            }
            else {
                this.selector.carousels.get(identifier).indicatorsDiv.children[i].classList.remove('done');
            }
        }

        this.totalCount = circuitMaps.length;
        this.currentCount = doneCount;

        this.checkAllCircuitsDone();
    }
}

/**
 * @param element {HTMLElement}
 * @param identifier {window.definitions.selectorIDs}
 * @param selector {Selector}
 * @param pageToShowAnimationOn {typeof Page}
 * */
class WheatstoneCounterElement extends CounterElement {
    constructor(element, identifier, circuitFiles, pageToShowAnimationOn) {
        super(element, identifier, circuitFiles, pageToShowAnimationOn);
    }
}