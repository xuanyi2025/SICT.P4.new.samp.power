//build:20240524
/**
 * Base class for UI, inherited by other components. Subclasses are not allowed to modify corresponding function behavior. This js file does not need to be directly referenced or used.
 */
import utils from "./uiUtils.js"
import logger from './dxLogger.js'
import * as os from "os"
const uibase = {}
/**
* Modify or get the width of the component
* @param {number} w Optional, if not provided, get the width; otherwise, modify the width
*/
uibase.width = function (w) {
     if (!utils.validateNumber(w)) {
          return this.obj.getWidth()
     }
     this.obj.lvObjSetWidth(w)
}
/**
* Modify or get the height of the component
* @param {number} h Optional, if not provided, get the height; otherwise, modify the height
*/
uibase.height = function (h) {
     if (!utils.validateNumber(h)) {
          return this.obj.getHeight()
     }
     this.obj.lvObjSetHeight(h)
}
/**
 * Get width excluding borders and padding
 * @returns
 */
uibase.contentWidth = function () {
     return this.obj.lvObjGetContentWidth()
}
/**
 * Get height excluding borders and padding
 * @returns
 */
uibase.contentHeight = function () {
     return this.obj.lvObjGetContentHeight()
}
/**
 * Get top scroll distance
 * @returns
 */
uibase.scrollTop = function () {
     return this.obj.getScrollTop()
}
/**
 * Get bottom scroll distance
 * @returns
 */
uibase.scrollBottom = function () {
     return this.obj.getScrollBottom()
}
/**
 * Get left scroll distance
 * @returns
 */
uibase.scrollLeft = function () {
     return this.obj.getScrollLeft()
}
/**
 * Get right scroll distance
 * @returns
 */
uibase.scrollRight = function () {
     return this.obj.getScrollRight()
}
/**
* Modify the width and height of the component
* @param {number} w Required
* @param {number} h Required
*/
uibase.setSize = function (w, h) {
     let err = 'dxui.setSize: width or height should not be empty'
     utils.validateNumber(w, err)
     utils.validateNumber(h, err)
     this.obj.lvObjSetSize(w, h)
}
/**
* Modify or get the x coordinate of the component relative to the parent object
* @param {number} x Optional, if not provided, get the x coordinate; otherwise, modify the x coordinate
*/
uibase.x = function (x) {
     if (!utils.validateNumber(x)) {
          return this.obj.getX()
     }
     this.obj.lvObjSetX(x)
}
/**
* Modify or get the y coordinate of the component relative to the parent object
* @param {number} y Optional, if not provided, get the y coordinate; otherwise, modify the y coordinate
*/
uibase.y = function (y) {
     if (!utils.validateNumber(y)) {
          return this.obj.getY()
     }
     this.obj.lvObjSetY(y)
}
/**
* Modify the x and y coordinates of the component relative to the parent object
* @param {number} x Required
* @param {number} y Required
*/
uibase.setPos = function (x, y) {
     let err = 'dxui.setPos: x or y should not be empty'
     utils.validateNumber(x, err)
     utils.validateNumber(y, err)
     this.obj.lvObjSetPos(x, y)
}
/**
 * Move the component to the top layer, equivalent to the last created child component of the parent object, will cover all other child components
 */
uibase.moveForeground = function () {
     this.obj.moveForeground()
}
/**
 * Move the component to the bottom layer, equivalent to the first created child component of the parent object, will be covered by all other child components
 */
uibase.moveBackground = function () {
     this.obj.moveBackground()
}
/**
 * Subscribe to events, supported event types refer to utils.EVENT
 * @param {number} type Enum utils.EVENT, such as click, long press, etc.
 * @param {function} cb Event trigger callback function (cannot be an anonymous function)
 * @param {object} ud User data
 */
uibase.on = function (type, cb, ud) {
     this.obj.addEventCb(() => {
          if (cb) {
               cb({ target: this, ud: ud })
          }
     }, type)
}
/**
 * Send event, for example, to simulate clicking a button, you can send a CLICK event to the button
 * @param {number} type Enum utils.EVENT, such as click, long press, etc.
 */
uibase.send = function (type) {
     NativeObject.APP.NativeComponents.NativeEvent.lvEventSend(this.obj, type)
}
/**
 * Hide UI object
 */
