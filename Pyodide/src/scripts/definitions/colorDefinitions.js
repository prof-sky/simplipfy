class ColorDefinitions {

    keyYellow = "#FFC107";
    keyYellowDarkened = "#af8807";
    keyLight = "white";
    keyDark = "black";
    kirchhoffGray = "gray";
    keyGreyedOut = "#b1b1b1";
    voltageBlue = "#9898ff";
    lightVoltageBlue = "#bdbdbd";//"#c0c0ff";
    currentRed = "red";
    lightCurrentRed = "#bdbdbd"; //"#ffafaf";
    bootstrapDark = "#212529";
    bootstrapWhite = "#f8f9fa";
    languagesDarkBg = "#33393f";
    languagesLightBg = "#efefef";
    correctEquationColor = "green";
    wrongEquationColor = "red";
    syntaxErrorRed = "#ff3131";
    warningOrange = "#ff7835";


    currentForeground = this.keyLight;
    currentHeadingsForeground = this.keyYellow;  // yellow in darkmode, black in lightmode
    currentBackground = this.keyDark;
    currentBsBackground = this.bootstrapDark;

    prevNextBtnBackgroundColor = this.keyYellow;

    bsColorSchemeLight = "light";
    bsColorSchemeDark = "dark";
    currentBsColorScheme = this.bsColorSchemeDark;

    lightModeSvgStrokeColor = this.keyDark;
    darkModeSvgStrokeColor = this.keyLight;

    setDarkModeColors() {
        this.currentForeground = this.keyLight;
        this.currentHeadingsForeground = this.keyYellow;
        this.currentBackground = this.keyDark;
        this.currentBsBackground = this.bootstrapDark;
        this.currentBsColorScheme = this.bsColorSchemeDark;
    }
    setLightModeColors() {
        this.currentForeground = this.keyDark;
        this.currentHeadingsForeground = this.keyDark;
        this.currentBackground = this.keyLight;
        this.currentBsBackground = this.bootstrapWhite;
        this.currentBsColorScheme = this.bsColorSchemeLight;
    }
}