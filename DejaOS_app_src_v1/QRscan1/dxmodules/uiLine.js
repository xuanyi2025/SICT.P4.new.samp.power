//build: 20240311
//Line component
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let line = {}

line.build = function (id, parent) {
    let temp = utils.validateBuild(line.all, id, parent, 'line')
    let my = {type: 'line'}
    my.obj = new utils.GG.NativeLine({ uid: id }, temp)
    my.id = id
    /**
     * Set coordinates of all points for the line
     * @param {Array} points Required, array of all points, e.g. [[x1,y1],[x2,y2]]
     * @param {number} count Required, number of points to draw, note this value can be less than the length of points
     */
    my.setPoints = function (points, count) {
        this.obj.lvLineSetPoints(points, count)
    }
    let comp = Object.assign(my, base);
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default line;