/**
 * Base class to manage writing and reading to and from the local storage of the browser. The concept is to write and
 * read info from a key, each class has a fixed key. This avoids knowing the key and misspelling it and creating multiple
 * instances in the local storage. Read and writes are implemented in this class. The information is processed and managed
 * by the child class. Creating instances of LocalStorageWriter makes no sense. Derive from it if you want to save
 * some value to the local storage of the browser.
 * @abstract
 */
class LocalStorageWriter{
     /**
     * @param key {string} a value from the list localStorageKeys
     */
    constructor(key) {
        this.key = key;
    }

    /**
     * write a value with to the local storage of the browser with the class specific key (this.key)
     * @param value {string} string to write to the local storage of the browser
     */
    _set(value){
        localStorage.setItem(this.key, value)
    }

    /**
     * @returns {Array<boolean | string>} [success, value], success true if value was in storage and read, value is the read string
     */
    _get(){
        let val = localStorage.getItem(this.key)

        if (val === null || val === undefined){
            return [false, ""]
        }

        return [true, val]
    }

    /**
     * direct access to the local storage of the browser, try to avoid this method
     * @param item {string} the key to read from
     * @returns {Array<boolean, string>} [success, result] success true if read was successfully and result is the string
     * read from the local storage of the browser
     * @private
     */
    _universalGet(item){
        let result = localStorage.getItem(item)
        if (result === null || result === undefined){
            return [false, ""]
        }
        return [true, result]
    }

    /**
     * direct access to the local storage of the browser, try to avoid this method
     * @param item {string} the key to remove
     * @private
     */
    _universalRemove(item){
        localStorage.removeItem(item)
    }

    /**
     *
     * @returns {number} returns 1 if key was not found, returns 0 if key was deleted
     */
    _delete(){
        let [isKey, val] = this._get()

        if (isKey){
            localStorage.removeItem(this.key)
            return 0
        }

        return 1
    }
}