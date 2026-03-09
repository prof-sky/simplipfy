
/*
// TODO !!
- berechnen des stroms für Rs2 raus, das haben wir im unteren bild schon gemacht
   (geht das immer, in ruhe anschauen ob mans wirklich streichen kann???)
- auch bei RLC usw diesen block rausstreichen
 */



// Generates a paragraph describing the resistance simplification step
function generateTextForZ(stepObject) {
    let relation = stepObject.componentsRelation;
    /** @type {HTMLParagraphElement} */
    const paragraphElement = document.createElement('p');
    paragraphElement.classList.add("explText");
    const firstPart = getElementsAndRelationDescription(stepObject);

    // Calculation descriptions are swapped for R/L and C
    if (state.step0Data.componentTypes === "R" || state.step0Data.componentTypes === "L") {
        if (relation === "series") {
            paragraphElement.innerHTML = firstPart + getAdditionCalculation(stepObject)
        } else if (relation === "parallel") {
            paragraphElement.innerHTML = firstPart + getReciprocalCalculation(stepObject)
        }
    } else if (state.step0Data.componentTypes === "C") {
        if (relation === "parallel") {
            paragraphElement.innerHTML = firstPart + getAdditionCalculation(stepObject);
        } else if (relation === "series") {
            paragraphElement.innerHTML = firstPart + getReciprocalCalculation(stepObject);
        }
    } else if (state.step0Data.componentTypes === "RLC") {
        // This can still be R, L, C, RC, RL, LC, RLC, needs to be checked
        if (relation === "series") {
            paragraphElement.innerHTML = firstPart + getComplexSeriesCalculation(stepObject)
        } else if (relation === "parallel") {
            paragraphElement.innerHTML = firstPart + getComplexParallelCalculation(stepObject)
        }
    } else {
        console.log("No component type found: ", state.step0Data.componentTypes);
    }
    return paragraphElement;
}

function getComplexSeriesCalculation(stepObject) {
    let cptTypes = stepObject.getComponentTypes();
    if (["R", "L"].includes(cptTypes)) return getAdditionCalculation(stepObject);
    if (["C"].includes(cptTypes)) return getReciprocalCalculation(stepObject);
    if (["Z", "RC", "RL", "LC", "RLC"].includes(cptTypes)) return getComplexAdditionCalculation(stepObject);
    return languageManager.currentLang.simplifier.missingExplanation;
}

function getComplexParallelCalculation(stepObject) {
    let cptTypes = stepObject.getComponentTypes();
    if (["R", "L"].includes(cptTypes)) return getReciprocalCalculation(stepObject);
    if (["C"].includes(cptTypes)) return getAdditionCalculation(stepObject);
    if (["Z", "RC", "RL", "LC", "RLC"].includes(cptTypes)) return getComplexReciprocalCalculation(stepObject);
    return languageManager.currentLang.simplifier.missingExplanation;
}

function getLorCtoZExplanations(stepObject) {
    let str = "";
    for (let component of stepObject.components) {
        if (component.Z.name.includes("C")) {
            str += `${languageManager.currentLang.simplifier.complexImpedanceHeading} \\(\\underline{Z_{${component.Z.name}}}\\)<br>`;
            str += `$$\\underline{Z_{${component.Z.name}}} = \\frac{-j}{2\\pi f ${component.Z.name}}$$`;
            str += `$$\\underline{Z_{${component.Z.name}}} = ${component.Z.cpxVal}$$<br>`;
        }
        if (component.Z.name.includes("L")) {
            str += `${languageManager.currentLang.simplifier.complexImpedanceHeading} \\(\\underline{Z_{${component.Z.name}}}\\)<br>`;
            str += `$$\\underline{Z_{${component.Z.name}}} = j \\cdot 2\\pi f ${component.Z.name}$$`;
            str += `$$\\underline{Z_{${component.Z.name}}} = ${component.Z.cpxVal}$$<br>`;
        }
    }
    return str;
}

