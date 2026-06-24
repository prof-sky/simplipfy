class PageHistoryStack{
	/** @type {Array<{id: number, page: Page}>} */
	#pages= [];

	/** @type {number} */
	#index= -1; //necessary as start index so when the first page is added it is at 0

	/** @type {number} */
	#historyLimit;

	#pushEventId = 0;


	get currentIndex(){
		return this.#index;
	}

	get current(){
		return this.#pages[this.#index];
	}

	get currentId(){
		return this.#pages[this.#index].id;
	}

	get currentPage(){
		return this.#pages[this.#index].page;
	}

	get length(){
		return this.#pages.length;
	}

	get hasNextIndex(){
		return this.#index < this.length - 1;
	}

	get hasLastIndex(){
		return this.#index > 0;
	}

	/** @param {number} index */
	at(index){
		if (index <= this.#pages.length - 1) return this.#pages[index];
		else return {id: undefined, page: undefined};
	}

	moveIndexForward(){
		if (this.#index < this.#pages.length - 1) this.#index++;
		else {
			console.warn("history index not moved, index exceeds array entries");
		}
	}

	moveIndexBack(){
		if (this.#index > 0) this.#index--;
		else{
			console.warn("history index not moved, index must be greater than or equal to 0");
		}
	}

	/** @param {Page} page */
	push(page){
		if (this.#index === this.#historyLimit - 1) this.#pages.splice(0, 1);

		const pushId = this.#pushEventId
		this.#pages.push({id: pushId, page: page});
		this.moveIndexForward();
		this.#pushEventId++;

		history.pushState({id: pushId},``, window.location.href);
	}

	forgetAfter(index){
		if (this.#index > index) this.#index = index;
		this.#pages.splice(index + 1, this.#pages.length);
	}

	constructor(firstPage, historyLimit = 3){
		this.#historyLimit = historyLimit;
		this.push(firstPage);
	}

	logToConsole(){
		console.log("Navigation History: [" + this.#pages.map(p => p.page.constructor.name).join(", ") + "]")
	}

	get navigationsOutsideOfStackSize(){
		// it should be:
		// this.#pushEventId + 1 - this.lenght (because pushEventId starts at 0)
		// but initial pushEvent is treated as replaceState -> one less
		if (this.#pushEventId <= this.#historyLimit) return 0;
		return this.#pushEventId - this.length
	}
}

/**
 * Intercepts the browsers navigation (forward and back) to further imitate page like behavior on our single page web page
 */
class PageHistory {
	/** @type {PageHistoryStack} */
	#stack;

	/** @type {PageHistory} */
	static instance;

	/** @type {Array<Page>} */
	blockedPages = [pageManager.pages.loadingPage, pageManager.pages.loadingPyodidePage, pageManager.pages.navigation];

	constructor(firstPage, historyLimit = 60) {

		if (PageHistory.instance) {
			return PageHistory.instance;
		}
		PageHistory.instance = this;
		this.#stack = new PageHistoryStack(firstPage, historyLimit);
		window.addEventListener("popstate",this.browserNavigation.bind(this))

		return this;
	}

	lastPage() {
		this.#stack.moveIndexBack();
		return this.#stack.currentPage;
	}

	nextPage() {
		this.#stack.moveIndexForward();
		return this.#stack.currentPage;
	}

    currentPage(){
        return this.#stack.currentPage;
    }

	async browserNavigation(event){
		if (this.#stack.currentIndex === 0 && this.#stack.length === 1) {
			console.log("No navigation History, assume back navigation to page before simplipfy");
			history.back();
			return;
		}

		const eventId = event.state?.id;
		if(eventId === undefined || eventId === null) {
			console.log("No state in event, assume back navigation to page before simplipfy");
			history.back();
			return;
		}


		const isBackEvent = this.#isBackEvent(eventId);
		const isForwardEvent = this.#isForwardEvent(eventId);

		// browser history may be longer than stack size limit. It would get valid ids from previous pages but not change
		// pages anymore because the stack would always return page at position 0. Avoid this by going back until the
		// page is not executed anymore -> left the page
		if(this.#stack.currentIndex === 0 && isBackEvent){
			history.go((this.#stack.navigationsOutsideOfStackSize) * -1);
			return;
		}

		/** @type {Page | null} */
		let navigateTo = null;

		if (isForwardEvent) navigateTo = this.nextPage()
		else if (isBackEvent) navigateTo = this.lastPage();

		if (!navigateTo){
			console.warn("Could not figure out navigation direction, going to LandingPage")
			navigateTo = pageManager.pages.landingPage;
		}

		pageManager.changePage(navigateTo, false, false);
	}


	/** @param id {number} */
	#isForwardEvent(id){
		return this.#stack.currentId < id;
	}

	/** @param id {number} */
	#isBackEvent(id){
		return this.#stack.currentId > id;
	}

	navigateBack(event){
		pageManager.changePage(this.lastPage(), false, false)
	}

	/**
	 *  @param newPage {Page}
	 */
	pushPage(newPage) {
		if (this.blockedPages.includes(newPage)) return;

		// Necessary to differentiate between latest page and the latest popped page -> no double entry in array
		const isCurrentPageInHistory = this.#stack.currentPage === newPage
		if (isCurrentPageInHistory) return;

		const hasNextPage = this.#stack.hasNextIndex;
		const nextPageInHistory = this.#stack.at(this.#stack.currentIndex+1).page;
		const isNextPageInHistory = newPage === nextPageInHistory;

		if (hasNextPage && !isNextPageInHistory) this.#stack.forgetAfter(this.#stack.currentIndex);

		this.#stack.push(newPage);

        this.#stack.logToConsole()
	}
}
