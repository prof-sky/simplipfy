class MagneticNextElements extends ReusableContent {
    constructor() {
        super(undefined, "magnetic-next-elements");
        this.idLangMap = new Map([
            [this.id("next-elements-heading"), () => languageManager.currentLang.simplifier.nextElementsHeading],
            [this.id("translate-btn"), () => languageManager.currentLang.magnetic.translateBtn],
            [this.id("reset-btn"), () => languageManager.currentLang.magnetic.reset]
        ])
        this.onTranslate = null;
        this.onReset = null;

    }

    get html(){
        return `
        <div class="next-elements-container text-center py-1 mb-3" >
            <h3 id="${this.id("next-elements-heading")}" style="color: ${colors.current.svgStrokeColor}">${languageManager.currentLang.simplifier.nextElementsHeading} </h3>
            <ul id="${this.id("next-elements-list")}" class="next-elements-list" style="color: ${colors.current.svgStrokeColor}"></ul>
            <button class="btn btn-warning m-1" id="${this.id("translate-btn")}">${languageManager.currentLang.magnetic.translateBtn}</button>
            <button class="btn btn-secondary m-1 disabled" id="${this.id("reset-btn")}">${languageManager.currentLang.magnetic.reset}</button>
        </div>
        `
    }

    setup() {
        let bodyItem = document.createElement("div");
        bodyItem.id = this.mainID;
        bodyItem.innerHTML = this.html
        this.isSetUp = true;
        return bodyItem;
    }

    changeElementOnList(classname) {
        let list = document.getElementById(this.id("next-elements-list"));
        let existing = list.querySelector(`[data-classname="${classname}"]`);
        if (existing) {
            existing.remove();
            return;
        }
        let item = document.createElement("li");
        item.textContent = classname;
        item.dataset.classname = classname;
        list.appendChild(item);
    }

    clearElementsOnList(){
        let list = document.getElementById(this.id("next-elements-list"));
        list.innerHTML = "";
    }

    addEventListeners() {
        let translateBtn = this.root.getElementById(this.id("translate-btn"));
        let toTranslate =  document.getElementById(this.id("next-elements-list")).innerText;
        translateBtn.addEventListener("click", (e) => {
            this.onTranslate?.(toTranslate);
        });

        let resetBtn = this.root.getElementById(this.id("reset-btn"));
        resetBtn.addEventListener("click", (e) => {
            this.onReset?.();
        });
    }


}