function getComplexAdditionCalculation(stepObject) {
    let str = "";
    str += "<br><br>";

    // Generate Zl or Zc explanations
    str += getLorCtoZExplanations(stepObject);

    // Add all Z
    str += `${languageManager.currentLang.simplifier.complexImpedanceHeading} \\(${stepObject.simplifiedTo.Z.name}\\)<br>`;
    str += `$$\\underline{${stepObject.simplifiedTo.Z.name}} = `;
    for (let component of stepObject.components) {
        if (component.Z.name.includes("Z")) {
            str += `\\underline{${component.Z.name}} + `;
        } else {
            str += `\\underline{Z_{${component.Z.name}}} + `;
        }
    }
    str = str.slice(0, -3);  // remove last +
    str += `$$`;

    str += `$$\\underline{${stepObject.simplifiedTo.Z.name}} = `;
    for (let component of stepObject.components) {
        str += `${component.Z.cpxVal} + `;
    }
    str = str.slice(0, -3);  // remove last +
    str += `$$`;
    // Carthesian
    str += `$$\\underline{${stepObject.simplifiedTo.Z.name}} = ${stepObject.simplifiedTo.Z.cpxVal}$$`;
    // At this point we know we simplify to a complex impedance, if however we find that simplifiedTo.Z.name
    // contains either L or C, we know that we can calculate the complex value back to L or C
    if (stepObject.simplifiedTo.Z.name.includes("L")) {
        str += `${languageManager.currentLang.simplifier.onlyImaginaryPart}\\(${stepObject.simplifiedTo.Z.name}\\)`;
        str += `$$(${stepObject.simplifiedTo.Z.name} = \\frac{\\underline{${stepObject.simplifiedTo.Z.name}}}{j2\\pi f} = ${stepObject.simplifiedTo.Z.val})$$<br>`;
    }
    if (stepObject.simplifiedTo.Z.name.includes("C")) {
        str += `${languageManager.currentLang.simplifier.onlyImaginaryPart}\\(${stepObject.simplifiedTo.Z.name}\\)`;
        str += `$$(${stepObject.simplifiedTo.Z.name} = \\frac{-j}{2\\pi f \\underline{${stepObject.simplifiedTo.Z.name}}} = ${stepObject.simplifiedTo.Z.val})$$<br>`;
    }


    // Absolute value
    str += `$$|\\underline{${stepObject.simplifiedTo.Z.name}}| = \\sqrt{(${stepObject.simplifiedTo.Z.re}\\Omega)^2 + (${stepObject.simplifiedTo.Z.im}\\Omega)^2} $$`;
    str += `$$|\\underline{${stepObject.simplifiedTo.Z.name}}| = ${stepObject.simplifiedTo.Z.impedance}$$`;
    // Phase
    str += `$$\\varphi = \\arctan(\\frac{${stepObject.simplifiedTo.Z.im}}{${stepObject.simplifiedTo.Z.re}}) = ${stepObject.simplifiedTo.Z.phase}$$`;
    // Polar
    str += `$$\\underline{${stepObject.simplifiedTo.Z.name}} = ${toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase)}$$`;

    return str;
}

