/**
 * On this page the tracking-Ids from the QR-generation can be entered to see
 *
 */
class TrackingPage extends Page{
    constructor() {
        let content = {
            tracker: new LiveTrackerEditor(),
        }
        // tracking-page-container (id of div on index.htlm)
        super(content, "tracking-page-container", "tracking");
    }

    setup() {
        if (!super.beforeSetup()) return;
        this.pageDiv.appendChild(this.content.tracker.setup());
        super.afterSetup();
    }

    show(animate = false) {
        super.show(animate);
        return true;
    }

    hide(animate = false) {
        super.hide(animate);
        /** @type {LiveTrackerEditor} */
        const tracker = this.content.tracker;
        tracker.stopUpdatingTables;
        if (tracker.trackingData.randomSession)
        TrackingDB.deactivateTracking(tracker.trackingData.randomSession, participantName);
        this.isInitialized = false;
    }

    async initialize() {
        if(!super.beforeInit()) return;

        /** @type {LiveTrackerEditor} */
        const tracker = this.content.tracker;
        await tracker._startTracking();

        super.afterInit();
    }
}