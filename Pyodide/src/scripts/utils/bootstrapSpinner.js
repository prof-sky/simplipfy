class BootstrapSpinner {
    static get innerHtml(){
        return `<div class="spinner-border text-warning" role="status" style="">
                    <span class="sr-only">Loading...</span>
                </div>`
    }

    /**
     *
     * @param id the id the spinner element gets
     * @returns {HTMLDivElement}
     */
    static create(id){
        const spinner = document.createElement('div');
        spinner.id = id;
        spinner.style.position = 'absolute';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';

        spinner.innerHTML = BootstrapSpinner.innerHtml;

        return spinner;
    }
}