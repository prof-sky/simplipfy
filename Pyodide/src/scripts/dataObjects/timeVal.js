class TimeVal{
    /**
     * [bar description]
     * @param value {number} value of time in ms
     * @return {TimeVal} class that handles time conversions
     */
    constructor(value) {
        this.value = value;
    }

    inSeconds(roundToDigits = 1){
        return (this.value / 1000).toFixed(roundToDigits)
    }

    inMilliSeconds(val){
        return this.value
    }

    valueOf() {
        return this.value
    }

    ms(){
        return this.value
    }
}