function getComplexReciprocalCalculation(stepObject) {
    let str = "";
    str += "<br><br>";

    // Generate Zl or Zc explanations
    str += getLorCtoZExplanations(stepObject);

    // Add all Z
    str += `${languageManager.currentLang.simplifier.complexImpedanceHeading} \\(${stepObject.simplifiedTo.Z.name}\\)<br>`;
    str += `$$\\frac{1}{${stepObject.simplifiedTo.Z.name}} = `;
    for (let component of stepObject.components) {
        if (component.Z.name.includes("Z")) {
            str += `\\frac{1}{${component.Z.name}} + `;
        } else {
            str += `\\frac{1}{Z_{${component.Z.name}}} + `;
        }
    }
    str = str.slice(0, -3);  // remove last +
    str += `$$`;

    str += `$$\\frac{1}{${stepObject.simplifiedTo.Z.name}} = `;
    for (let component of stepObject.components) {
        str += `\\frac{1}{${component.Z.cpxVal}} + `;
    }
    str = str.slice(0, -3);  // remove last +
    str += `$$`;
    // Carthesian
    str += `$$\\underline{${stepObject.simplifiedTo.Z.name}} = ${stepObject.simplifiedTo.Z.cpxVal}$$`;
    // At this point we know we simplify to a complex impedance, if however we find that simplifiedTo.Z.name
    // contains either L or C, we know that we can calculate the complex value back to L or C
    if (stepObject.simplifiedTo.Z.name.includes("L")) {
        str += `${languageManager.currentLang.simplifier.onlyImaginaryPart}${stepObject.simplifiedTo.Z.name}`;
        str += `$$(${stepObject.simplifiedTo.Z.name} = \\frac{\\underline{${stepObject.simplifiedTo.Z.name}}}{j2\\pi f} = ${stepObject.simplifiedTo.Z.val})$$<br>`;
    }
    if (stepObject.simplifiedTo.Z.name.includes("C")) {
        str += `${languageManager.currentLang.simplifier.onlyImaginaryPart}${stepObject.simplifiedTo.Z.name}`;
        str += `$$(${stepObject.simplifiedTo.Z.name} = \\frac{-j}{2\\pi f \\underline{${stepObject.simplifiedTo.Z.name}}} = ${stepObject.simplifiedTo.Z.val})$$<br>`;
    }

    // Absolute value
    str += `$$|\\underline{${stepObject.simplifiedTo.Z.name}}| = \\sqrt{(${stepObject.simplifiedTo.Z.re}\\Omega)^2 + (${stepObject.simplifiedTo.Z.im}\\Omega)^2} $$`;
    str += `$$|\\underline{${stepObject.simplifiedTo.Z.name}}| = ${stepObject.simplifiedTo.Z.impedance}$$`;
    // Phase
    str += `$$\\varphi = \\arctan(\\frac{${stepObject.simplifiedTo.Z.im}}{${stepObject.simplifiedTo.Z.re}}) = ${stepObject.simplifiedTo.Z.phase}$$`;
    // Polar
    str += `$$\\underline{${stepObject.simplifiedTo.Z.name}} = ${toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase)}$$`;

    return str;
}

function generateTextForVoltageCurrent(stepObject) {
    let relation = stepObject.componentsRelation;
    /** @type {HTMLParagraphElement} */
    const text = document.createElement('p');
    text.classList.add("explText");

    if (relation === "series") {
        text.innerHTML = getSeriesVCDescription(stepObject);
    } else if (relation === "parallel") {
        text.innerHTML = getParallelVCDescription(stepObject);
    } else {
        text.innerHTML = languageManager.currentLang.simplifier.relationTextNoRelation;
    }
    return text;
}

function getTotalCurrent(stepObject) {
    let str = "";
    let sfx = languageManager.currentLang.simplifier.totalSuffix;
    if ([window.definitions.selectorIDs.capacitor,
        window.definitions.selectorIDs.inductor,
        window.definitions.selectorIDs.mixed].includes(state.currentCircuitMap.selectorGroup)) {
        sfx += "," + languageManager.currentLang.simplifier.effectiveSuffix;
    }
    let lastComponentType = stepObject.simplifiedTo.Z.name[0]; // R, L, C, Z

    str += `${languageManager.currentLang.simplifier.currentCalcHeading} \\(${stepObject.simplifiedTo.Z.name}\\)<br>`;

    if (lastComponentType === "Z" || lastComponentType === "R") {
        str += `$$I_{${sfx}} = \\frac{${languageManager.currentLang.simplifier.voltageSymbol}_{${sfx}}}{${lastComponentType}_{${sfx}}}$$`;
        str += `$$I_{${sfx}} = ${stepObject.simplifiedTo.I.name} = \\frac{${languageManager.currentLang.simplifier.voltageSymbol}_{${sfx}}}{${stepObject.simplifiedTo.Z.name}}$$`
    } else {
        str += `$$I_{${sfx}} = \\frac{${languageManager.currentLang.simplifier.voltageSymbol}_{${sfx}}}{Z_{${sfx}}}$$`;
        str += `$$I_{${sfx}} = ${stepObject.simplifiedTo.I.name} = \\frac{${languageManager.currentLang.simplifier.voltageSymbol}_{${sfx}}}{Z_{${stepObject.simplifiedTo.Z.name}}}$$`
    }
    if (currentCircuitIsSymbolic()) {
        str += `$$I_{${sfx}} = ${renameVSrc(stepObject.simplifiedTo.I.val)}$$`;
    } else {
        str += `$$I_{${sfx}} = \\frac{${stepObject.simplifiedTo.U.val}}{${stepObject.simplifiedTo.Z.impedance}}$$`;
        str += `$$I_{${sfx}} = ${stepObject.simplifiedTo.I.val}$$`;
    }
    return str;
}

