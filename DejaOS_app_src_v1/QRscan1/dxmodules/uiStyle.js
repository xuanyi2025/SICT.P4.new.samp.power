//build: 20240315
//Control style - Each control can bind a style object and set multiple styles
import utils from "./uiUtils.js"

let style = {}
style.build = function () {
    let comp = {}
    comp.obj = new utils.GG.NativeStyle()
    comp.obj.lvStyleInit()
    /**
     * Set all padding (left, right, top, bottom) to one value
     * @param {number} pad Padding value
     */
    comp.padAll = function (pad) {
        this.obj.lvStyleSetPadAll(pad)
    }
    /**
     * Set right padding to one value
     * @param {number} pad Padding value
     */
    comp.padRight = function (pad) {
        this.obj.lvStyleSetPadRight(pad)
    }
    /**
     * Set left padding to one value
     * @param {number} pad Padding value
     */
    comp.padLeft = function (pad) {
        this.obj.lvStyleSetPadLeft(pad)
    }
    /**
     * Set top padding to one value
     * @param {number} pad Padding value
     */
    comp.padTop = function (pad) {
        this.obj.lvStyleSetPadTop(pad)
    }
    /**
     * Set bottom padding to one value
     * @param {number} pad Padding value
     */
    comp.padBottom = function (pad) {
        this.obj.lvStyleSetPadBottom(pad)
    }
    /**
     * Set padding between columns to one value
     * @param {number} pad Padding value
     */
    comp.padColumn = function (pad) {
        this.obj.lvStyleSetPadColumn(pad)
    }
    /**
     * Set padding between rows to one value
     * @param {number} pad Padding value
     */
    comp.padRow = function (pad) {
        this.obj.lvStyleSetPadRow(pad)
    }
    /**
     * Set border width
     * @param {number} w
     */
    comp.borderWidth = function (w) {
        this.obj.lvStyleSetBorderWidth(w)
    }
    /**
     * Set border radius
     * @param {number} r
     */
    comp.radius = function (r) {
        this.obj.lvStyleSetRadius(r)
    }
    /**
     * Set background opacity, value range is 0-100, smaller value is more transparent
     * @param {number} opa Must be 0-100
     */
    comp.bgOpa = function (opa) {
        this.obj.lvStyleSetBgOpa(utils.OPA_MAPPING(opa))
    }
    /**
     * Set self opacity, value range is 0-100, smaller value is more transparent
     * @param {number} opa Must be 0-100
     */
    comp.opa = function (opa) {
        this.obj.lvStyleSetOpa(utils.OPA_MAPPING(opa))
    }
    /**
     * Set background color
     * @param {any} color Supports number type: e.g. 0x34ffaa; string type (starting with #), e.g.: '#34ffaa'
     */
    comp.bgColor = function (color) {
        this.obj.lvStyleSetBgColor(utils.colorParse(color))
    }
    /**
     * Set text color
     * @param {any} color Supports number type: e.g. 0x34ffaa; string type (starting with #), e.g.: '#34ffaa'
     */
    comp.textColor = function (color) {
        this.obj.lvStyleSetTextColor(utils.colorParse(color))
    }
    /**
     * Set text alignment
     * @param {number} type Refer to utils.TEXT_ALIGN
     */
    comp.textAlign = function (type) {
        this.obj.lvStyleSetTextAlign(type)
    }
    /**
     * Set text font
     * @param {object} font Font object returned by font.js build
     */
    comp.textFont = function (font) {
        if (!font || !font.obj) {
            throw new Error("style.textFont: 'font' parameter should not be null")
        }
        this.obj.lvStyleSetTextFont(font.obj)
    }
    /**
     * Set gradient color
     * @param {number} color Gradient color, e.g.: 0xffffff
     */
    comp.bgGradColor = function (color) {
        this.obj.lvStyleSetBgGradColor(color)
    }
    /**
     * Set gradient color direction
     * @param {number} dir Direction, currently only supports horizontal and vertical
     */
    comp.bgGradDir = function (dir) {
        this.obj.lvStyleSetBgGradDir(dir)
    }
    /**
     * Background color end position (0-255)
     * @param {number} value Distance, calculated from the left end
     */
    comp.bgMainStop = function (value) {
        this.obj.lvStyleSetBgMainStop(value)
    }
    /**
     * Gradient color distance (0-255)
     * @param {number} value Distance, calculated from the end position of the background color
     */
    comp.bgGradStop = function (value) {
        this.obj.lvStyleSetBgGradStop(value)
    }
    return comp;
}

export default style;