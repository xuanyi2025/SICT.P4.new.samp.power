//build: 20240311
//Image control 
import utils from "./uiUtils.js"
import base from "./uiBase.js"
let image = {}

image.build = function (id, parent) {
    let temp = utils.validateBuild(image.all, id, parent, 'image')
    let my = {type: 'image'}
    my.obj = new utils.GG.NativeImage({ uid: id }, temp)
    my.id = id
    /**
     * Set or get the image source
     * @param {string} path Optional, absolute path to the image file. If not provided or not a string type, it will get the source
     */
    my.source = function (path) {
        if (utils.validateString(path)) {
            this.obj.lvImgSetSrc(path)
        } else {
            return this.obj.lvImgGetSrc()
        }
    }
    let comp = Object.assign(my, base);
    utils.setParent(this.all, comp, parent)
    return comp;
}
export default image;