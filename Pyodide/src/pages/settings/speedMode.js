class SpeedMode extends Content{
    simplifierBaseLabel = null;
    simplifierBaseRange = null;
    simplifierAddRange = null;
    simplifierAddLabel = null;
    kirchhoffBaseRange = null;
    kirchhoffBaseLabel = null;
    kirchhoffAddRange = null;
    kirchhoffAddLabel = null;

    constructor() {
        let idLangMap = new Map([
            ["speed-mode-settings-title", () => languageManager.currentLang.settingsPage.speedModeSettingsTitle],
            ["simplifier-base-label", () => languageManager.currentLang.settingsPage.simplifierBaseTimeLabel + ` (${state.simplifierBaseTime.inSeconds()}s)`],
            ["simplifier-add-label", () => languageManager.currentLang.settingsPage.simplifierAddTimeLabel + ` (${state.simplifierAddTime.inSeconds()}s)`],
            ["kirchhoff-base-label", () => languageManager.currentLang.settingsPage.kirchhoffBaseTimeLabel + ` (${state.kirchhoffBaseTime.inSeconds()}s)`],
            ["kirchhoff-add-label", () => languageManager.currentLang.settingsPage.kirchhoffAddTimeLabel + ` (${state.kirchhoffAddTime.inSeconds()}s)`],
        ])
        super(idLangMap, "settings-page-speedMode");
    }

    setup() {
        //check for save values
        storageManager.gameModeStorage.load()

        // Add for ranges for the speed mode
        let stepSize = state.timeSliderStepSize;
        let simplBaseTime = new SliderValues(state.simplifierBaseTime.ms(), 3e3, 20e3, stepSize.ms());
        let simplAddTime = new SliderValues(state.simplifierAddTime.ms(), 0, 5e3, stepSize.ms());
        let kirchhoffBaseTime = new SliderValues(state.kirchhoffBaseTime.ms(), 3e3, 20e3, stepSize.ms());
        let kirchhoffAddTime = new SliderValues(state.kirchhoffAddTime.ms(), 0, 5e3, stepSize.ms());

        let div = document.createElement("div");
        div.id = this.mainID;
        let speedModeTitle = document.createElement("p");
        speedModeTitle.id = "speed-mode-settings-title";
        speedModeTitle.classList.add("mt-5");
        speedModeTitle.style.fontWeight = "bold";
        speedModeTitle.textContent = languageManager.currentLang.settingsPage.speedModeSettingsTitle;
        speedModeTitle.style.color = colors.current.foreground;
        div.appendChild(speedModeTitle);

        // ========================= Range 1 - Simplifier Base time ========================
        [this.simplifierBaseLabel, this.simplifierBaseRange] = this.#makeRangeWithLabel(
            "simplifier-base", simplBaseTime
        );

        div.appendChild(this.simplifierBaseLabel);
        div.appendChild(this.simplifierBaseRange);

        // ========================= Range 2 - Simplifier Add time ========================
        [this.simplifierAddLabel, this.simplifierAddRange] = this.#makeRangeWithLabel(
            "simplifier-add", simplAddTime
        );

        div.appendChild(this.simplifierAddLabel);
        div.appendChild(this.simplifierAddRange);

        // ========================= Range 3 - Kirchhoff Base time ========================
        [this.kirchhoffBaseLabel, this.kirchhoffBaseRange] = this.#makeRangeWithLabel(
            "kirchhoff-base", kirchhoffBaseTime
        );

        div.appendChild(this.kirchhoffBaseLabel);
        div.appendChild(this.kirchhoffBaseRange);

        // ========================= Range 3 - Kirchhoff Base time ========================
        [this.kirchhoffAddLabel, this.kirchhoffAddRange] = this.#makeRangeWithLabel(
            "kirchhoff-add", kirchhoffAddTime
        )

        div.appendChild(this.kirchhoffAddLabel);
        div.appendChild(this.kirchhoffAddRange);

        return div
    }

    updateColor() {
        let content = document.getElementById(this.mainID);
        content.style.backgroundColor = colors.current.bsBackground;
    }

    addEventListeners() {
        // Update the value when the range is changed
        this.simplifierBaseRange.addEventListener("input", () => {
            state.simplifierBaseTime = new TimeVal(parseFloat(this.simplifierBaseRange.value));
            this.simplifierBaseLabel.innerHTML = languageManager.currentLang.settingsPage.simplifierBaseTimeLabel + ` (${state.simplifierBaseTime.inSeconds()}s)`;
            storageManager.gameModeStorage.save();
        });

        // Update the value when the range is changed
        this.simplifierAddRange.addEventListener("input", () => {
            state.simplifierAddTime = new TimeVal(parseFloat(this.simplifierAddRange.value));
            this.simplifierAddLabel.innerHTML = languageManager.currentLang.settingsPage.simplifierAddTimeLabel + ` (${state.simplifierAddTime.inSeconds()}s)`;
            storageManager.gameModeStorage.save();
        });

        // Update the value when the range is changed
        this.kirchhoffBaseRange.addEventListener("input", () => {
            state.kirchhoffBaseTime = new TimeVal(parseFloat(this.kirchhoffBaseRange.value));
            this.kirchhoffBaseLabel.innerHTML = languageManager.currentLang.settingsPage.kirchhoffBaseTimeLabel + ` (${state.kirchhoffBaseTime.inSeconds()}s)`;
            storageManager.gameModeStorage.save();
        });

        // Update the value when the range is changed
        this.kirchhoffAddRange.addEventListener("input", () => {
            state.kirchhoffAddTime = new TimeVal(parseFloat(this.kirchhoffAddRange.value));
            this.kirchhoffAddLabel.innerHTML = languageManager.currentLang.settingsPage.kirchhoffAddTimeLabel + ` (${state.kirchhoffAddTime.inSeconds()}s)`;
            storageManager.gameModeStorage.save();
        });
    }

    /**
     * [bar description]
     * @param {string} id is concatenated with -range for range and -label for label
     * @param  {SliderValues} value object with times to set range to in ms, integer
     * @return {Array<HTMLParagraphElement | HTMLInputElement>} Array has fixed length of two, first element is label<HTMLParagraphElement>, second is range<HTMLInputElement>
     */
    #makeRangeWithLabel(id, value){
        let simplifierBaseRange = document.createElement("input");
        simplifierBaseRange.type = "range";
        simplifierBaseRange.classList.add("form-range", "mx-auto");
        simplifierBaseRange.id = id + "-range";
        simplifierBaseRange.min = value.minVal.ms().toString();
        simplifierBaseRange.max = value.maxVal.ms().toString();
        simplifierBaseRange.step = value.stepSize.ms().toString();
        simplifierBaseRange.value = (value.value.ms()).toString();
        simplifierBaseRange.style.width = "90%";
        simplifierBaseRange.style.maxWidth = "450px";

        let simplifierBaseLabel = document.createElement("p");
        simplifierBaseLabel.id =  id + "-label";
        simplifierBaseLabel.style.color = colors.current.foreground;

        let labelText = languageManager.currentLang.settingsPage.simplifierBaseTimeLabel + ` (${value.value.inSeconds()}s)`;
        simplifierBaseLabel.innerHTML = labelText;

        return [simplifierBaseLabel, simplifierBaseRange]
    }

}