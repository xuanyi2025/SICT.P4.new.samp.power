//build: 20240311
//Font object (to support Chinese, you need to use a TTF font file that supports Chinese)
import utils from "./uiUtils.js"
let font = {}
/**
 * Build font
 * @param {string} ttf Full path to the TTF font file
 * @param {number} size Font size
 * @param {number} style Font style, refer to utils.FONT_STYLE
 * @returns
 */
font.build = function (ttf, size, style) {
    let comp = {}
    comp.obj = utils.GG.NativeFont.lvFontInit(ttf, size, style)
    return comp;
}

export default font;