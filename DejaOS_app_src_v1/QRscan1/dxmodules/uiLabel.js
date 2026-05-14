//build: 20240311
//Label component
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let label = {}

label.build = function (id, parent) {
    let temp = utils.validateBuild(label.all, id, parent, 'label')
    let my = {type: 'label'}
    my.obj = new utils.GG.NativeLabel({ uid: id }, temp)
    my.id = id
    /**
     * Set or get the label text content
     * @param {string} t Optional, if not provided or not a string type, it will get the text
     */
    my.text = function (t) {
        if (utils.validateString(t)) {
            this.obj.lvLabelSetText(t)
        } else {
            return this.obj.lvLabelGetText()
        }
    }
    /**
     * Set the display mode when text is too long, such as scrolling, truncating, etc.
     * @param {number} mode Enum reference utils.LABEL_LONG_MODE
     */
    my.longMode = function (mode) {
        this.obj.lvLabelSetLongMode(mode)
    }
    let comp = Object.assign(my, base);
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default label;