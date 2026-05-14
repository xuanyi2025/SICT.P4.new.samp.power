//build: 20240329
//Slider component
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let slider = {}

slider.build = function (id, parent) {
    let temp = utils.validateBuild(slider.all, id, parent, 'slider')
    let my = {type: 'slider'}
    my.obj = new utils.GG.NativeSlider({ uid: id }, temp)
    my.id = id

    /**
     * Get/set value
     * @param {number} v Set value
     * @param {boolean} en Whether to enable animation when setting value, i.e. easing effect
     * @returns Get value
     */
    my.value = function (v, en) {
        if (v == null || v == undefined) {
            return this.obj.lvSliderGetValue()
        } else {
            if (!utils.validateNumber(en)) {
                en = false
            }
            this.obj.lvSliderSetValue(v, en)
        }
    }
    /**
     * Set range
     * @param {number} min Minimum value
     * @param {number} max Maximum value
     */
    my.range = function (min, max) {
        this.obj.lvSliderSetRange(min, max)
    }

    let comp = Object.assign(my, base);
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default slider;