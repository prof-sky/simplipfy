class MainWelcome extends Content{
    template = null

    constructor() {
        let idLangMap = new Map([
            ["landing-page-greeting", () => languageManager.currentLang.landingPage.landingPageGreeting]
        ])
        super(idLangMap, "landing-page-welcome-image");
    }

    get html(){
        return `
        <div class="container-fluid bg-warning pb-2 mb-0" id="${this.mainID}">
        <!--img loading="eager" style="height: 300px" class="pt-2" src="src/resources/landingpage/Bild26.png" alt="smartphone-and-tablet-example"-->
        <!-- Welcome page carousel, data-bs-interval is used to set cycle time when images switch-->
        <div id="myCarousel" class="carousel slide pt-2 carousel-fade" data-bs-ride="carousel" data-bs-interval="3000" data-bs-pause="false">
            <div class="carousel-inner" id="landing-page-carousel">
                <div class="carousel-item active">
                    <!-- loading set to eager to have image displayed before carousel is displayed -->
                    
                </div>
            </div>
        </div>
        <div id="trigger"></div>
        <p class="pt-2" id="heading-logo">simpliPFy</p>
        <p id="landing-page-greeting" class="pb-2 px-5">${languageManager.currentLang.landingPage.landingPageGreeting}</p>
    </div>`
    }

    setup() {
        this.template = document.createElement('template');
        this.template.innerHTML = this.html.trim();

        // Left - right animation for feature containers
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    for (let feature of document.querySelectorAll(".feature-container")) {
                        feature.classList.add("visible");
                    }
                }
            });
        }, { threshold: 1});
        const trigger = this.template.content.querySelector("#trigger");
        observer.observe(trigger);

        return this.template.content.firstElementChild;
    }

    async initialize() {
        const img = new Image();
        img.src = "src/resources/landingpage/Bild2.png";
        img.alt = "smartphone with calculations";

        // Wait until the image is fully loaded
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        let content = document.getElementById(this.mainID);
        content.querySelector(".carousel-item.active").appendChild(img);

        this.#addImagesToCarousel();
    }

    async #addImagesToCarousel() {
        // Default "Bild2" already loaded in index.html, this is only additionally
        let carousel = document.getElementById(this.mainID).querySelector("#landing-page-carousel")
        let images = [
            "src/resources/landingpage/Bild3.png",
            "src/resources/landingpage/Bild4.png",
            "src/resources/landingpage/Bild7.png",
            "src/resources/landingpage/Bild8.png",
            "src/resources/landingpage/Bild9.png",
            "src/resources/landingpage/Bild12.png",
            "src/resources/landingpage/Bild14.png",
            "src/resources/landingpage/Bild16.png"
        ]

        for (let imageSrc of images) {
            let img = `<img src="${imageSrc}" alt="Example Image">`;
            let item = document.createElement("div");
            item.classList.add("carousel-item");
            item.innerHTML = img;
            carousel.appendChild(item);
        }
    }
}