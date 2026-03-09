function getExplanation(values) {
    let voltSym = languageManager.currentLang.simplifier.voltageSymbol;
    let str = "";
    str += `<h5 class="text-center">${languageManager.currentLang.wheatstone.explanationTitle}</h5>`;
    str += `<div class="text-center">
                <p class="mb-1">$$${voltSym}q \\cdot \\left(\\frac{R2}{R1 + R2} - \\frac{R4}{R3 + R4}\\right) = ${voltSym}m$$</p>
            </div><br>`;
    if (state.unknown === "R1") {
        str += r1Explanation(values);
    } else if (state.unknown === "R2") {
        str += r2Explanation(values);
    } else if (state.unknown === "R3") {
        str += r3Explanation(values);
    } else if (state.unknown === "R4") {
        str += r4Explanation(values);
    } else if (state.unknown === "Um") {
        str += umExplanation(values);
    } else if (state.unknown === "Uq") {
        str += uqExplanation(values);
    } else if (twoResistorsUnkown()) {
        str += twoResistorsUnknownExplanation(values);
    }
    return str;
}

function twoResistorsUnkown() {
    // Unknown is a string with the missing values, so R1R2 means R1 and R2 are unknown
    // R2R1 will not happen since the order is always R1, R2, R3, R4 (see function createCells(table))
    let unknown = state.unknown;
    return (unknown === "R1R2" || unknown === "R1R3" || unknown === "R1R4" ||
        unknown === "R2R3" || unknown === "R2R4" || unknown === "R3R4");
}

function r1Explanation(values) {
    if (values.Um === 0) {
        return relationFormula(values);
    }
    let uq = languageManager.currentLang.simplifier.voltageSymbol + "q";
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    let str = `<h5>${languageManager.currentLang.wheatstone.rearrangeFor} R1</h5>`;
    str += `<div class="text-center">
                <p class="mb-1">$$\\frac{${um}}{${uq}} = \\frac{R2}{R1+R2} - \\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$\\frac{R2}{R1+R2} = \\frac{${um}}{${uq}} + \\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$R1 = \\frac{R2}{\\frac{${um}}{${uq}} + \\frac{R4}{R3+R4}} - R2$$</p>
                <p class="mb-1">$$R1 = \\frac{${r2Val}}{\\frac{${umVal}}{${uqVal}} + \\frac{${r4Val}}{${r3Val}+${r4Val}}} - ${r2Val}$$</p>
                <p class="mb-1">$$R1 = ${r1Val}$$</p>
            </div>`;
    return str;
}

function r2Explanation(values) {
    if (values.Um === 0) {
        return relationFormula(values);
    }
    let uq = languageManager.currentLang.simplifier.voltageSymbol + "q";
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    let str = `<h5>${languageManager.currentLang.wheatstone.rearrangeFor} R2</h5>`;
    str += `<div class="text-center">
                <p class="mb-1">$$\\frac{${um}}{${uq}} = \\frac{R2}{R1+R2} - \\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$\\frac{R2}{R1+R2} = \\frac{${um}}{${uq}} + \\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$R2 = (R1+R2) \\cdot \\left(\\frac{${um}}{${uq}} + \\frac{R4}{R3+R4}\\right)$$</p>
                <p class="mb-1">$$R2 = R1\\cdot\\frac{${um}}{${uq}} +  R1\\cdot\\frac{R4}{R3+R4} +  R2\\cdot\\frac{${um}}{${uq}} +  R2\\cdot\\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$R2\\cdot\\left(1-\\frac{${um}}{${uq}} - \\frac{R4}{R3+R4}\\right) = R1\\cdot\\frac{${um}}{${uq}} +  R1\\cdot\\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$R2 = \\frac{R1\\cdot\\frac{${um}}{${uq}} +  R1\\cdot\\frac{R4}{R3+R4}}{1-\\frac{${um}}{${uq}} - \\frac{R4}{R3+R4}}$$</p>
                <p class="mb-1">$$R2 = \\frac{${r1Val}\\cdot\\frac{${umVal}}{${uqVal}} +  ${r1Val}\\cdot\\frac{${r4Val}}{${r3Val}+${r4Val}}}{1-\\frac{${umVal}}{${uqVal}} - \\frac{${r4Val}}{${r3Val}+${r4Val}}}$$</p>
                <p class="mb-1">$$R2 = ${r2Val}$$</p>
            </div>`;
    return str;
}