function getComplexTotalCurrent(stepObject) {
    let str = "";
    let sfx = languageManager.currentLang.simplifier.totalSuffix;
    if ([window.definitions.selectorIDs.capacitor, window.definitions.selectorIDs.inductor, window.definitions.selectorIDs.mixed].includes(state.currentCircuitMap.selectorGroup)) {
        sfx += "," + languageManager.currentLang.simplifier.effectiveSuffix;
    }

    str += `${languageManager.currentLang.simplifier.currentCalcHeading} \\(${stepObject.simplifiedTo.Z.name}\\)<br>`;
    if (stepObject.simplifiedTo.Z.name.includes("Z")) {
        str += `$$\\underline{I_{${sfx}}} = \\underline{${stepObject.simplifiedTo.I.name}} = \\frac{\\underline{${languageManager.currentLang.simplifier.voltageSymbol}_{${sfx}}}}{\\underline{${stepObject.simplifiedTo.Z.name}}}$$`
    } else {
        str += `$$\\underline{I_{${sfx}}} = \\frac{\\underline{${languageManager.currentLang.simplifier.voltageSymbol}_{${sfx}}}}{\\underline{Z_{${stepObject.simplifiedTo.Z.name}}}}$$`
    }

    str += `$$\\underline{I_{${sfx}}} = \\frac{${stepObject.simplifiedTo.U.val}}{${toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase)}}$$`;
    str += `$$\\underline{I_{${sfx}}} = ${toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase)}$$`;
    return str;
}


function generateTextForTotalCurrent(stepObject) {
    if (state.step0Data.componentTypes === "RLC") {
        return getComplexTotalCurrent(stepObject);
    } else {
        return getTotalCurrent(stepObject);
    }
}

function getRelationText(stepObject) {
    let relationText = "";
    if (stepObject.componentsRelation === "parallel") {
        relationText = languageManager.currentLang.simplifier.relationTextParallel;
    } else if (stepObject.componentsRelation === "series") {
        relationText = languageManager.currentLang.simplifier.relationTextSeries;
    } else if (stepObject.componentsRelation === null) {
        relationText = languageManager.currentLang.simplifier.relationTextNoRelation;
    } else {
        console.log("No components relation found: ", stepObject.componentsRelation);
    }
    return relationText;
}

/** @returns {sting} */
function getElementsAndRelationDescription(stepObject) {
    let relationText = getRelationText(stepObject);
    let str = `${languageManager.currentLang.simplifier.theElements}<br>`;
    stepObject.components.forEach((component) => {str+= `\\(${component.Z.name}\\) `;});
    str += `<br>${languageManager.currentLang.simplifier.areSimplifiedTo} \\(${stepObject.simplifiedTo.Z.name}\\)<br><br>`;
    stepObject.components.forEach((component) => {str+= `\\(${component.Z.name}\\)&nbsp= \\(${stepObject.getZVal(component)}\\)<br>`;});
    str += `<br>${relationText}<br>`;
    return str;
}

/** @returns {string} */
function getReciprocalCalculation(stepObject) {
    // creates 1/X = 1/X1 + 1/X2
    // Use block MJ ('$$') to make sure formulas are horizontally scrollable if too long

    if (currentCircuitIsSymbolic()) {
        return `$$${stepObject.simplifiedTo.Z.name} = ${stepObject.getZVal(stepObject.simplifiedTo)}$$`;
    }

    let str = "";
    str += `$$\\frac{1}{${stepObject.simplifiedTo.Z.name}} = `;
    stepObject.components.forEach((component) => {str+= `\\frac{1}{${component.Z.name}} + `});
    str = str.slice(0, -3);  // remove last +
    str += `$$`;
    str += `$$\\frac{1}{${stepObject.simplifiedTo.Z.name}} = `;
    stepObject.components.forEach((component) => {str+= `\\frac{1}{${stepObject.getZVal(component)}} + `});
    str = str.slice(0, -3);  // remove last +
    str += `$$`;
    str += `$$\\frac{1}{${stepObject.simplifiedTo.Z.name}} = \\frac{1}{${stepObject.getZVal(stepObject.simplifiedTo)}}$$ <br>`;
    // No need for '$$', inline is ok
    str += `\\(${stepObject.simplifiedTo.Z.name} = ${stepObject.getZVal(stepObject.simplifiedTo)}\\) <br>`;
    return str;
}

