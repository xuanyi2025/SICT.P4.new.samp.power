import dxui from "../dxmodules/dxUi.js";
import dxDriver from "../dxmodules/dxDriver.js";
import map from "../dxmodules/dxMap.js";
import Theme from "./Theme.js";

const UIManager = {};
let rootView = null;
let pages = {};
let fontCache = {};
let currentPage = null;
let stack = [];

UIManager.init = function () {
  rootView = dxui.View.build("uiManagerRoot", dxui.Utils.LAYER.MAIN);
  rootView.setSize(dxDriver.DISPLAY.WIDTH, dxDriver.DISPLAY.HEIGHT);
  rootView.radius(0);
  rootView.borderWidth(0);
  rootView.padAll(0);
  rootView.scroll(false);
  rootView.bgColor(Theme.COLOR.BG);
  dxui.loadMain(rootView);
};

UIManager.getRoot = function () {
  return rootView;
};

UIManager.register = function (name, page) {
  pages[name] = page;
};

UIManager.open = function (name, data) {
  let page = pages[name];
  if (!page) {
    throw new Error("UIManager.open: page not found: " + name);
  }

  if (currentPage && currentPage.onHide) {
    currentPage.onHide();
  }

  if (!page.root) {
    page.root = page.init();
  } else {
    page.root.show();
  }

  currentPage = page;
  stack.push({ name: name, page: page });

  if (page.onShow) {
    page.onShow(data);
  }
};

UIManager.back = function () {
  if (stack.length <= 1) {
    return;
  }

  if (currentPage && currentPage.onHide) {
    currentPage.onHide();
  }
  currentPage.root.hide();

  stack.pop();
  let prev = stack[stack.length - 1];
  currentPage = prev.page;
  currentPage.root.show();

  if (currentPage.onShow) {
    currentPage.onShow();
  }
};

UIManager.font = function (size, style) {
  if (!style) {
    style = dxui.Utils.FONT_STYLE.NORMAL;
  }
  let key = size + "_" + style;
  if (!fontCache[key]) {
    fontCache[key] = dxui.Font.build("/app/code/resource/font/font.ttf", size, style);
  }
  return fontCache[key];
};

UIManager.getCurrentPage = function () {
  return currentPage;
};

UIManager.now = function () {
  let store = map.get("qrapp");
  let offset = store.get("timeOffset") || 0;
  return new Date(Date.now() + offset);
};

export default UIManager;
