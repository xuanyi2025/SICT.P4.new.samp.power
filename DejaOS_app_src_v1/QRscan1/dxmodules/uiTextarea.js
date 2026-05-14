//build: 20240330
//Textarea control
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let textarea = {}

textarea.build = function (id, parent) {
    let temp = utils.validateBuild(textarea.all, id, parent, 'textarea')
    let my = {type: 'textarea'}
    my.obj = new utils.GG.NativeTextarea({ uid: id }, temp)
    my.id = id
    /**
     * Set single line mode, cannot wrap
     * @param {boolean} en true/false
     */
    my.setOneLine = function (en) {
        this.obj.lvTextareaSetOneLine(en)
    }
    /**
     * Set password mode, content displays as · symbol
     * @param {boolean} en true/false
     */
    my.setPasswordMode = function (en) {
        this.obj.lvTextareaSetPasswordMode(en)
    }
    /**
     * Set content alignment, center, left, right, etc.
     * @param {number} align Alignment enum
     */
    my.setAlign = function (align) {
        this.obj.lvTextareaSetAlign(align)
    }
    /**
     * Set maximum content length, character count limit
     * @param {number} length Length
     */
    my.setMaxLength = function (length) {
        this.obj.lvTextareaSetMaxLength(length)
    }
    /**
     * Set whether to enable cursor positioning, whether to display |
     * @param {boolean} en true/false
     */
    my.setCursorClickPos = function (en) {
        this.obj.lvTextareaSetCursorClickPos(en)
    }
    /**
     * Insert text at current cursor position
     * @param {string} txt Text content
     */
    my.lvTextareaAddText = function (txt) {
        this.obj.lvTextareaAddText(txt)
    }
    /**
     * Delete character to the left of current cursor position
     */
    my.lvTextareaDelChar = function () {
        this.obj.lvTextareaDelChar()
    }
    /**
     * Get/set text content
     * @param {string} text Set text content
     * @returns Get text content
     */
    my.text = function (text) {
        if (text == null || text == undefined) {
            return this.obj.lvTextareaGetText()
        } else {
            this.obj.lvTextareaSetText(text)
        }
    }
    let comp = Object.assign(my, base);
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default textarea;