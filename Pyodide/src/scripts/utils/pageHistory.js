/**
 * Intercepts the browsers navigation (forward and back) to further imitate page like behavior on our single page web page
 */
class PageHistory {
	/** @type {Array<Page>} */
	#stack = [];
	/** @type {Page} */
	popped;
	#index= -1;
	/** @type {PageHistory} */
	static instance;

	constructor() {

		if (PageHistory.instance) {
			return PageHistory.instance;
		}
		PageHistory.instance = this;
		// no need, because first element upon initialisation is undefined
		window.addEventListener("popstate",this.browserNavigation.bind(this))
		return this;
	}

	lastPage() {
		if (this.#index <= 0 ) {
			window.history.back();
			return pageManager.pages.landingPage;
		}
		this.#index--;
		// console.log(this.#index)
		return this.#stack[this.#index];
		// this.popped = this.#stack.pop();
		// return this.popped;


	}

	nextPage() {
		this.#index++;
		// console.log(this.#index)
		return this.#stack[this.#index];
	}

    currentPage(){
        return this.#stack[this.#index];
    }

	browserNavigation(event){
		/** @type {Page} */
		let nextPage = null;
		// console.log("navigation event detected", this.#index, this.#stack[this.#index].id);
		if (this.#index <= 0){
			// index 1 does not exist -> navigate back (can only be a back action)
			if (this.stack.length === 1 || !event.state){
				// console.log("back event detected on oldest and first page", this.#index, this.#stack[this.#index].id);
				nextPage = this.lastPage();
			}
			else{
				let eventPageDiv = event.state.id
				// index one exists, check if id of index 1 is eaqual to event.state.id -> forward navigation
				let nextPageDiv = this.#stack[this.#index+1].id;
				if (eventPageDiv===nextPageDiv){
					// console.log("forward event detected on oldest page", this.#index, this.#stack[this.#index].id)
					nextPage = this.nextPage();
				}
				// else back navigation
				else {
					// console.log("back event detected on oldest page", this.#index, this.#stack[this.#index].id);
					nextPage = this.lastPage();
				}
			}

			pageManager.changePage(nextPage, false, false);
			return;
		}

		let lastPageDiv = this.#stack[this.#index-1].id;
		if (event.state === null) return

		let eventPageDiv = event.state.id
		if (eventPageDiv === lastPageDiv){
			// console.log("back event detected", this.#index, this.#stack[this.#index].id);
			nextPage = this.lastPage();
			pageManager.changePage(nextPage, false, false);
		}
		else {
			// console.log("forward event detected", this.#index, this.#stack[this.#index].id);
			nextPage = this.nextPage();
			pageManager.changePage(nextPage, false, false);
		}

	}

	navigateBack(event){
		pageManager.changePage(this.lastPage(), false, false)
		// console.log(event.state.id)

	}

	#resetHistory(){
			let delStart = this.index;
			let delCount= this.stack.length-(this.index);
			this.#stack.splice(delStart, delCount);
	}

	/**
	 *  @param latestPage {Page}
	 */
	pushPage(latestPage) {
		let nextPageDiv = this.#stack[this.#index+1];
		if (latestPage === pageManager.pages.loadingPage || latestPage === pageManager.pages.navigation) return;
		// Necessary to differentiate between latest page and the latest popped page -> no double entry in array
		if (this.#stack[this.#index] === latestPage) return;

		// List should not be longer than 90 entries
		if (this.#stack.length<90) {
			this.#index++;
			if(latestPage !== nextPageDiv) this.#resetHistory();
			this.#stack.push(latestPage);
			// console.log(this.#index);
		}
		else{
			this.#resetHistory(latestPage !== nextPageDiv)
			this.#stack.splice(0,1);
			this.#stack.push(latestPage);
		}
		window.history.pushState({id: latestPage.id},``,window.location)

        console.log("Navigation History: [" + this.#stack.map(p => p.constructor.name).join(", ") + "]")
	}

	get stack(){
		return this.#stack
	}

	get index(){
		return this.#index;
	}

}