/** @returns {string} */
function getAdditionCalculation(stepObject) {
    // creates X = X1 + X2
    // Use block MJ ('$$') to make sure formulas are horizontally scrollable if too long

    if (currentCircuitIsSymbolic()) {
        return `$$${stepObject.simplifiedTo.Z.name} = ${stepObject.getZVal(stepObject.simplifiedTo)}$$`;
    }

    let str = "";
    str += `$$${stepObject.simplifiedTo.Z.name} = `;
    stepObject.components.forEach((component) => {str+= `${component.Z.name} + `});
    str = str.slice(0, -3);  // remove last +
    str += `$$`;
    str += `$$${stepObject.simplifiedTo.Z.name} = `;
    stepObject.components.forEach((component) => {str+= `${stepObject.getZVal(component)} + `});
    str = str.slice(0, -3);  // remove last +
    str += `$$`;
    // No need for '$$', inline is ok
    str += `\\(${stepObject.simplifiedTo.Z.name} = ${stepObject.getZVal(stepObject.simplifiedTo)}\\) <br>`;
    return str;
}

function renameVSrc(val) {
    let newVal;
    let replaceVal = `${languageManager.currentLang.simplifier.voltageSymbol}_{${languageManager.currentLang.simplifier.totalSuffix}}`;
    if (val.includes("V_{1}")) {
        newVal = val.replaceAll("V_{1}", replaceVal);
    } else {
        newVal = val;
    }
    return newVal;
}

function getSymbolicSeriesVCDescription(stepObject) {
    let str = "";
    str += `${languageManager.currentLang.simplifier.relationTextSeries}.<br>`;
    str += `${languageManager.currentLang.simplifier.currentStaysTheSame}.<br>`;
    str += `$$${stepObject.simplifiedTo.I.name} = `;
    stepObject.components.forEach((component) => {
        str += `${component.I.name} = `
    });
    str = str.slice(0, -3);  // remove last =
    str += `$$`;
    str += `$$= ${renameVSrc(stepObject.simplifiedTo.I.val)}$$`;
    // Voltage split
    str += `<br>${languageManager.currentLang.simplifier.voltageSplits}.<br>`;
    stepObject.components.forEach((component) => {
        str += `$$${component.U.name} = ?$$`;
    });
    str += `<br>`;
    // Voltage calculation
    stepObject.components.forEach((component) => {
        if (stepObject.simplifiedTo.Z.name.includes("R") || stepObject.simplifiedTo.Z.name.includes("Z")) {
            str += `$$${component.U.name} = ${component.Z.name} \\cdot  ${component.I.name}$$`;
        } else {
            str += `$$${component.U.name} = X_{${component.Z.name}} \\cdot  ${component.I.name}$$`;
        }
        let value = component.Z.impedance;
        if (component.Z.impedance.includes("+")) {
            value = `(${component.Z.impedance})`;  // parentheses for combined values
        }
        str += `$$= ${value} \\cdot ${renameVSrc(stepObject.simplifiedTo.I.val)}$$`;  // use simplifiedTo val to make it more explanatory in symbolic circuits
        str += `$$= ${renameVSrc(component.U.val)}$$<br>`;
    });
    return str;
}

function getSymbolicParallelVCDescription(stepObject) {
    let str = "";
    str += `${languageManager.currentLang.simplifier.relationTextParallel}.<br>`;
    str += `${languageManager.currentLang.simplifier.voltageStaysTheSame}.<br>`;
    str += `$$${stepObject.simplifiedTo.U.name} = `;
    stepObject.components.forEach((component) => {str+= `${component.U.name} = `});
    str = str.slice(0, -3);  // remove last =
    str += `$$`;
    str += `$$= ${renameVSrc(stepObject.simplifiedTo.U.val)}$$`;
    // Current split
    str += `<br>${languageManager.currentLang.simplifier.currentSplits}.<br>`;
    stepObject.components.forEach((component) => {
        str += `$$${component.I.name} = ?$$`;
    });
    str += `<br>`;
    // Current calculation
    stepObject.components.forEach((component) => {
        let renamedU = renameVSrc(component.U.val);
        if (stepObject.simplifiedTo.Z.name.includes("R") || stepObject.simplifiedTo.Z.name.includes("Z")) {
            str += `$$${component.I.name} = \\frac{${renamedU}}{${component.Z.name}}$$`;
        } else {
            str += `$$${component.I.name} = \\frac{${renamedU}}{X_{${component.Z.name}}}$$`;
        }
        str += `$$= ${renameVSrc(component.I.val)}$$<br>`;
    });
    return str;
}

