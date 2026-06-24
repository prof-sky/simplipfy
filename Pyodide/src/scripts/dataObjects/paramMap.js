/**
 * @typedef {"volt" | "total"} ParamKey
 */

/**
 * Holds the configuration values for the backend. Backend needs to know which names it uses for total voltage / current
 * and which symbol is used for the voltage (V / U) e.g. in german it is Uges in engish it is Vtot.
 * @extends {Map<ParamKey, string>}
 */
class ParamMap extends Map {
    constructor(props) {
        super(props);
        this.set("volt", languageManager.currentLang.simplifier.voltageSymbol);
        this.set("total", languageManager.currentLang.simplifier.totalSuffix);
    }
}