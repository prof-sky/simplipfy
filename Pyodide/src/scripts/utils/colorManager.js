/** Colors used if the webpage is in dark mode */
class DarkMode extends ColorScheme {
    constructor() {
        let c = window.definitions.colors
        super(c.keyLight, c.keyYellow, c.keyDark, c.bootstrapDark,
            "dark", c.keyLight, c.languagesDarkBg, c.keyYellow);
    }
}

/** Colors used if the page is in light mode */
class LightMode extends ColorScheme {
    constructor() {
        let c = window.definitions.colors
        super(c.keyDark, c.keyDark, c.keyLight, c.bootstrapWhite,
            "light", c.keyDark, c.languagesLightBg, c.keyYellow);
    }
}

/** Manages the change between {@link ColorScheme} Objects */
class ColorManager{
    static lightMode = new LightMode();
    static darkMode = new DarkMode();

    /** @type {ColorScheme} */
    current;
    /** @type {ColorScheme} */
    last;

    /** @type {Colors} */
    definitions = window.definitions.colors;

    svgGenerationStrokeColor =this.definitions.keyDark;

    constructor(colorTheme = ColorManager.darkMode) {
        this.current = colorTheme;
        this.last = this.current;
    }

    /**
     * Pass in functions that need conditional execution based on the current color scheme.
     * The current color scheme is saved in {@link ColorManager.current}. This color scheme is used as reference.
     * If {@link ColorScheme.bsColorScheme} is "dark" darkModeFn is executed, else lightModeFn.
     * @param darkModeFn {function} function to call when {@link ColorScheme.bsColorScheme} is "dark"
     * @param lightModeFn {function} function to call when {@link ColorScheme.bsColorScheme} is not "dark"
     */
    setMode(darkModeFn, lightModeFn){
        if (this.current.bsColorScheme === "dark") darkModeFn();
        else lightModeFn()

        return this.current.bsColorScheme;
    }

    /** @param {ColorScheme} colorScheme */
    set(colorScheme){
        this.last = this.current;
        this.current = colorScheme;
        updateBsClassesTo(this.current.bsColorScheme, "bg", document.getElementById("bootstrap-overrides"))
    }

    setDarkModeColors() {
        this.set(ColorManager.darkMode);
    }

    setLightModeColors() {
        this.set(ColorManager.lightMode);
    }

    /**
     * updates the bootstrap color scheme class attribute in an element
     * @param element {HTMLElement}
     * @param field {"bg" | "table" | "navbar"} bootstrap class that can take a color scheme as class attribute
     * */
    updateBsClass(element, field="bg"){
        element.classList.remove(`${field}-${this.last.bsColorScheme}`);
        element.classList.add(`${field}-${this.current.bsColorScheme}`);
    }
}