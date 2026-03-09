class News extends Content{
    constructor() {
        let idLangMap = new Map([
            ["news-heading", () => languageManager.currentLang.newsPage.newsHeading]
        ])
        super(idLangMap, "about-page-news");
    }

    get html(){
        return `
        <div id="about-page-news" class="container-fluid pb-5 mb-5" style="max-width: 600px;">
            <h1 style="color: #ffc107" id="news-heading" class="mt-5">${languageManager.currentLang.newsPage.newsHeading}</h1>
        </div>
        `;
    }

    setup() {
        const newsText = document.createElement("div");
        newsText.id = "news-text";
        newsText.innerHTML = "";

        let table = document.createElement("table");
        table.classList.add("table");
        table.classList.add("table-dark");

        let tbody = document.createElement("tbody");
        for (let [i, news] of languageManager.currentLang.newsPage.newsList.entries()) {
            let date = news.date;
            let dateId = `news-date-${i}`;
            let feature = news.text;
            let featureId = `news-feature-${i}`;

            let tr = document.createElement("tr");
            let tdDate = document.createElement("td");
            tdDate.innerHTML = date;
            tdDate.id = dateId;
            tdDate.style.whiteSpace = "nowrap";
            tdDate.style.textAlign = "left";
            tdDate.style.verticalAlign = "top";
            let tdFeature = document.createElement("td");
            tdFeature.innerHTML = feature;
            tdFeature.id = featureId;
            tdFeature.style.textAlign = "left";
            tdFeature.style.verticalAlign = "top";
            tdFeature.style.whiteSpace = "pre-wrap"; // allows \n in text
            tr.appendChild(tdDate);
            tr.appendChild(tdFeature);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        newsText.appendChild(table);

        let template = document.createElement("template");
        template.innerHTML = this.html.trim();

        const news = template.content.firstElementChild;
        news.appendChild(newsText);

        return news;
    }

    updateLang() {
        super.updateLang();

        for (let [i, news] of languageManager.currentLang.newsPage.newsList.entries()) {
            let date = news.date;
            let feature = news.text;

            let tdDate = document.getElementById(`news-date-${i}`);
            let tdFeature = document.getElementById(`news-feature-${i}`);
            tdDate.innerHTML = date;
            tdFeature.innerHTML = feature;
        }
    }

    updateColor() {
        /** @type {HTMLElement} */
        let heading = document.getElementById("news-heading");
        heading.style.color = colors.current.headingForeground;
        heading.style.background = colors.current.bsBackground;

        /** @type {HTMLTableElement} */
        const table = document.getElementById(this.mainID).querySelector(".table");
        updateBsClassesTo(colors.current.bsColorScheme, "table", table);
    }

    addEventListeners() {

    }

    afterPyodideLoaded() {

    }

}