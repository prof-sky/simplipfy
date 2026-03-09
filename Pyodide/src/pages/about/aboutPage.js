/**
 * Displays news and some information about the project
 * @extends Page
 */
class AboutPage extends Page{
    constructor() {
        let content = {
            about: new About(),
            news: new News(),
        }
        // <pageName>-page-container (id of div on index.htlm)
        super(content, "about-page-container", "AboutPage");
    }

    setup() {
        if (!super.beforeSetup()) return;
        let page = document.getElementById(this.id)

        page.appendChild(this.content.about.setup());
        page.appendChild(this.content.news.setup());

        super.afterSetup();
    }
}