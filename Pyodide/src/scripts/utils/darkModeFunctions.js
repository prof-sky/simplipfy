function updateBsClassesTo(colorScheme, className, element) {
    if (colorScheme === ColorManager.lightMode.bsColorScheme) {
        switchBsClassToLight(className, element);
    } else if (colorScheme === ColorManager.darkMode.bsColorScheme) {
        switchBsClassToDark(className, element);
    } else {
        throw Error("Only light or dark colorScheme");
    }
}

function switchBsClassToLight(field, container) {
    if (container === null || container === undefined) {
        return;
    }
    container.classList.remove(`${field}-dark`);
    container.classList.add(`${field}-light`);
}

function switchBsClassToDark(field, container) {
    if (container === null || container === undefined) {
        return;
    }
    container.classList.remove(`${field}-light`);
    container.classList.add(`${field}-dark`);
}
