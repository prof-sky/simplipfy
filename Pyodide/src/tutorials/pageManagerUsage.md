# Idea
Since this application uses pyodide, page switches with different html files would not work (pyodide would need to)
be reloaded). Therefore, the approach is to create different <div> containers that act as different pages.
For this, the pagemanager sets up the different pages (container) and handles the switching between them.

# Create new pages

To create a new page, you need to add a new ```<div>``` container in the index.html file.
For example, if you want to create a new page called "newPage", you would add the following code in index.html:
```html
<div class="container-fluid m-0 p-0 text-center justify-content-center bg-dark" id="new-page-container"></div>
```
Then you need to add the file inside the pagemanager constructor. Create a new variable for the page and add it to the pages array.
Write your functions to setup and show your new page. 

```js
constructor() {
        this.landingPage = document.getElementById("landing-page-container");
        this.selectPage = document.getElementById("select-page-container");
        this.newPage = document.getElementById("new-page-container");

        this.pages = [
            this.landingPage, this.selectPage, this.newPage]
    }
```
To show your new page, you could do something like this:
```js
showNewPage() {
    this._showPage(this.newPage);
    this.enableSettings();
    pushPageViewMatomo("New Page");
    scrollBodyToTop();
}
```
To allow the dark/light mode switch and languages to work correctly, you should also adapt the following functions:
- updateAvailableBsClassesTo() in darkModeFunctions.js
- changeToDarkMode() in darkModeFunctions.js
- updatesLanguageFields() in languageManager.js

If you want your page to be shown inside the navigation, you need to adapt the navigation inside index.html.
Add another link inside the navbar like this:
```html
<li class="nav-item">
    <a class="nav-link m-0 p-0" id="nav-new-page"></a>
</li>``` 
```

Then adapt 
- updateNavigation() in languageManager.js and 
- setupNavigation() in the pageManager.js file.
