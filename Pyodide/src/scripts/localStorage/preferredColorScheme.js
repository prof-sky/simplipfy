/** @typedef {"dark" | "light"} colorScheme */

class PreferredColorScheme extends LocalStorageWriter{
    constructor() {
        super("preferred-color-scheme");
    }

    /** @param {colorScheme} mode */
    save(mode) {
        super._set(mode);
    }

    /**
     * @returns {colorScheme}
     */
    load() {
        let [success, value] = super._get()

        if (!success) {
            /** @type {colorScheme} */
            let colorScheme = this.mediaQuery();
            console.log(`Used media query for preferred color scheme, set to: ${colorScheme}`);
            this.save(colorScheme);
            return colorScheme;
        }

        return value;
    }

    mediaQuery(){
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) return 'dark';
        else return 'light';
    }

}