import dxui from "../dxmodules/dxUi.js";
import std from "../dxmodules/dxStd.js";
import log from "../dxmodules/dxLogger.js";
import bus from "../dxmodules/dxEventBus.js";
import UIManager from "./UIManager.js";
import HomePage from "./pages/HomePage.js";
import InUsePage from "./pages/InUsePage.js";

(function () {
  try {
    dxui.init({ orientation: 1 }, {});
    log.info("UI 初始化完成");
  } catch (e) {
    log.error("UI 初始化失败", e);
    return;
  }

  try {
    UIManager.init();
    UIManager.register("home", HomePage);
    UIManager.register("inuse", InUsePage);
    UIManager.open("home");
    log.info("UIManager 初始化完成, 打开首页");
  } catch (e) {
    log.error("UIManager 初始化失败", e);
    return;
  }

  try {
    bus.on("qrcode.decoded", function (data) {
      log.info("收到扫码结果", data);
      let currentPage = UIManager.getCurrentPage();
      if (currentPage && currentPage.onQrDecoded) {
        currentPage.onQrDecoded(data);
      }
    });
    log.info("扫码事件监听已注册");
  } catch (e) {
    log.error("注册扫码事件失败", e);
  }

  std.setInterval(function () {
    try {
      dxui.handler();
    } catch (e) {
      log.error("UI 事件循环异常", e);
    }
  }, 20);

  log.info("UI Worker 启动完成");
})();
