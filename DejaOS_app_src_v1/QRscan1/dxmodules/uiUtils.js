//build: 20240315
//Common functions, constants, enums, etc.
import { uiClass } from '../dxmodules/libvbar-m-dxui.so'
import logger from './dxLogger.js'
import dxDriver from './dxDriver.js'
const ui = new uiClass();
// Initialize UI component
ui.init(dxDriver.HAL.DISPLAY.HAL_WIDTH, dxDriver.HAL.DISPLAY.HAL_HEIGHT, dxDriver.HAL.DISPLAY.HAL_DPI, dxDriver.HAL.DISPLAY.HAL_ROTATION)

let utils = {}
utils.GG = NativeObject.APP.NativeComponents
utils.ENUM = utils.GG.NativeEnum
utils.LAYER = {
    "MAIN": 0,
    "SYS": 1,
    "TOP": 2
}
utils.EVENT = {
    "CLICK": 7,
    "LONG_PRESSED": 5,
    "SHORT_PRESSED": 4,
    "PRESSING": utils.ENUM.LV_EVENT_PRESSING,
    "FOCUSED": utils.ENUM.LV_EVENT_FOCUSED,
    "DEFOCUSED": utils.ENUM.LV_EVENT_DEFOCUSED,
    "VALUE_CHANGED": utils.ENUM.LV_EVENT_VALUE_CHANGED,
    "INSERT": utils.ENUM.LV_EVENT_INSERT,
    "REFRESH": utils.ENUM.LV_EVENT_REFRESH,
    "READY": utils.ENUM.LV_EVENT_READY,
    "CANCEL": utils.ENUM.LV_EVENT_CANCEL,
}
utils.TEXT_ALIGN = {
    "AUTO": 0,
    "LEFT": 1,
    "CENTER": 2,
    "RIGHT": 3
}
utils.STATE = {
    "DEFAULT": utils.ENUM.LV_STATE_DEFAULT,
    "CHECKED": utils.ENUM.LV_STATE_CHECKED,
    "FOCUSED": utils.ENUM.LV_STATE_FOCUSED,
    "FOCUS_KEY": utils.ENUM.LV_STATE_FOCUS_KEY,
    "EDITED": utils.ENUM.LV_STATE_EDITED,
    "HOVERED": utils.ENUM.LV_STATE_HOVERED,
    "PRESSED": utils.ENUM.LV_STATE_PRESSED,
    "SCROLLED": utils.ENUM.LV_STATE_SCROLLED,
    "DISABLED": utils.ENUM.LV_STATE_DISABLED,
}
utils.OBJ_FLAG = {
    "CLICKABLE": utils.ENUM.LV_OBJ_FLAG_CLICKABLE,
}
utils.ALIGN = {//Position relative to reference object, those with OUT are outside the reference object's boundary
    "OUT_TOP_LEFT": utils.ENUM.LV_ALIGN_OUT_TOP_LEFT,
    "OUT_TOP_MID": utils.ENUM.LV_ALIGN_OUT_TOP_MID,
    "OUT_TOP_RIGHT": utils.ENUM.LV_ALIGN_OUT_TOP_RIGHT,
    "OUT_BOTTOM_LEFT": utils.ENUM.LV_ALIGN_OUT_BOTTOM_LEFT,
    "OUT_BOTTOM_MID": utils.ENUM.LV_ALIGN_OUT_BOTTOM_MID,
    "OUT_BOTTOM_RIGHT": utils.ENUM.LV_ALIGN_OUT_BOTTOM_RIGHT,
    "OUT_LEFT_TOP": utils.ENUM.LV_ALIGN_OUT_LEFT_TOP,
    "OUT_LEFT_MID": utils.ENUM.LV_ALIGN_OUT_LEFT_MID,
    "OUT_LEFT_BOTTOM": utils.ENUM.LV_ALIGN_OUT_LEFT_BOTTOM,
    "OUT_RIGHT_TOP": utils.ENUM.LV_ALIGN_OUT_RIGHT_TOP,
    "OUT_RIGHT_MID": utils.ENUM.LV_ALIGN_OUT_RIGHT_MID,
    "OUT_RIGHT_BOTTOM": utils.ENUM.LV_ALIGN_OUT_RIGHT_BOTTOM,
    "TOP_LEFT": utils.ENUM.LV_ALIGN_TOP_LEFT,
    "TOP_MID": utils.ENUM.LV_ALIGN_TOP_MID,
    "TOP_RIGHT": utils.ENUM.LV_ALIGN_TOP_RIGHT,
    "BOTTOM_LEFT": utils.ENUM.LV_ALIGN_BOTTOM_LEFT,
    "BOTTOM_MID": utils.ENUM.LV_ALIGN_BOTTOM_MID,
    "BOTTOM_RIGHT": utils.ENUM.LV_ALIGN_BOTTOM_RIGHT,
    "LEFT_MID": utils.ENUM.LV_ALIGN_LEFT_MID,
    "RIGHT_MID": utils.ENUM.LV_ALIGN_RIGHT_MID,
    "CENTER": utils.ENUM.LV_ALIGN_CENTER,
    "DEFAULT": utils.ENUM.LV_ALIGN_DEFAULT
}
utils.FLEX_ALIGN = {//Flex layout, alignment method
    "START": utils.ENUM.LV_FLEX_ALIGN_START,
    "END": utils.ENUM.LV_FLEX_ALIGN_END,
    "CENTER": utils.ENUM.LV_FLEX_ALIGN_CENTER,
    "SPACE_EVENLY": utils.ENUM.LV_FLEX_ALIGN_SPACE_EVENLY,
    "SPACE_AROUND": utils.ENUM.LV_FLEX_ALIGN_SPACE_AROUND,
    "SPACE_BETWEEN": utils.ENUM.LV_FLEX_ALIGN_SPACE_BETWEEN,
}
utils.FLEX_FLOW = {//Flex layout, main and cross axis
    "ROW": utils.ENUM.LV_FLEX_FLOW_ROW,
    "COLUMN": utils.ENUM.LV_FLEX_FLOW_COLUMN,
    "ROW_WRAP": utils.ENUM.LV_FLEX_FLOW_ROW_WRAP,
    "ROW_REVERSE": utils.ENUM.LV_FLEX_FLOW_ROW_REVERSE,
    "ROW_WRAP_REVERSE": utils.ENUM.LV_FLEX_FLOW_ROW_WRAP_REVERSE,
    "COLUMN_WRAP": utils.ENUM.LV_FLEX_FLOW_COLUMN_WRAP,
    "COLUMN_REVERSE": utils.ENUM.LV_FLEX_FLOW_COLUMN_REVERSE,
    "COLUMN_WRAP_REVERSE": utils.ENUM.LV_FLEX_FLOW_COLUMN_WRAP_REVERSE,
}
utils.GRAD = {//Gradient color direction
    "NONE": utils.ENUM.LV_GRAD_DIR_NONE,
    "VER": utils.ENUM.LV_GRAD_DIR_VER,
    "HOR": utils.ENUM.LV_GRAD_DIR_HOR,
}
utils.KEYBOARD = {//Keyboard mode
    "TEXT_LOWER": utils.ENUM.LV_KEYBOARD_MODE_TEXT_LOWER,
    "TEXT_UPPER": utils.ENUM.LV_KEYBOARD_MODE_TEXT_UPPER,
    "SPECIAL": utils.ENUM.LV_KEYBOARD_MODE_SPECIAL,
    "NUMBER": utils.ENUM.LV_KEYBOARD_MODE_NUMBER,
    "K26": "K26",
    "K9": "K9",
}
utils.FONT_STYLE = {
    "NORMAL": utils.ENUM.FT_FONT_STYLE_NORMAL,
    "ITALIC": utils.ENUM.FT_FONT_STYLE_ITALIC,
    "BOLD": utils.ENUM.FT_FONT_STYLE_BOLD,
}
utils.BUTTONS_STATE = {
    "HIDDEN": utils.ENUM.LV_BTNMATRIX_CTRL_HIDDEN,//Whether a button in the button matrix is hidden
    "NO_REPEAT": utils.ENUM.LV_BTNMATRIX_CTRL_NO_REPEAT,//Whether buttons in the button matrix can be pressed repeatedly, won't trigger key events repeatedly
    "DISABLED": utils.ENUM.LV_BTNMATRIX_CTRL_DISABLED,//Whether a button in the button matrix is disabled
    "CHECKABLE": utils.ENUM.LV_BTNMATRIX_CTRL_CHECKABLE,//Whether buttons in the button matrix are checkable
    "CHECKED": utils.ENUM.LV_BTNMATRIX_CTRL_CHECKED,//Whether a button in the button matrix is checked, displayed as checked state in the interface
    "CLICK_TRIG": utils.ENUM.LV_BTNMATRIX_CTRL_CLICK_TRIG,//Whether buttons in the button matrix can be triggered by clicking
    "POPOVER": utils.ENUM.LV_BTNMATRIX_CTRL_POPOVER,//Whether a button in the matrix pops up, will display more options or content when clicked
    "RECOLOR": utils.ENUM.LV_BTNMATRIX_CTRL_RECOLOR//Whether buttons in the matrix can be recolored
}
//Style effective part
utils.STYLE_PART = {
    "MAIN": 0, //Object's current style takes effect
    "ITEMS": 327680//Object's internal sub-items take effect, such as button groups in buttonMatrix
}
//Text overflow display mode
utils.LABEL_LONG_MODE = {
    "WRAP": utils.ENUM.LV_LABEL_LONG_WRAP,//Wrap text when it's long
    "DOT": utils.ENUM.LV_LABEL_LONG_DOT,//Replace with ... when text is long
    "SCROLL": utils.ENUM.LV_LABEL_LONG_SCROLL,//Auto scroll when text is long
    "SCROLL_CIRCULAR": utils.ENUM.LV_LABEL_LONG_SCROLL_CIRCULAR,//Circular scroll when text is long
    "CLIP": utils.ENUM.LV_LABEL_LONG_CLIP,//Auto clip when text is long
}
// Set object's base layout direction
utils.BASE_DIR = {
    "LTR": utils.ENUM.LV_BASE_DIR_LTR,//Left to right
    "RTL": utils.ENUM.LV_BASE_DIR_RTL,//Right to left
    "AUTO": utils.ENUM.LV_BASE_DIR_AUTO,//Automatically choose text direction based on text content
    "NEUTRAL": utils.ENUM.LV_BASE_DIR_NEUTRAL,//Neutral direction, their display direction is determined by surrounding text direction
    "WEAK": utils.ENUM.LV_BASE_DIR_WEAK,//Has slight directional tendency (usually LTR), but will change direction under the influence of strong directional text (such as Arabic)
}
// Map 0-100 to 0-255
utils.OPA_MAPPING = function (value) {
    return Math.round((value / 100) * 255);
}
/**
* Validate if number is empty, if it's a number
* @param {number} n Required
* @param {err} Error message, optional, will throw Error if provided
*/
utils.validateNumber = function (n, err) {
    return _valid(n, 'number', err)
}
/**
* Validate if object is empty, if it's an object
* @param {object} o Required
* @param {err} Error message, optional, will throw Error if provided
*/
utils.validateObject = function (o, err) {
    return _valid(o, 'object', err)
}
/**
 * Validate UI object build parameters
 * @param {array} all Required, all object references
 * @param {string} id Cannot be empty, required
 * @param {object} parent Optional, defaults to 0
 */
