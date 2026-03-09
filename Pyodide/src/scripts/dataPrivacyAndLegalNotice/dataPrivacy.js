let storageManager = new LocalStorageManager();
let colors = new ColorManager();
let languageManager = new LanguageManager();

async function setupDataPrivacyPage() {

    let backBtn = document.getElementById("back-btn-data-privacy");
    let navLogo = document.getElementById("nav-logo");
    let navHome = document.getElementById("nav-home");

    let [success, langSymbol] = storageManager.language._get();
    if (!success) {
        throw Error("Cant setup page because language cant be loaded from local storage");
    }

    let [success2, theme] = storageManager.preferredColorScheme._get();

    if (!success2) {
        throw Error("Cant setup page because theme cant be loaded from local storage");
    }

    backBtn.addEventListener("click", () => {
        window.location.pathname = window.location.pathname.substring(0, window.location.pathname.indexOf('datenschutz.html'))
    });
    navLogo.addEventListener("click", () => {
        window.location.pathname = window.location.pathname.substring(0, window.location.pathname.indexOf('datenschutz.html'))
    });
    navHome.addEventListener("click", () => {
        window.location.pathname = window.location.pathname.substring(0, window.location.pathname.indexOf('datenschutz.html'))
    });

    if (theme === "light") colors.setLightModeColors();
    else colors.setDarkModeColors();

    navHome.style.color = colors.current.foreground;

    const activeFlagIcon = document.getElementById("activeLanguageFlag");
    if (langSymbol === "de") {
        activeFlagIcon.setAttribute("src", "src/resources/navigation/de.png");
    }
    else if (langSymbol === "en") {
        activeFlagIcon.setAttribute("src", "src/resources/navigation/en.png");
    }

    // standard is dark only do something if it's light
    if (theme === "light") {
        let navbar = document.getElementById("navbar");
        navbar.classList.remove("bg-dark", "navbar-dark");
        navbar.classList.add("bg-light", "navbar-light");

        const dataPrivacyContainer = document.getElementById("data-privacy-container");
        dataPrivacyContainer.classList.remove("bg-dark", "text-light");
        dataPrivacyContainer.classList.add("bg-light", "text-dark");
    }
    await languageManager.setLang(langSymbol);


    document.getElementById("data-privacy-text").innerHTML = languageManager.currentLang.dataPrivacyPage.dataPrivacyBody
    document.getElementById("data-privacy").innerHTML = languageManager.currentLang.navigation.dataprivacy;
    document.getElementById("legal").innerHTML = languageManager.currentLang.navigation.legal;

    let settings = {
        "showIntro":true,
        "divId":"matomo-opt-out",
        "useSecureCookies":true,
        "cookiePath":null,
        "cookieDomain":null,
        "cookieSameSite":"Lax",
        "OptOutComplete": languageManager.currentLang.dataPrivacyPage.OptOutComplete,
        "OptOutCompleteBis": languageManager.currentLang.dataPrivacyPage.OptOutCompleteBis,
        "YouMayOptOut2": languageManager.currentLang.dataPrivacyPage.YouMayOptOut2,
        "YouMayOptOut3": languageManager.currentLang.dataPrivacyPage.YouMayOptOut3,
        "OptOutErrorNoCookies": languageManager.currentLang.dataPrivacyPage.OptOutErrorNoCookies,
        "OptOutErrorNotHttps": languageManager.currentLang.dataPrivacyPage.OptOutErrorNotHttps,
        "YouAreNotOptedOut": languageManager.currentLang.dataPrivacyPage.YouAreNotOptedOut,
        "UncheckToOptOut": languageManager.currentLang.dataPrivacyPage.UncheckToOptOut,
        "YouAreOptedOut": languageManager.currentLang.dataPrivacyPage.YouAreOptedOut,
        "CheckToOptIn": languageManager.currentLang.dataPrivacyPage.CheckToOptIn};

    setupMatomo();
    document.getElementById("back-btn-data-privacy").innerHTML = languageManager.currentLang.dataPrivacyPage.backBtn

    document.addEventListener('DOMContentLoaded', function() {
        window.MatomoConsent.init(settings.useSecureCookies, settings.cookiePath, settings.cookieDomain, settings.cookieSameSite);
        showContent(window.MatomoConsent.hasConsent(), settings);
    });

}

