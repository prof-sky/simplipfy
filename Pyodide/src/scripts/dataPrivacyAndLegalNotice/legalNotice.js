async function setupLegalNoticePage() {

    let backBtn = document.getElementById("back-btn-legal");
    let navLogo = document.getElementById("nav-logo");
    let navHome = document.getElementById("nav-home");

    let stm = new LocalStorageManager();
    let [success, langSymbol] = stm.language._get()
    if (!success) {
        throw Error("Cant setup page because language cant be loaded from local storage");
    }
    let languageManager = new LanguageManager();
    await languageManager.setLang(langSymbol);

    let [success2, theme] = stm.preferredColorScheme._get();
    if (!success2) {
        throw Error("Cant setup page because theme cant be loaded from local storage");
    }



    let colors = new ColorManager();
    if (theme === "light") colors.setLightModeColors();
    else colors.setDarkModeColors();

    // standard is dark only do something if it's light
    if (theme === "light") {
        let navbar = document.getElementById("navbar");
        navbar.classList.remove("bg-dark", "navbar-dark");
        navbar.classList.add("bg-light", "navbar-light");

        const dataPrivacyContainer = document.getElementById("legal-notice-container");
        dataPrivacyContainer.classList.remove("bg-dark", "text-light");
        dataPrivacyContainer.classList.add("bg-light", "text-dark");
    }

    backBtn.addEventListener("click", () => {
        window.location.pathname = window.location.pathname.substring(0, window.location.pathname.indexOf('impressum.html'))
    });
    navLogo.addEventListener("click", () => {
        window.location.pathname = window.location.pathname.substring(0, window.location.pathname.indexOf('impressum.html'))
    });
    navHome.addEventListener("click", () => {
        window.location.pathname = window.location.pathname.substring(0, window.location.pathname.indexOf('impressum.html'))
    });
    navHome.style.color = colors.current.foreground;

    document.getElementById("activeLanguageFlag").setAttribute("src", `src/resources/navigation/${langSymbol}.png`);

    document.getElementById("data-privacy").innerHTML = languageManager.currentLang.navigation.dataprivacy;
    document.getElementById("legal").innerHTML = languageManager.currentLang.navigation.legal;

    document.getElementById("back-btn-legal").innerHTML = languageManager.currentLang.dataLegal.backBtn;
}