function getNonSymbolicSeriesVCDescription(stepObject) {
    if (state.step0Data.componentTypes === "RLC") {
        return getComplexNonSymbolicSeriesVC(stepObject);
    } else {
        return getNonSymbolicSeriesVC(stepObject);
    }
}

function getNonSymbolicParallelVCDescription(stepObject) {
    if (state.step0Data.componentTypes === "RLC") {
        return getComplexNonSymbolicParallelVC(stepObject);
    } else {
        return getNonSymbolicParallelVC(stepObject);
    }
}

function toPolar(A, P) {
    if (P[0] === "-") {
        return `${A} \\cdot e^{j\\cdot(${P})}`;
    } else {
        return `${A} \\cdot e^{j\\cdot${P}}`;
    }
}
function getComplexNonSymbolicParallelVC(stepObject) {
    let str = "";
    let SimplifiedZinPolar = toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase);
    let SimplifiedIinPolar = toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase);
    let SimplifiedUinPolar = toPolar(stepObject.simplifiedTo.U.val, stepObject.simplifiedTo.U.phase);

    str += `${languageManager.currentLang.simplifier.relationTextParallel}.<br>`;
    str += `${languageManager.currentLang.simplifier.voltageStaysTheSame}.<br>`;
    str += `$$\\underline{${stepObject.simplifiedTo.U.name}} = `;
    stepObject.components.forEach((component) => {
        str += `\\underline{${component.U.name}} = `
    });
    str = str.slice(0, -3);  // remove last =
    str += `$$`;
    str += `$$= ${SimplifiedUinPolar}$$`;
    // Voltage split
    str += `<br>${languageManager.currentLang.simplifier.currentSplits}.<br>`;
    stepObject.components.forEach((component) => {
        str += `$$\\underline{${component.I.name}} = ?$$`;
    });
    str += `<br>`;
    // Current calculation
    stepObject.components.forEach((cpt) => {
        if (cpt.Z.name.includes("Z")) {
            str += `$$\\underline{${cpt.I.name}} = \\frac{\\underline{${cpt.U.name}}}{\\underline{${cpt.Z.name}}}$$`;
        } else {
            str += `$$\\underline{${cpt.I.name}} = \\frac{\\underline{${cpt.U.name}}}{\\underline{Z_{${cpt.Z.name}}}}$$`;
        }
        str += `$$= \\frac{${SimplifiedUinPolar}}{${toPolar(cpt.Z.impedance, cpt.Z.phase)}}$$`;
        str += `$$= ${toPolar(cpt.I.val, cpt.I.phase)}$$<br>`;
    });
    return str;
}



function getComplexNonSymbolicSeriesVC(stepObject) {
    let str = "";
    let SimplifiedZinPolar = toPolar(stepObject.simplifiedTo.Z.impedance, stepObject.simplifiedTo.Z.phase);
    let SimplifiedIinPolar = toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase);
    let SimplifiedUinPolar = toPolar(stepObject.simplifiedTo.U.val, stepObject.simplifiedTo.U.phase);

    str += `${languageManager.currentLang.simplifier.relationTextSeries}.<br>`;
    str += `${languageManager.currentLang.simplifier.currentStaysTheSame}.<br>`;
    str += `$$\\underline{${stepObject.simplifiedTo.I.name}} = `;
    stepObject.components.forEach((component) => {
        str += `\\underline{${component.I.name}} = `
    });
    str = str.slice(0, -3);  // remove last =
    str += `$$`;
    str += `$$= ${SimplifiedIinPolar}$$`;
    // Voltage split
    str += `<br>${languageManager.currentLang.simplifier.voltageSplits}.<br>`;
    stepObject.components.forEach((component) => {
        str += `$$\\underline{${component.U.name}} = ?$$`;
    });
    str += `<br>`;
    // Voltage calculation
    stepObject.components.forEach((cpt) => {
        if (cpt.Z.name.includes("Z")) {
            str += `$$\\underline{${cpt.U.name}} = \\underline{${cpt.Z.name}} \\cdot  \\underline{${cpt.I.name}}$$`;
        } else {
            str += `$$\\underline{${cpt.U.name}} = \\underline{Z_{${cpt.Z.name}}} \\cdot  \\underline{${cpt.I.name}}$$`;
        }
        str += `$$= ${toPolar(cpt.Z.impedance, cpt.Z.phase)} \\cdot ${toPolar(stepObject.simplifiedTo.I.val, stepObject.simplifiedTo.I.phase)}$$`;  // use simplifiedTo val to make it more explanatory in symbolic circuits
        str += `$$= ${toPolar(cpt.U.val, cpt.U.phase)}$$<br>`;
    });
    return str;
}