utils.validateBuild = function (all, id, parent, type) {
    this.validateId(all, id)
    if (parent === 0 || parent === 1 || parent === 2) {
        return parent
    }
    if (!parent || !parent.obj) {
        throw new Error(type + ".build: 'parent' paramter should not be null")
    }
    return parent.obj
}
/**
 * Validate all UI control ids, cannot be duplicated
 * @param {array} all
 * @param {string} id
 */
utils.validateId = function (all, id) {
    this.validateString(id, "The 'id' parameter should not be null.")
    if (all[id]) {
        throw new Error("The id(" + id + ") already exists. Please set a different id value.")
    }
}
/**
* Validate if string is empty
* @param {string} s Required
* @param {err} Error message, optional, will throw Error if provided
*/
utils.validateString = function (s, err) {
    let res = _valid(s, 'string', err)
    if (!res) {
        return false
    }
    if (s.length <= 0) {
        if (err) {
            throw new Error(err)
        }
        return false
    }
    return true
}
/**
 * Parse different types of color values
 * @param {any} value Supports number type: 0x34ffaa, string type: '0x34ffaa', string type: '#34ffaa'
 * @returns
 */
utils.colorParse = function (value) {
    if (typeof value == 'string') {
        value = value.replace('#', '0x')
        value = parseInt(value, 16)
    }
    return value
}
/**
 * Get touch point coordinates
 * @returns {x: x-coordinate, y: y-coordinate}
 */
