import bus from "../dxmodules/dxEventBus.js";
import log from "../dxmodules/dxLogger.js";
import gpio from "../dxmodules/dxGpio.js";
import map from "../dxmodules/dxMap.js";
import dxDriver from "../dxmodules/dxDriver.js";
import std from "../dxmodules/dxStd.js";
import dxBarcode from "../dxmodules/dxBarcode.js";
import common from "../dxmodules/dxCommonUtils.js";

(function () {
  try {
    let store = map.get("qrapp");
    if (!store.get("sysTimeInitialized")) {
      let baseMs = Date.parse("2026-05-11T09:33:55");
      let offset = baseMs - Date.now();
      store.put("timeOffset", offset);
      store.put("sysTimeInitialized", "true");
      store.put("lastMachineOnTime", "");
      store.put("lastMachineOffTime", "");
      log.info("时间偏移已初始化: offset=" + offset + "ms");
    }
  } catch (e) {
    log.error("时间偏移初始化失败", e);
  }

  try {
    gpio.init();
    gpio.request(dxDriver.GPIO.RELAY);
    gpio.setValue(dxDriver.GPIO.RELAY, 0);
    log.info("GPIO 初始化完成, RELAY=" + dxDriver.GPIO.RELAY + ", 低电平");
  } catch (e) {
    log.error("GPIO 初始化失败", e);
  }

  bus.on("gpio.on", function () {
    try {
      gpio.setValue(dxDriver.GPIO.RELAY, 1);
      log.info("GPIO RELAY 打开 (高电平)");
    } catch (e) {
      log.error("GPIO 打开失败", e);
    }
  });

  bus.on("gpio.off", function () {
    try {
      gpio.setValue(dxDriver.GPIO.RELAY, 0);
      log.info("GPIO RELAY 关闭 (低电平)");
    } catch (e) {
      log.error("GPIO 关闭失败", e);
    }
  });

  try {
    bus.newWorker("uiWorker", "/app/code/src/uiWorker.js");
    log.info("uiWorker 创建成功");
  } catch (e) {
    log.error("uiWorker 创建失败", e);
  }

  try {
    dxBarcode.init();
    log.info("dxBarcode 初始化完成");
    let nb = dxBarcode.getNative();
    try { if (typeof nb.setSymbology === "function") nb.setSymbology(10); } catch (e) {}
    try { if (typeof nb.setSymbolType === "function") nb.setSymbolType(10); } catch (e) {}
    try { if (typeof nb.set_symbol_type === "function") nb.set_symbol_type(10); } catch (e) {}
  } catch (e) {
    log.error("dxBarcode 初始化失败", e);
    return;
  }

  try {
    dxBarcode.setCallbacks({
      onBarcodeDetected: function (data, type, quality, timestamp) {
        try {
          let hex = common.codec.arrayBufferToHex(data);
          let str = common.codec.utf8HexToStr(hex);
          log.info("扫码解码成功: " + str + " type=" + type + " quality=" + quality);
          bus.fire("qrcode.decoded", { text: str, type: type });
        } catch (e) {
          log.error("解码数据处理失败", e);
        }
      }
    });
    log.info("dxBarcode 回调设置完成");
  } catch (e) {
    log.error("dxBarcode 回调设置失败", e);
    return;
  }

  let barcodePaused = false;

  std.setInterval(function () {
    if (barcodePaused) return;
    try {
      dxBarcode.loop();
    } catch (e) {
      log.error("扫码循环异常", e);
    }
  }, 10);

  bus.on("barcode.pause", function () {
    barcodePaused = true;
    log.info("扫码已暂停");
  });

  bus.on("barcode.resume", function () {
    barcodePaused = false;
    log.info("扫码已恢复");
  });

  log.info("主线程初始化完成");
})();
