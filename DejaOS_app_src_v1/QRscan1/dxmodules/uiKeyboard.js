//build: 20240329
//Keyboard control
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let keyboard = {}

keyboard.build = function (id, parent) {
    let temp = utils.validateBuild(keyboard.all, id, parent, 'keyboard')
    let my = {type: 'keyboard'}
    my.obj = new utils.GG.NativeKeyboard({ uid: id }, temp)

    // Pinyin input method will get a new object, bound to the current keyboard, to enhance keyboard functionality such as 9-key, etc. Users don't need to care about this, just operate the initially created keyboard object
    let pinyin = {}
    pinyin.obj = my.obj.lvImePinyinCreate()
    my.obj.lvImePinyinSetKeyboard(pinyin.obj)
    my["__obj"] = Object.assign(pinyin, base)
    my.__mode = "K26"

    my.id = id
    /**
     * Set associated text box, keyboard output will be displayed here
     * @param {object} textarea Text box control object
     */
    my.setTextarea = function (textarea) {
        this.obj.lvKeyboardSetTextarea(textarea.obj)
        my.textarea = textarea
    }
    /**
     * Set/get mode, pure numeric keyboard or other modes
     * @param {any} mode Mode, refer to enum
     * @returns Returns current mode
     */
    my.mode = function (mode) {
        if (!mode) {
            return my.__mode
        }
        if (mode == "K26" || mode == "K9") {
            this.obj.lvImePinyinSetMode(my["__obj"].obj, mode == "K26" ? 0 : 1)
        } else {
            if (mode == utils.KEYBOARD.NUMBER) {
                this.obj.lvImePinyinSetMode(my["__obj"].obj, 2)
            }
            this.obj.lvKeyboardSetMode(mode)
        }
        my.__mode = mode
    }
    /**
     * Set pinyin font, different from keyboard, this sets the candidate character font
     * @param {object} font Font object returned by font.js build
     * @param {number} type Refer to utils.STYLE Optional, defaults to binding with the object itself
     */
    my.chFont = function (font, type) {
        if (!utils.validateNumber(type)) {
            type = 0
        }
        if (!font || !font.obj) {
            throw new Error("dxui.textFont: 'font' parameter should not be null")
        }
        my.obj.lvImePinyinGetCandPanel(my["__obj"].obj).lvObjSetStyleTextFont(font.obj, type)
    }
    /**
     * Display button title in popup window when pressed, i.e., auxiliary display upper frame
     * @param {boolean} en true/false
     */
    my.setPopovers = function (en) {
        this.obj.lvKeyboardSetPopovers(en)
    }
    /**
     * Set dictionary
     * @param {object} dict Dictionary, format like: {"a": "啊", "ai": "爱",...,"zu":"组"}, all 26 letters must be present, write "" if no candidate characters
     * @returns
     */
    my.dict = function (dict) {
        if (!dict) {
            return my.obj.lvImePinyinGetDict(my["__obj"].obj)
        } else {
            my.obj.lvImePinyinSetDict(my["__obj"].obj, dict)
        }
    }
    let comp = Object.assign(my, base);
    // Override methods
    // Keep original methods
    const super_hide = my.hide;
    const super_show = my.show;
    my.hide = function () {
        super_hide.call(this)
        my.obj.lvImePinyinGetCandPanel(my["__obj"].obj).lvObjAddFlag(1);
        if (my.textarea.text() && my.textarea.text().length > 0) {
            my.obj.lvImePinyinClearData(my["__obj"].obj)
        }
    }
    my.show = function () {
        super_show.call(this)
        if (my.obj.lvImePinyinGetCandNum(my["__obj"].obj) > 0) {
            my.obj.lvImePinyinGetCandPanel(my["__obj"].obj).lvObjClearFlag(1);
        }
        my.obj.lvImePinyinGetCandPanel(my["__obj"].obj).lvObjAlignTo(my.obj, utils.ALIGN.OUT_TOP_MID, 0, 0)
    }
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default keyboard;