function r3Explanation(values) {
    if (values.Um === 0) {
        return relationFormula(values);
    }
    let uq = languageManager.currentLang.simplifier.voltageSymbol + "q";
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    let str = `<h5>${languageManager.currentLang.wheatstone.rearrangeFor} R3</h5>`;
    str += `<div class="text-center">
                <p class="mb-1">$$\\frac{${um}}{${uq}} = \\frac{R2}{R1+R2} - \\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$\\frac{R4}{R3+R4} = \\frac{R2}{R1+R2} - \\frac{${um}}{${uq}}$$</p>
                <p class="mb-1">$$R3 = \\frac{R4}{\\frac{R2}{R1+R2} - \\frac{${um}}{${uq}}} - R4$$</p>
                <p class="mb-1">$$R3 = \\frac{${r4Val}}{\\frac{${r2Val}}{${r1Val}+${r2Val}} - \\frac{${umVal}}{${uqVal}}} - ${r4Val}$$</p>
                <p class="mb-1">$$R3 = ${r3Val}$$</p>
            </div>`;
    return str;
}

function r4Explanation(values) {
    if (values.Um === 0) {
        return relationFormula(values);
    }
    let uq = languageManager.currentLang.simplifier.voltageSymbol + "q";
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    let str = `<h5>${languageManager.currentLang.wheatstone.rearrangeFor} R4</h5>`;
    str += `<div class="text-center">
                <p class="mb-1">$$\\frac{${um}}{${uq}} = \\frac{R2}{R1+R2} - \\frac{R4}{R3+R4}$$</p>
                <p class="mb-1">$$\\frac{R4}{R3+R4} = \\frac{R2}{R1+R2} - \\frac{${um}}{${uq}}$$</p>
                <p class="mb-1">$$R4 = (R3+R4) \\cdot \\left(\\frac{R2}{R1+R2} - \\frac{${um}}{${uq}}\\right)$$</p>
                <p class="mb-1">$$R4 = R3 \\cdot \\frac{R2}{R1+R2} - R3 \\cdot \\frac{${um}}{${uq}} + R4 \\cdot \\frac{R2}{R1+R2} - R4 \\cdot \\frac{${um}}{${uq}}$$</p>
                <p class="mb-1">$$R4 \\cdot \\left(1 - \\frac{R2}{R1+R2} + \\frac{${um}}{${uq}}\\right) = R3 \\cdot \\frac{R2}{R1+R2} - R3 \\cdot \\frac{${um}}{${uq}}$$</p>
                <p class="mb-1">$$R4 = \\frac{R3 \\cdot \\frac{R2}{R1+R2} - R3 \\cdot \\frac{${um}}{${uq}}}{1 - \\frac{R2}{R1+R2} + \\frac{${um}}{${uq}}}$$</p>
                <p class="mb-1">$$R4 = \\frac{${r3Val} \\cdot \\frac{${r2Val}}{${r1Val}+${r2Val}} - ${r3Val} \\cdot \\frac{${umVal}}{${uqVal}}}{1 - \\frac{${r2Val}}{${r1Val}+${r2Val}} + \\frac{${umVal}}{${uqVal}}}$$</p>
                <p class="mb-1">$$R4 = ${r4Val}$$</p>
            </div>`;
    return str;
}

function umExplanation(values) {
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    return `<div class="text-center">
                <p class="mb-1">$$ ${um} =  ${uqVal} \\cdot \\left(\\frac{${r2Val}}{${r1Val} + ${r2Val}} - \\frac{${r4Val}}{${r3Val} + ${r4Val}}\\right)$$</p>
                <p class="mb-1">$$ ${um} =  ${umVal}$$</p>
            </div><br>`;
}

