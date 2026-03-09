class SavedLanguage extends LocalStorageWriter{

    constructor() {
        super("language");
    }

    save(lang){
        super._set(lang);
    }

    async load() {
        let [success, lang] = super._get()
        if (success) {
            await languageManager.setLang(lang);
        } else {
            await languageManager.setBrowserLang();
        }
        return [success, lang]
    }
}