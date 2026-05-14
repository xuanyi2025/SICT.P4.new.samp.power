//build: 20240314
//Button group control
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let buttons = {}

buttons.build = function (id, parent) {
    let temp = utils.validateBuild(buttons.all, id, parent, 'buttons')
    let my = {type: 'buttons'}
    my.obj = new utils.GG.NativeBtnmatrix({ uid: id }, temp)
    my.id = id
    /**
     * Set the data for the button group, must be in array format. Example below shows 3 rows of buttons, 12 buttons in total:
     * ["1", "2", "3", "0", "\n",
     * "4", "5", "6", "Cancel", "\n",
     *  "7", "8", "9", "Confirm", ""]
     * @param {array} d Optional, if not provided or not an object type, it will get the data
     */
    my.data = function (d) {
        if (utils.validateObject(d)) {
            this.obj.lvBtnmatrixSetMap(d)
        } else {
            return this.obj.lvBtnmatrixGetMap()
        }
    }
    /**
     * Call clickedButton to get the id and text of the clicked button when any button in the button group is clicked
     * Return example: {id:11,text:'Cancel'}
     */
    my.clickedButton = function () {
        let id = this.obj.lvBtnmatrixGetSelectedBtn();
        if (id == 0xFFFF) {
            // Clicking on the button group boundary will result in 0xFFFF invalid value, return empty
            return { id: null, text: null }
        }
        let txt = this.obj.lvBtnmatrixGetBtnText(id);
        return { id: id, text: txt }
    }
    /**
     * Set the state of a specific button in the button group, can be changed to selected, disabled, etc.
     * @param {number} id Button index, starting from 0 from left to right, top to bottom, also the id returned by clickedButton
     * @param {number} state Refer to dxui.Utils.BUTTONS_STATE
     */
    my.setState = function (id, state) {
        this.obj.lvBtnmatrixSetBtnCtrl(id, state)
    }
    /**
     * Clear the already set state of a specific button in the button group
     * @param {number} id Button index, starting from 0 from left to right, top to bottom, also the id returned by clickedButton
     * @param {number} state Refer to dxui.Utils.BUTTONS_STATE
     */
    my.clearState = function (id, state) {
        this.obj.lvBtnmatrixClearBtnCtrl(id, state)
    }
    /**
     * Set the state of all buttons in the button group, can be changed to selected, disabled, etc.
     * @param {number} state Refer to dxui.Utils.BUTTONS_STATE
     */
    my.setAllState = function (state) {
        this.obj.lvBtnmatrixSetBtnCtrlAll(state)
    }
    /**
     * Clear the already set state of all buttons in the button group
     * @param {number} state Refer to dxui.Utils.BUTTONS_STATE
     */
    my.clearAllState = function (state) {
        this.obj.lvBtnmatrixClearBtnCtrlAll(state)
    }
    /**
     * Set the button width to span multiple columns for a specific button id
     * @param {number} id Button index, starting from 0
     * @param {number} width Width span in number of columns
     */
    my.setBtnWidth = function (id, width) {
        this.obj.lvBtnmatrixSetBtnWidth(id, width)
    }
    /**
     * Set the button icon for a specific button id
     * @param {number} id Button index, starting from 0
     * @param {string} src Icon file path
     */
    my.setBtnIcon = function (id, src) {
        this.obj.addEventCb((e) => {
            // Get the draw control object
            let dsc = e.lvEventGetDrawPartDsc()
            // If drawing the id-th button
            if (dsc.type == utils.ENUM.LV_BTNMATRIX_DRAW_PART_BTN && dsc.id == id) {
                // Get image information
                let header = utils.GG.NativeDraw.lvImgDecoderGetInfo(src)
                // Define an area, center display, note: size to area needs -1, area to size needs +1
                let x1 = dsc.draw_area.x1 + (dsc.draw_area.x2 - dsc.draw_area.x1 + 1 - header.w) / 2;
                let y1 = dsc.draw_area.y1 + (dsc.draw_area.y2 - dsc.draw_area.y1 + 1 - header.h) / 2;
                let x2 = x1 + header.w - 1;
                let y2 = y1 + header.h - 1;
                let area = utils.GG.NativeArea.lvAreaSet(x1, y1, x2, y2)
                // Draw image information
                let img_draw_dsc = utils.GG.NativeDraw.lvDrawImgDscInit()
                // Draw image
                utils.GG.NativeDraw.lvDrawImg(dsc.dsc, img_draw_dsc, area, src)
            }
        }, utils.ENUM.LV_EVENT_DRAW_PART_END)
    }
    let comp = Object.assign(my, base);
    utils.setParent(this.all,comp,parent)
    return comp;
}
export default buttons;