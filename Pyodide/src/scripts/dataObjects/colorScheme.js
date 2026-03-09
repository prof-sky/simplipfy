/**
 * @interface
 * Defines which colors are needed for a color scheme on the webpage. Example usage {@link DarkMode} or {@link LightMode}.
 * */
class ColorScheme {
    /** @type {string} */
    foreground;
    /** @type {string} */
    headingForeground;
    /** @type {string} */
    background;
    /** @type {string} */
    bsBackground;
    /** @type {"light" | "dark"} */
    bsColorScheme;
    /** @type {string} */
    svgStrokeColor;
    /** @type {string} */
    languagesBg;

    constructor(foreground, headingForeground, background, bsBackground, bsColorScheme, svgStrokeColor, languagesBg, prevNextBtnBackgroundColor) {
        this.foreground = foreground;
        this.headingForeground = headingForeground;
        this.background = background;
        this.bsBackground = bsBackground;
        this.bsColorScheme = bsColorScheme;
        this.svgStrokeColor = svgStrokeColor;
        this.languagesBg = languagesBg;
        this.prevNextBtnBackgroundColor = prevNextBtnBackgroundColor
    }

    /** @returns {"light" | "dark"} */
    get bsColorSchemeForIndicatorBtns(){
        if (this.bsColorScheme === "dark"){
            return "light"
        }
        else return "dark"
    }
}