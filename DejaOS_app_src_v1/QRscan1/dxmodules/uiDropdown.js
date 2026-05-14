//build: 20240329
//Dropdown control
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let dropdown = {}

dropdown.build = function (id, parent) {
    let temp = utils.validateBuild(dropdown.all, id, parent, 'dropdown')
    let my = {type: 'dropdown'}
    my.obj = new utils.GG.NativeDropdown({ uid: id }, temp)
    my.id = id
    /**
     * Set dropdown option content
     * @param {array} arr Option content, a string array where each item is an option
     */
    my.setOptions = function (arr) {
        this.obj.setOptions(arr.join('\n'))
    }
    /**
     * Get dropdown option list
     * @returns Returns list object, a base class object that can have its font set separately
     */
    my.getList = function () {
        let res = {}
        res.obj = this.obj.getList()
        return Object.assign(res, base)
    }
    /**
     * Set selected item, this will be selected by default
     * @param {number} index Selected item index
     */
    my.setSelected = function (index) {
        this.obj.setSelected(index)
    }
    /**
     * Get selected item index
     * @returns Returns the currently selected index
     */
    my.getSelected = function () {
        return this.obj.getSelected()
    }
    /**
     * Set dropdown accessory icon, default is a downward arrow
     * @param {string} icon Icon address
     */
    my.setSymbol = function (icon) {
        this.obj.setSymbol(icon)
    }
    let comp = Object.assign(my, base);
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default dropdown;