/**
 * Encapsulates the values used in the speed mode. Used on {@link SettingsPage} in {@link SpeedMode}.
 */
class SliderValues{
    /**
     * [bar description]
     * @param  {number} value in ms
     * @param  {number} minVal in ms
     * @param  {number} maxVal in ms
     * @param  {number} stepSize in ms
     * @return {SliderValues} returns an object that unifies a value, upper- and lower limit and a step size
     */
    constructor(value, minVal, maxVal, stepSize, digits=1) {
        this.value = new TimeVal(value);
        this.minVal = new TimeVal(minVal);
        this.maxVal = new TimeVal(maxVal);
        this.stepSize = new TimeVal(stepSize);
        this.digits = digits;
    }

    inRange(val){
        if (val >= this.minVal && val <= this.maxVal){
            return true;
        }
        else{
            return false
        }
    }

    /**
     * [bar description]
     * @param  {number} val
     * @return {number} val ronuded to nearest step
     */
    roundToStep(val){
        throw ErrorEvent("Not implemented");
    }
}