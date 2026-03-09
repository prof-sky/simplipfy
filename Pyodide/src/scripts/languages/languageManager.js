/**
 * A lambda function that uses the languageManager to return a language specific string.
 * e.g. "() => languageManager.currentLang.settingsPage.resetMessage"
 * this asserts that the value is reloaded and not cached
 *
 * @callback LanguageString
 * @returns {string}
 */

function createFallbackProxy(primary, fallback, path = []) {
    return new Proxy(primary, {
        get(obj, prop) {
            const newPath = path + "." + prop;

            let value;
            let fromFallback = false;

            // Try primary first
            try {
                value = obj[prop];
            } catch {
                value = undefined;
            }

            // If missing in primary, try fallback
            if (value === undefined) {
                try {
                    value = fallback[prop];
                    if (value === undefined) {
                        throw Error();
                    }
                    fromFallback = true;
                    console.warn(`Value not set: {lang.${languageManager.langSymbol}.js}${newPath}`)
                } catch {
                    console.warn(`Fallback Value not set: {lang.en.js}${newPath}`)
                    value = " ! undefined ! "
                }
            }

            // Wrap nested objects so fallback works recursively
            if (value && typeof value === 'object') {
                const nextPrimary = fromFallback ? {} : value;
                const nextFallback = fromFallback ? value : (fallback[prop] || {});
                return createFallbackProxy(nextPrimary, nextFallback, newPath);
            }

            // If still undefined, return another proxy to keep chain alive
            if (value === undefined) {
                throw Error("Proxy error, value not found and no new object creatable");
            }

            return value;
        }
    });
}

class LanguageManager {
    #currentLang = window.english;
    symbolDefinitions = window.definitions.shortLanguageSymbols;
    //files that don't have other dependencies, fetched asynchronously
    /** @type {string} */
    deps
    /** returns the language symbol of the language currently set should always be equal to this.langSymbol()*/
    #currLangSymbol = "en"

    langs = {
        en: window.english
    }

    constructor() {
        let domain = window.location.href.split("#")[0];
        domain = domain.replace("/datenschutz.html", "");
        domain = domain.replace("/impressum.html", "");
        this.deps = `${domain}/src/scripts/languages/<ls>/<ls>.bundle.js`;
    }

    /**
     * @returns {EnglishLang}
     */
    get currentLang(){
        return createFallbackProxy(this.#currentLang, window.english, "");
    }

    /**
     * Returns the language symbol of the language currently in use
     * @returns {string}
     */
    get langSymbol(){
        return this.#currLangSymbol
    }

    set currentLang(newLang) {
        this.#currentLang = newLang;
    }

    async fetchLangFiles(langSymbol){
        if(!(Object.keys(this.langs).includes(langSymbol))){
            let resolve = await loadFile(this.deps.replaceAll("<ls>", langSymbol));
            if (resolve instanceof Error) {
                console.error(`Error loading language file for ${langSymbol}: ${resolve}`);
                return;
            }
            let langName = Object.entries(this.symbolDefinitions).find(([k, v]) => v === langSymbol)[0];
            this.langs[langSymbol] = window[langName];
        }
    }

    async setLang(lang){
        await this.fetchLangFiles(lang);
        this.#currLangSymbol = lang;
        this.currentLang = this.langs[lang];
        storageManager.language.save(lang);

        if (!Object.keys(this.langs).includes(lang)){
            console.warn(`Language: ${lang} not recognized, using default (English)`);
            await this.setLang(lang);
        }
    }

    async setBrowserLang(){
        // Use browser language
        var userLang = navigator.language.match("(?<lang>[a-z]{2})(-[a-zA-Z]*)?").groups["lang"];
        if (userLang === "de" || userLang === "en") {
            await this.setLang(userLang);
        }
        else{
            console.warn(`Browser language: ${userLang} not recognized, using default (English)`);
            await this.setLang(this.symbolDefinitions.english);
        }
    }

    updateDataPrivacyPage() {
        const backBtn = document.getElementById('back-btn-data-privacy');
        backBtn.innerHTML = this.currentLang.dataLegal.dataPrivacyBackBtn;
    }

    updateLegalNoticePage() {
        const backBtn = document.getElementById('back-btn-legal');
        backBtn.innerHTML = this.currentLang.dataLegal.dataPrivacyBackBtn;
        const legalNoticeHeading = document.getElementById('legal-notice-heading');
        legalNoticeHeading.innerHTML = this.currentLang.dataLegal.legalNoticeHeading;
    }

}