uibase.hide = function () {
     if (!this.obj.hasFlag(1)) {
          this.obj.lvObjAddFlag(1);
     }
}
/**
 * Check if hidden
 * @returns
 */
uibase.isHide = function () {
     return this.obj.hasFlag(1);
}
/**
 * Show hidden UI object
 */
uibase.show = function () {
     if (this.obj.hasFlag(1)) {
          this.obj.lvObjClearFlag(1);
     }
}
/**
 * Disable/enable object
 * @param {*} en false/true, true is disabled, false is enabled
 */
uibase.disable = function (en) {
     if (en) {
          this.obj.addState(utils.STATE.DISABLED)
     } else {
          this.obj.clearState(utils.STATE.DISABLED)
     }
}
/**
 * Whether object is clickable
 * @param {*} en false/true, true is clickable, false is not clickable
 */
uibase.clickable = function (en) {
     if (en) {
          this.obj.lvObjAddFlag(utils.OBJ_FLAG.CLICKABLE)
     } else {
          this.obj.lvObjClearFlag(utils.OBJ_FLAG.CLICKABLE)
     }
}
/**
 * Check if disabled
 * @returns true is disabled, false is enabled
 */
uibase.isDisable = function () {
     return this.obj.hasState(utils.STATE.DISABLED)
}
/**
 * Focus object
 * @param {*} en false/true, true is focus, false is unfocus
 */
uibase.focus = function (en) {
     if (en) {
          this.obj.addState(utils.STATE.FOCUSED)
     } else {
          this.obj.clearState(utils.STATE.FOCUSED)
     }
}
/**
 * Check if focused
 * @returns true is focused, false is not focused
 */
uibase.isFocus = function () {
     return this.obj.hasState(utils.STATE.FOCUSED)
}

/**
 * Set UI style, can be set individually for each style, or define a style object first and then bind it to the UI object
 * Bind UI object and style object, can be bound to different parts or different states
 * @param {object} style Object returned by style.js build function
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.addStyle = function (style, type) {
     if (!style || !style.obj) {
          throw new Error('dxui.addStyle: style should not be null')
     }
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjAddStyle(style.obj, type);
}
/**
* Set all padding (left, right, top, bottom) to one value
* @param {number} pad Padding value
* @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
*/
uibase.padAll = function (pad, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStylePadAll(pad, type)
}
/**
 * Set/get right padding to one value
 * @param {number} pad Padding value
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.padRight = function (pad, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     if (!utils.validateNumber(pad)) {
          return this.obj.getStylePadRight(type)
     }
     this.obj.setStylePadRight(pad, type)
}
/**
  * Set/get left padding to one value
  * @param {number} pad Padding value
  * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
  */
uibase.padLeft = function (pad, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     if (!utils.validateNumber(pad)) {
          return this.obj.getStylePadLeft(type)
     }
     this.obj.setStylePadLeft(pad, type)
}
/**
  * Set/get top padding to one value
  * @param {number} pad Padding value
  * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
  */
uibase.padTop = function (pad, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     if (!utils.validateNumber(pad)) {
          return this.obj.getStylePadTop(type)
     }
     this.obj.setStylePadTop(pad, type)
}
/**
  * Set/get bottom padding to one value
  * @param {number} pad Padding value
  * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
  */