function getNonSymbolicSeriesVC(stepObject) {
    let str = "";
    // Calculate current
    // make distinction between RLC and R L C again
    str += `${languageManager.currentLang.simplifier.relationTextSeries}.<br>`;
    str += `${languageManager.currentLang.simplifier.currentStaysTheSame}.<br>`;
    str += `$$${stepObject.simplifiedTo.I.name} = `;
    stepObject.components.forEach((component) => {
        str += `${component.I.name} = `
    });
    str = str.slice(0, -3);  // remove last =
    str += `$$`;
    str += `$$= ${stepObject.simplifiedTo.I.val}$$`;
    // Voltage split
    str += `<br>${languageManager.currentLang.simplifier.voltageSplits}.<br>`;
    stepObject.components.forEach((component) => {
        str += `$$${component.U.name} = ?$$`;
    });
    str += `<br>`;
    // Voltage calculation
    stepObject.components.forEach((component) => {
        if (stepObject.simplifiedTo.Z.name.includes("R") || stepObject.simplifiedTo.Z.name.includes("Z")) {
            str += `$$${component.U.name} = ${component.Z.name} \\cdot  ${component.I.name}$$`;
        } else {
            str += `$$${component.U.name} = Z_{${component.Z.name}} \\cdot  ${component.I.name}$$`;
        }
        str += `$$= ${component.Z.impedance} \\cdot ${stepObject.simplifiedTo.I.val}$$`;  // use simplifiedTo val to make it more explanatory in symbolic circuits
        str += `$$= ${component.U.val}$$<br>`;
    });
    return str;
}

function getNonSymbolicParallelVC(stepObject) {
    let str = "";
    str += `${languageManager.currentLang.simplifier.relationTextParallel}.<br>`;
    str += `${languageManager.currentLang.simplifier.voltageStaysTheSame}.<br>`;
    str += `$$${stepObject.simplifiedTo.U.name} = `;
    stepObject.components.forEach((component) => {str+= `${component.U.name} = `});
    str = str.slice(0, -3);  // remove last =
    str += `$$`;
    str += `$$= ${stepObject.simplifiedTo.U.val}$$`;
    // Current split
    str += `<br>${languageManager.currentLang.simplifier.currentSplits}.<br>`;
    stepObject.components.forEach((component) => {
        str += `$$${component.I.name} = ?$$`;
    });
    str += `<br>`;
    // Current calculation
    stepObject.components.forEach((component) => {
        if (stepObject.simplifiedTo.Z.name.includes("R") || stepObject.simplifiedTo.Z.name.includes("Z")) {
            str += `$$${component.I.name} = \\frac{${component.U.name}}{${component.Z.name}}$$`;
        } else {
            str += `$$${component.I.name} = \\frac{${component.U.name}}{Z_{${component.Z.name}}}$$`;
        }
        str += `$$= \\frac{${component.U.val}}{${component.Z.impedance}}$$`;
        str += `$$= ${component.I.val}$$<br>`;
    });
    return str;
}

function getSeriesVCDescription(stepObject) {
    if (currentCircuitIsSymbolic()) {
        return getSymbolicSeriesVCDescription(stepObject);
    } else {
        return getNonSymbolicSeriesVCDescription(stepObject);
    }
}

function getParallelVCDescription(stepObject) {
    if (currentCircuitIsSymbolic()) {
        return getSymbolicParallelVCDescription(stepObject);
    } else {
        return getNonSymbolicParallelVCDescription(stepObject);
    }
}
