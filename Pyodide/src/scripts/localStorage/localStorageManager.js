class LocalStorageManager {
    /** @type {LocalStorageManager} */
    instance = null;
    initialized = false;
    /** @type {GameModeSliderValues}*/
    gameModeStorage = null;
    /** @type {SavedLanguage}*/
    language = null;
    /** @type {AnimationShown}*/
    animationShown = null;
    /** @type {CircuitsDone}*/
    circuitsDone = null;
    /** @type {CircuitHash}*/
    circuitsHash = null;
    /** @type {TrackingIDs}*/
    trackingIDs = null;
    /** @type {FirstPage} */
    firstPage = null;
    /** @type {PreferredColorScheme} */
    preferredColorScheme = null;

    constructor() {
        if (this.instance) {
            return this.instance
        }
        this.instance = this;

        this.gameModeStorage = new GameModeSliderValues();
        this.language = new SavedLanguage();
        this.animationShown = new AnimationShown();
        this.circuitsDone = new CircuitsDone();
        this.circuitsHash = new CircuitHash();
        this.trackingIDs = new TrackingIDs();
        this.firstPage = new FirstPage();
        this.landingPageVisits = new LandingPageVisits();
        this.preferredColorScheme = new PreferredColorScheme();

        return this.instance;
    }
}