uibase.padBottom = function (pad, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     if (!utils.validateNumber(pad)) {
          return this.obj.getStylePadBottom(type)
     }
     this.obj.setStylePadBottom(pad, type)
}
/**
 * Set/get border width
 * @param {number} w
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.borderWidth = function (w, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     if (!utils.validateNumber(w)) {
          return this.obj.lvObjGetStyleBorderWidth(type)
     }
     this.obj.lvObjSetStyleBorderWidth(w, type)
}
// Deprecated
uibase.setBorderColor = function (color, type) {
     this.borderColor(color, type)
}
/**
 * Set border color
 * @param {number} color Supports number type: e.g. 0x34ffaa; string type (starting with #), e.g.: '#34ffaa'
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.borderColor = function (color, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.setStyleBorderColor(utils.colorParse(color), type)
}
/**
 * Set border radius
 * @param {number} r
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.radius = function (r, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleRadius(r, type)
}
/**
 * Set background opacity, value range is 0-100, smaller value is more transparent
 * @param {number} opa Must be 0-100
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.bgOpa = function (opa, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleBgOpa(utils.OPA_MAPPING(opa), type)
}
/**
 * Set background color
 * @param {any} color Supports number type: e.g. 0x34ffaa; string type (starting with #), e.g.: '#34ffaa'
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.bgColor = function (color, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleBgColor(utils.colorParse(color), type)
}
/**
 * Set shadow
 * @param {number} width Shadow width
 * @param {number} x Horizontal offset
 * @param {number} y Vertical offset
 * @param {number} spread Spread distance
 * @param {number} color Color
 * @param {number} opa Opacity, must be 0-100
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.shadow = function (width, x, y, spread, color, opa, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleShadowWidth(width, type)
     this.obj.lvObjSetStyleShadowOfsX(x, type)
     this.obj.lvObjSetStyleShadowOfsY(y, type)
     this.obj.lvObjSetStyleShadowSpread(spread, type)
     this.obj.setStyleShadowColor(color, type)
     this.obj.setStyleShadowOpa(utils.OPA_MAPPING(opa), type)
}
/**
 * Set text color
 * @param {any} color Supports number type: e.g. 0x34ffaa; string type (starting with #), e.g.: '#34ffaa'
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.textColor = function (color, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleTextColor(utils.colorParse(color), type)
}
/**
 * Set text alignment
 * @param {number} align Refer to utils.TEXT_ALIGN
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.textAlign = function (align, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleTextAlign(align, type)
}
/**
 * Set text font
 * @param {object} font Object returned by font.js build function
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.textFont = function (font, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     if (!font || !font.obj) {
          throw new Error("dxui.textFont: 'font' parameter should not be null")
     }
     this.obj.lvObjSetStyleTextFont(font.obj, type)
}
/**
 * Set line object (line) color
 * @param {any} color Supports number type: e.g. 0x34ffaa; string type (starting with #), e.g.: '#34ffaa'
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.lineColor = function (color, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleLineColor(utils.colorParse(color), type)
}
/**
 * Set line object (line) width
 * @param {number} w
 * @param {number} type Refer to utils.STYLE, optional, default is bound to the object itself
 */
uibase.lineWidth = function (w, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.lvObjSetStyleLineWidth(w, type)
}
/**
 * Set line object (line) rounded corners
 * @param {boolean} enable true/false
 */
uibase.lineRound = function (enable) {
     this.obj.lvObjSetStyleLineRounded(enable)
}
/**
 * Set the scrollbar display mode for the UI object
 * @param {boolean} state true/false
 */
uibase.scrollbarMode = function (state) {
     this.obj.lvObjSetScrollbarMode(state)
}
/**
 * Set whether the UI object supports scrolling
 * @param {boolean} state
 */
uibase.scroll = function (state) {
     if (state) {
          this.obj.lvObjAddFlag(16)
     } else {
          this.obj.lvObjClearFlag(16)
     }
}
/**
 * Align the object with another reference object
 * @param {object} ref Reference object
 * @param {number} type Alignment direction, refer to dxui.Utils.ALIGN enum
 * @param {number} x X offset
 * @param {number} y Y offset
 */
uibase.alignTo = function (ref, type, x, y) {
     if (!ref || !ref.obj) {
          throw new Error("dxui.alignto: 'ref' parameter should not be null")
     }
     this.obj.lvObjAlignTo(ref.obj, type, x, y)
}
/**
 * Align the object with its parent object
 * @param {number} type Alignment direction, refer to dxui.Utils.ALIGN enum
 * @param {number} x X offset
 * @param {number} y Y offset
 */
uibase.align = function (type, x, y) {
     this.obj.lvObjAlign(type, x, y)
}
/**
 * Flexbox layout allows for more flexible positioning, arrangement, and distribution of elements, making it easier to create responsive and scalable layouts.
 * It is based on a container with flexible items inside. Here are some concepts for using this layout:
 * 1. Container: The container holds the flexible items inside and can arrange them from left to right or right to left, etc.
 * 2. Main axis and cross axis: The main axis is the primary arrangement direction of items in the container, usually horizontal or vertical, allowing items to be arranged horizontally or vertically.
 *   The cross axis is perpendicular to the main axis and can specify how items are arranged on the cross axis.
 *   The main and cross axes are set by flexFlow(), mainly ROW (horizontal) and COLUMN (vertical). Those with WRAP suffix automatically wrap when items exceed the container, and those with REVERSE suffix arrange in the opposite direction (right to left for horizontal, bottom to top for vertical).
 * 3. Main axis alignment: START (default main axis order), END (opposite of default main axis order), CENTER (centered on main axis), SPACE_EVENLY (evenly distributed on main axis with equal spacing), SPACE_AROUND (evenly distributed on main axis, each item gets equal space), SPACE_BETWEEN (flush at both ends, evenly spaced in between), set by flexAlign().
 * 4. Cross axis alignment: Treat each row or column as an item, align on the cross axis direction, alignment methods same as main axis, set by flexAlign().
 * 5. Overall alignment: Treat all items in the container as a whole, align within the container, alignment methods same as main axis, set by flexAlign().
 * @param {number} type Main axis and cross axis settings
 */
