class ScannerCarousel extends SkeletonCarousel{
    idx = 0;
    overlayFkt = new OverlayFactory();
    /** @type {QRScanner} */
    scanner;

    /** @type {function} */
    startOrScan = this.scan;

    /** @type {HTMLButtonElement} */
    startBtn;
    /** @type {HTMLButtonElement} */
    stopBtn;

    scanInitialized = false;

    #bootstrapCarousel

    /** @type {HTMLButtonElement} */
    get scannerCloseBtn(){
        let btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("btn-close");
        if (colors.current.bsColorScheme === "dark") btn.classList.add("btn-close-white");
        btn.ariaLabel = "Close";
        btn.style.display = "none";
        btn.style.position = "absolute";
        btn.style.top = "20px";

        return btn;
    }

    init() {
        super.init(() => "");
        this.startBtn.innerHTML = "scan";
        this.startBtn.innerHTML = `<div class="fill-layer"></div>
        <div class="progress-stripes"></div>
        <span class="button-text">${languageManager.currentLang.selector.scannerName}</span>`;

        this.stopBtn = this.scannerCloseBtn;
        this.stopBtn.addEventListener("click", this.stopQrScanner.bind(this));

        this.imgOverlay.appendChild(this.stopBtn);

        this.startBtn.addEventListener("click", (event) => this.startOrScan(event));

        this.carousel.addEventListener("slid.bs.carousel", (event) => {
            this.carouselSlideChanged(event, this.indicatorsDiv, this.identifier);
        })

        this.#bootstrapCarousel = new bootstrap.Carousel(this.carousel);
    }

    initScan(){
        this.scanner?.removeDivFromDom;

        this.scanner = new QRScanner();
        let scannerDiv = this.scanner.setup();
        this.imgOverlay.appendChild(scannerDiv);

        this.scanInitialized = true;
    }

    scan(){
        this.initScan();

        this.scanner.scanHandler(
            this.processQrCode.bind(this),
            () => {}
        )

        this.stopBtn.style.display = "block";
    }

    async stopQrScanner(){
        if (!this.scanner) return;
        await this.scanner.stop();
        this.scanner.removeDivFromDom;
        this.stopBtn.style.display = "none";
        this.startBtn.removeEventListener("click", this.startOrScan);
        this.scanner = null;
    }

    async processQrCode(qrCodeString){
        console.log("Processing QR code...");
        await this.stopQrScanner();
        console.log("QR code string:", qrCodeString);

        const url = new URL(qrCodeString);
        const cleanHash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
        const params = new URLSearchParams(cleanHash);

        const trackingId = params.get("id");
        const identifier = params.get("sel")
        const netlist = NetlistString.uncompress(params.get("net"));

        console.log(`id: ${trackingId}, sel: ${identifier}, net: ${netlist}}`);

        this.idx = this.circuitMaps.length;
        const circuitMap = await new ScannedCircuitMap().initFromScan(
            this.idx,
            trackingId,
            identifier,
            netlist,
            this.circuitMaps
        )
        await storageManager.scannedCircuits.saveCircuit(netlist, trackingId, identifier);

        this.circuitMaps.push(circuitMap);
        await this.insertBeforePlaceholder(circuitMap);
        console.log("finished processing QR code :)");
    }

    carouselSlideChanged(event, indicators) {
        const circuitMapLength = this.circuitMaps.length;
        if (event.to < circuitMapLength){
            super.carouselSlideChanged(event, indicators);
            this.startBtn.innerHTML = "start"
            this.startOrScan = this.startBtnFn;
        }
        else {
            indicators.children[event.from].classList.remove("active");
            indicators.children[event.to].classList.add("active");
            indicators.parentElement.querySelector("h5").textContent = languageManager.currentLang.selector.scannerName;
            this.startBtn.innerHTML = "scan";
            this.startOrScan = this.scan;
        }
    }

    updateOverviewBody() {

    }

    /** @returns {HTMLDivElement} */
    get firstElementInInnerCarousel(){
        return this.innerCarousel.querySelectorAll(".carousel-item")[0]
    }

    /** @returns {HTMLDivElement} */
    get lastElementInInnerCarousel(){
        let items = this.innerCarousel.querySelectorAll(".carousel-item");
        return items[items.length - 1];
    }

    /** this replaces the last element in inner carousel, which should always be the placeholder */
    async replacePlaceholder(circuitMap) {
        let carouselItem = this.carouselItem(this.idx, this.identifier)
        this.idx++;
        const svgData = await circuitMap.readOrGenerateSvgData(conf.pyodide.paths.circuits + `/${Scanner.dirName}`)
        let svg = (new SvgMagician(svgData)).prepareForSelector().element;

        /** @type {HTMLElement} */
        let circuitDiv = carouselItem.querySelector(".svg-selector")
        circuitDiv.appendChild(svg);
        circuitDiv.style.position = "relative";
        circuitDiv.appendChild(this.overlayFkt.overlay(circuitMap));

        // Setup specific circuit in overview modal
        //this.setupOverviewModalCircuit(circuitMap, svg.cloneNode(true));
        this.innerCarousel.replaceChild(carouselItem, this.lastElementInInnerCarousel);
    }

    /** returns the last element of an array, or null if the array is empty */
    lastElementOf(array){
        const len = array.length;
        if (len === 0) return null;
        return array[len - 1];
    }

    /** this replaces the last element in inner carousel, which should always be the placeholder, and then creates a new
     * placeholder
     * @param circuitMap
     * @returns {Promise<void>}
     */
    async insertBeforePlaceholder(circuitMap) {
        await this.replacePlaceholder(circuitMap);
        this.indicatorsDiv.appendChild(this.indicatorBtn(this.idx));
        this.innerCarousel.appendChild(this.templateItem());

        this.innerCarousel.querySelector(".active")?.classList.remove("active");
        this.indicatorsDiv.querySelector(".active")?.classList.remove("active");

        this.lastElementInInnerCarousel.classList.add("active");
        this.lastElementOf(this.indicatorsDiv.childNodes).classList.add("active");

        this.#bootstrapCarousel.to(circuitMap.index);
        this.showImgOverlay();
    }

    showImgOverlay() {
        if (this.scanner?.isScanning) return;
        super.showImgOverlay();
    }

    updateColor() {
        super.updateColor();
        // todo add or remove btn-close-white on btn
    }

    removeCircuit(){

    }
}