function uqExplanation(values) {
    let uq = languageManager.currentLang.simplifier.voltageSymbol + "q";
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    return `<div class="text-center">
                <p class="mb-1">$$${uq} = \\frac{${um}}{\\left(\\frac{R2}{R1 + R2} - \\frac{R4}{R3 + R4}\\right)}$$</p>
                <p class="mb-1">$$${uq} = \\frac{${umVal}}{\\left(\\frac{${r2Val}}{${r1Val} + ${r2Val}} - \\frac{${r4Val}}{${r3Val} + ${r4Val}}\\right)}$$</p>
                <p class="mb-1">$$${uq} = ${uqVal}$$</p>
            </div><br>`;
}

function twoResistorsUnknownExplanation(values) {
    let uq = languageManager.currentLang.simplifier.voltageSymbol + "q";
    let um = languageManager.currentLang.simplifier.voltageSymbol + "m";
    let r1Val = values.R1 + "\\Omega";
    let r2Val = values.R2 + "\\Omega";
    let r3Val = values.R3 + "\\Omega";
    let r4Val = values.R4 + "\\Omega";
    let uqVal = values.Uq + "V";
    let umVal = values.Um + "V";
    let str = "";
    if (values.Um === 0) {
        str += "<div class='text-center'>";
        str += languageManager.currentLang.wheatstone.bridgeVoltage0;
        str += `<p>$$\\frac{R1}{R2} = \\frac{R3}{R4}$$</p>`;
        str += `<p>$$\\frac{${r1Val}}{${r2Val}} = \\frac{${r3Val}}{${r4Val}}$$</p>`;
    } else {
        // TODO if Um != 0
    }
    return str;
}

function relationFormula(values) {
    // Don't use formula if Um = 0 since calculation with the resistance relation is easier
    let voltSym = languageManager.currentLang.simplifier.voltageSymbol;
    let str = languageManager.currentLang.wheatstone.bridgeVoltage0;
    str += `<div class="text-center">
                <p class="mb-1">$$\\frac{R1}{R2} = \\frac{R3}{R4}$$</p>
            </div>`;
    // Rearranging formula depending on missing value
    if (state.unknown === "R1") {
        str += `<div class="text-center">
                    <p class="mb-1">$$R1 = \\frac{R3 \\cdot R2}{R4}$$</p>
                    <p class="mb-1">$$R1 = \\frac{${values.R3}\\Omega \\cdot ${values.R2}\\Omega}{${values.R4}\\Omega}$$</p>
                    <p class="mb-1">$$R1 = ${(values.R3 * values.R2) / values.R4}\\Omega$$</p>
                </div>`;
    } else if (state.unknown === "R2") {
        str += `<div class="text-center">
                    <p class="mb-1">$$R2 = \\frac{R1 \\cdot R4}{R3}$$</p>
                    <p class="mb-1">$$R2 = \\frac{${values.R1}\\Omega \\cdot ${values.R4}\\Omega}{${values.R3}\\Omega}$$</p>
                    <p class="mb-1">$$R2 = ${(values.R1 * values.R4) / values.R3}\\Omega$$</p>
                </div>`;
    } else if (state.unknown === "R3") {
        str += `<div class="text-center">
                    <p class="mb-1">$$R3 = \\frac{R1 \\cdot R4}{R2}$$</p>
                    <p class="mb-1">$$R3 = \\frac{${values.R1}\\Omega \\cdot ${values.R4}\\Omega}{${values.R2}\\Omega}$$</p>
                    <p class="mb-1">$$R3 = ${(values.R1 * values.R4) / values.R2}\\Omega$$</p>
                </div>`;
    } else if (state.unknown === "R4") {
        str += `<div class="text-center">
                    <p class="mb-1">$$R4 = \\frac{R2 \\cdot R3}{R1}$$</p>
                    <p class="mb-1">$$R4 = \\frac{${values.R2}\\Omega \\cdot ${values.R3}\\Omega}{${values.R1}\\Omega}$$</p>
                    <p class="mb-1">$$R4 = ${(values.R2 * values.R3) / values.R1}\\Omega$$</p>
                </div>`;
    }
    return str;
}