uibase.flexFlow = function (type) {
     this.obj.lvObjSetFlexFlow(type)
}
/**
 *
 * @param {number} main Child element alignment along the main axis
 * @param {number} cross Child element alignment along the cross axis
 * @param {number} track All child elements alignment relative to the container
 */
uibase.flexAlign = function (main, cross, track) {
     this.obj.lvObjSetFlexAlign(main, cross, track)
}
/**
 * Update the size of a control. When getting a control's size returns 0, call this first, equivalent to updating the display cache.
 */
uibase.update = function () {
     this.obj.lvObjUpdateLayout()
}
/**
 * Add a state to a control
 * @param {number} state State enum
 */
uibase.addState = function (state) {
     this.obj.addState(state)
}
/**
 * Remove a state from a control. To unfocus a focused input box, call this method to remove the FOCUSED state
 * @param {number} state State enum
 */
uibase.clearState = function (state) {
     this.obj.clearState(state)
}
/**
 * Check if a control has a state. To check if an input box is focused, use this method with the FOCUSED parameter
 * @param {number} state State enum
 * @returns true/false
 */
uibase.hasState = function (state) {
     return this.obj.hasState(state)
}
/**
 * Redraw a control, force refresh the control's cache. Can forcefully solve screen artifacts, but calling in a loop will reduce performance
 */
uibase.invalidate = function () {
     this.obj.invalidate()
}
/**
 * Scroll a child control until it's visible. If an item has been scrolled outside the container and is not visible, call this method to scroll it into view.
 * @param {boolean} en Whether to enable animation, enabled will scroll slowly, disabled will jump directly
 * @param {boolean} notRecursive Default recursive, suitable for general scrolling and nested scrolling controls
 */
uibase.scrollToView = function (en, isRecursive) {
     if (isRecursive) {
          this.obj.scrollToView(en)
     } else {
          this.obj.scrollToViewRecursive(en)
     }
}
/**
 * Scroll a control in the x direction
 * @param {number} x Scroll distance on x-axis
 * @param {boolean} en Whether to enable animation
 */
uibase.scrollToX = function (x, en) {
     this.obj.scrollToX(x, en)
}
/**
 * Scroll a control in the y direction
 * @param {number} y Scroll distance on y-axis
 * @param {boolean} en Whether to enable animation
 */
uibase.scrollToY = function (y, en) {
     this.obj.scrollToY(y, en)
}
/**
 * Element snapshot (essentially a screenshot. To save a full screen screenshot, use this method on the screen object)
 * @param {string} fileName Required, filename to save the snapshot (note: extension should match the format)
 * @param {number} type Optional, defaults to png, snapshot format 0:bmp/1:png/2:jpg(jpeg)
 * @param {number} cf Optional, an RGB color storage format
 */
uibase.snapshot = function (fileName, type = 1, cf = NativeObject.APP.NativeComponents.NativeEnum.LV_IMG_CF_TRUE_COLOR_ALPHA) {
     if (!fileName) {
          return
     }
     // Default storage location is /app/data/snapshot
     os.mkdir("/app/data/snapshot/")
     this.obj.lvSnapshotTake(cf, "/app/data/snapshot/" + fileName, type)
}
/**
 * Set the base layout direction of the object
 * @param {number} dir Refer to utils.STYLE Required, base layout direction of the object
 * @param {number} type Refer to utils.STYLE Optional, defaults to binding with the object itself
 */
uibase.setStyleBaseDir = function (dir, type) {
     if (!utils.validateNumber(type)) {
          type = 0
     }
     this.obj.setStyleBaseDir(dir, type)
}
export default uibase;