utils.getTouchPoint = function () {
    let point = NativeObject.APP.NativeComponents.NativeIndev.lvIndevGetPoint()
    return point
}
/**
 * Provide animation
 * @param {object} obj Animation operation object, can be any object, obtained from callback parameter
 * @param {number} start Interval start value, usually used with end, start changes to end during animation
 * @param {number} end Interval end value
 * @param {function} cb Callback function (obj, v)=>{}, obj is the animation operation object, interval value (start-end)
 * @param {number} duration Animation duration, milliseconds
 * @param {number} backDuration Optional, animation playback time, milliseconds, defaults to no playback
 * @param {number} repeat Optional, animation repeat count, defaults to 1 time
 * @param {string} mode Rate curve, optional, defaults to linear, built-in functions: linear, ease_in, ease_out, ease_in_out, overshoot, bounce, step
 *  linear Linear animation
    step Change at the last step
    ease_in Slow at the beginning
    ease_out Slow at the end
    ease_in_out Slow at both beginning and end
    overshoot Overshoot the final value
    bounce Bounce a bit from the final value (like hitting a wall)
 * @returns Animation instance, must be saved globally
 */
utils.anime = function (obj, start, end, cb, duration, backDuration, repeat, mode) {
    // 1. Initialize animation
    let anim = NativeObject.APP.NativeComponents.NativeAnim.lvAnimInit()
    // 2. Set animation object
    anim.lvAnimSetVar(obj)
    // 3. Set start and end values
    anim.lvAnimSetValues(start, end)
    //4. Set animation callback function
    anim.lvAnimSetExecCb(cb)
    // 5. Set animation time
    anim.lvAnimSetTime(duration)
    // Optional, set animation playback time, won't play back if not set
    if (backDuration) {
        anim.lvAnimSetPlaybackTime(backDuration)
    }
    // Optional, set animation repeat count
    if (repeat) {
        anim.lvAnimSetRepeatCount(repeat)
    }
    // Optional, set animation rate curve
    if (mode) {
        anim.lvAnimSetPathCb(mode)
    }
    // 6. Run animation
    anim.lvAnimStart()
    return anim
}
//Set parent and children for each object
utils.setParent = function (all, child, parent) {
    if (!all || parent == null || parent == undefined || !child) {
        return
    }
    if ((typeof parent) == 'number') {

    }
    const parentId = ((typeof parent) == 'number') ? '' + parent : parent.id//Convert 0, 1, 2 to string
    if (!all[parentId]) {
        all[parentId] = { id: parentId }//Root nodes 0, 1, 2
    }
    if (!all[parentId].children) {
        all[parentId].children = []
    }
    all[parentId].children.push(child.id)
    child.parent = parentId
    all[child.id] = child
}
function _valid(n, type, err) {
    if (n === undefined || n === null || (typeof n) != type) {
        if (err) {
            throw new Error(err)
        }
        return false
    }
    return true
}
export default utils