function setupMatomo(){
    window.MatomoConsent = {
        cookiesDisabled: (!navigator || !navigator.cookieEnabled),
        CONSENT_COOKIE_NAME: 'mtm_consent', CONSENT_REMOVED_COOKIE_NAME: 'mtm_consent_removed',
        cookieIsSecure: false, useSecureCookies: true, cookiePath: '', cookieDomain: '', cookieSameSite: 'Lax',
        init: function(useSecureCookies, cookiePath, cookieDomain, cookieSameSite) {
            this.useSecureCookies = useSecureCookies; this.cookiePath = cookiePath;
            this.cookieDomain = cookieDomain; this.cookieSameSite = cookieSameSite;
            if(useSecureCookies && location.protocol !== 'https:') {
                console.log('Error with setting useSecureCookies: You cannot use this option on http.');
            } else {
                this.cookieIsSecure = useSecureCookies;
            }
        },
        hasConsent: function() {
            var consentCookie = this.getCookie(this.CONSENT_COOKIE_NAME);
            var removedCookie = this.getCookie(this.CONSENT_REMOVED_COOKIE_NAME);
            if (!consentCookie && !removedCookie) {
                return true; // No cookies set, so opted in
            }
            if (removedCookie && consentCookie) {
                this.setCookie(this.CONSENT_COOKIE_NAME, '', -129600000);
                return false;
            }
            return (consentCookie || consentCookie !== 0);
        },
        consentGiven: function() {
            this.setCookie(this.CONSENT_REMOVED_COOKIE_NAME, '', -129600000);
            this.setCookie(this.CONSENT_COOKIE_NAME, new Date().getTime(), 946080000000);
        },
        consentRevoked: function() {
            this.setCookie(this.CONSENT_COOKIE_NAME, '', -129600000);
            this.setCookie(this.CONSENT_REMOVED_COOKIE_NAME, new Date().getTime(), 946080000000);
        },
        getCookie: function(cookieName) {
            var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'), cookieMatch = cookiePattern.exec(document.cookie);
            return cookieMatch ? window.decodeURIComponent(cookieMatch[2]) : 0;
        },
        setCookie: function(cookieName, value, msToExpire) {
            var expiryDate = new Date();
            expiryDate.setTime((new Date().getTime()) + msToExpire);
            document.cookie = cookieName + '=' + window.encodeURIComponent(value) +
                (msToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
                ';path=' + (this.cookiePath || '/') +
                (this.cookieDomain ? ';domain=' + this.cookieDomain : '') +
                (this.cookieIsSecure ? ';secure' : '') +
                ';SameSite=' + this.cookieSameSite;
            if ((!msToExpire || msToExpire >= 0) && this.getCookie(cookieName) !== String(value)) {
                console.log('There was an error setting cookie `' + cookieName + '`. Please check domain and path.');
            }
        }
    };
}


function showContent(consent, settings, errorMessage = null, useTracker = false) {

    let errorBlock = '<p style="color: red; font-weight: bold;">';

    let div = document.getElementById(settings.divId);
    if (!div) {
        const warningDiv = document.createElement("div");
        let msg = 'Unable to find opt-out content div: "'+settings.divId+'"';
        warningDiv.id = settings.divId+'-warning';
        warningDiv.innerHTML = errorBlock+msg+'</p>';
        document.body.insertBefore(warningDiv, document.body.firstChild);
        console.log(msg);
        return;
    }

    if (!navigator || !navigator.cookieEnabled) {
        div.innerHTML = errorBlock+settings.OptOutErrorNoCookies+'</p>';
        return;
    }
    if (location.protocol !== 'https:') {
        div.innerHTML = errorBlock+settings.OptOutErrorNotHttps+'</p>';
        return;
    }
    if (errorMessage !== null) {
        div.innerHTML = errorBlock+errorMessage+'</p>';
        return;
    }
    let content = '';
    if (consent) {
        if (settings.showIntro) {
            content += '<p>'+settings.YouMayOptOut2+' '+settings.YouMayOptOut3+'</p>';
        }
        if (useTracker) {
            content += '<input onclick="_paq.push([\'optUserOut\']);showContent(false, null, true);" id="trackVisits" type="checkbox" checked="checked" />';
        } else {
            content += '<input onclick="window.MatomoConsent.consentRevoked();showContent(false);" id="trackVisits" type="checkbox" checked="checked" />';
        }
        content += '<label for="trackVisits"><strong><span>'+settings.YouAreNotOptedOut+' '+settings.UncheckToOptOut+'</span></strong></label>';
    } else {
        if (settings.showIntro) {
            content += '<p>'+settings.OptOutComplete+' '+settings.OptOutCompleteBis+'</p>';
        }
        if (useTracker) {
            content += '<input onclick="_paq.push([\'forgetUserOptOut\']);showContent(true, null, true);" id="trackVisits" type="checkbox" />';
        } else {
            content += '<input onclick="window.MatomoConsent.consentGiven();showContent(true);" id="trackVisits" type="checkbox" />';
        }
        content += '<label for="trackVisits"><strong><span>'+settings.YouAreOptedOut+' '+settings.CheckToOptIn+'</span></strong></label>';
    }
    div.innerHTML = content;
}