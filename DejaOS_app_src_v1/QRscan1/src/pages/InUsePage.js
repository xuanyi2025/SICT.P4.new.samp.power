import dxui from "../../dxmodules/dxUi.js";
import dxDriver from "../../dxmodules/dxDriver.js";
import log from "../../dxmodules/dxLogger.js";
import bus from "../../dxmodules/dxEventBus.js";
import map from "../../dxmodules/dxMap.js";
import std from "../../dxmodules/dxStd.js";
import UIManager from "../UIManager.js";
import Theme from "../Theme.js";

const InUsePage = {
  id: "inUsePage",
  clockTimerId: null,
  usageStartMs: 0,

  init: function () {
    let parent = UIManager.getRoot();
    let W = dxDriver.DISPLAY.WIDTH;
    let H = dxDriver.DISPLAY.HEIGHT;
    let M = Theme.LAYOUT.MARGIN;

    this.root = dxui.View.build(this.id, parent);
    this.root.setSize(W, H);
    this.root.radius(0);
    this.root.borderWidth(0);
    this.root.padAll(0);
    this.root.scroll(false);
    this.root.bgColor(Theme.COLOR.BG);

    this.initCorners(W, H);
    this.initClock(W, M);
    this.initInstrumentCard(W, M);
    this.initStatus(W, M);
    this.initTimeCard(W, M);
    this.initOffButton(W, M);
    return this.root;
  },

  initCorners: function (W, H) {
    let S = 8;
    let color = Theme.COLOR.PRIMARY;
    let corners = [[0, 0], [W - S, 0], [0, H - S], [W - S, H - S]];
    for (let i = 0; i < corners.length; i++) {
      let dot = dxui.View.build(this.id + "_corner_" + i, this.root);
      dot.setSize(S, S);
      dot.setPos(corners[i][0], corners[i][1]);
      dot.bgColor(color);
      dot.radius(0);
      dot.borderWidth(0);
      dot.padAll(0);
      dot.scroll(false);
    }
  },

  initClock: function (W, M) {
    this.clockLabel = dxui.Label.build(this.id + "_clock", this.root);
    this.clockLabel.text("2026-05-11 09:33:55");
    this.clockLabel.textColor(Theme.COLOR.CLOCK_TEXT);
    this.clockLabel.textFont(UIManager.font(Theme.FONT.CLOCK, dxui.Utils.FONT_STYLE.BOLD));
    this.clockLabel.setPos(M, 6);
  },

  initInstrumentCard: function (W, M) {
    let cardW = W - M * 2;
    let cardH = 56;
    let cardY = 32;
    let card = dxui.View.build(this.id + "_instCard", this.root);
    card.setSize(cardW, cardH);
    card.setPos(M, cardY);
    card.bgColor(Theme.COLOR.CARD);
    card.radius(Theme.LAYOUT.CARD_RADIUS);
    card.borderWidth(0);
    card.padAll(6);
    card.scroll(false);
    let label = dxui.Label.build(this.id + "_instName", card);
    label.text("激光电感等离子质谱仪");
    label.textColor(Theme.COLOR.TEXT_PRIMARY);
    label.textFont(UIManager.font(Theme.FONT.LARGE, dxui.Utils.FONT_STYLE.BOLD));
    label.textAlign(dxui.Utils.TEXT_ALIGN.CENTER);
    label.setSize(cardW - 12, cardH - 12);
    label.setPos(6, 6);
    label.longMode(dxui.Utils.LABEL_LONG_MODE.WRAP);
  },

  initStatus: function (W, M) {
    let statusY = 32 + 56 + 24;
    let textW = 220;
    let startX = Math.floor((W - textW) / 2);
    let dot = dxui.View.build(this.id + "_statusDot", this.root);
    dot.setSize(12, 12);
    dot.setPos(startX, statusY + 4);
    dot.bgColor(Theme.COLOR.SUCCESS);
    dot.radius(6);
    dot.borderWidth(0);
    dot.padAll(0);
    dot.scroll(false);
    this.statusLabel = dxui.Label.build(this.id + "_statusText", this.root);
    this.statusLabel.text("仪器正在使用中..");
    this.statusLabel.textColor(Theme.COLOR.SUCCESS);
    this.statusLabel.textFont(UIManager.font(Theme.FONT.TITLE, dxui.Utils.FONT_STYLE.BOLD));
    this.statusLabel.setPos(startX + 20, statusY);
  },

  initTimeCard: function (W, M) {
    let cardW = W - M * 2;
    let cardH = 100;
    let cardY = 32 + 56 + 24 + 30 + 8;

    let card = dxui.View.build(this.id + "_timeCard", this.root);
    card.setSize(cardW, cardH);
    card.setPos(M, cardY);
    card.bgColor(Theme.COLOR.CARD);
    card.radius(Theme.LAYOUT.CARD_RADIUS);
    card.borderWidth(0);
    card.padAll(0);
    card.scroll(false);

    let onTitle = dxui.Label.build(this.id + "_onTitle", card);
    onTitle.text("上机时间");
    onTitle.textColor(Theme.COLOR.TEXT_TERTIARY);
    onTitle.textFont(UIManager.font(Theme.FONT.CAPTION, dxui.Utils.FONT_STYLE.NORMAL));
    onTitle.align(dxui.Utils.ALIGN.TOP_MID, 0, 6);

    this.timeValueLabel = dxui.Label.build(this.id + "_onValue", card);
    this.timeValueLabel.text("----");
    this.timeValueLabel.textColor(Theme.COLOR.TEXT_PRIMARY);
    this.timeValueLabel.textFont(UIManager.font(Theme.FONT.BODY, dxui.Utils.FONT_STYLE.BOLD));
    this.timeValueLabel.align(dxui.Utils.ALIGN.TOP_MID, 0, 24);

    let usageTitle = dxui.Label.build(this.id + "_usageTitle", card);
    usageTitle.text("使用时间");
    usageTitle.textColor(Theme.COLOR.TEXT_TERTIARY);
    usageTitle.textFont(UIManager.font(Theme.FONT.CAPTION, dxui.Utils.FONT_STYLE.NORMAL));
    usageTitle.align(dxui.Utils.ALIGN.TOP_MID, 0, 52);

    this.usageLabel = dxui.Label.build(this.id + "_usageValue", card);
    this.usageLabel.text("0天0小时0分0秒");
    this.usageLabel.textColor(Theme.COLOR.PRIMARY);
    this.usageLabel.textFont(UIManager.font(Theme.FONT.BODY, dxui.Utils.FONT_STYLE.BOLD));
    this.usageLabel.align(dxui.Utils.ALIGN.TOP_MID, 0, 70);
  },

  initOffButton: function (W, M) {
    let btnW = Theme.LAYOUT.BTN_WIDTH;
    let btnH = Theme.LAYOUT.BTN_HEIGHT;
    let btnX = Math.floor((W - btnW) / 2);
    let btnY = 32 + 56 + 24 + 30 + 8 + 100 + 16;

    let self = this;
    let button = dxui.Button.build(this.id + "_offBtn", this.root);
    button.setSize(btnW, btnH);
    button.setPos(btnX, btnY);
    button.radius(Theme.LAYOUT.BTN_RADIUS);
    button.bgColor(Theme.COLOR.DESTRUCTIVE);
    button.borderWidth(0);
    button.padAll(0);

    let btnLabel = dxui.Label.build(this.id + "_offBtnLabel", button);
    btnLabel.text("下  机");
    btnLabel.textColor(Theme.COLOR.BTN_WHITE_TEXT);
    btnLabel.textFont(UIManager.font(Theme.FONT.BUTTON, dxui.Utils.FONT_STYLE.BOLD));
    btnLabel.align(dxui.Utils.ALIGN.CENTER, 0, 0);

    button.on(dxui.Utils.EVENT.CLICK, function () {
      self.handleOff();
    });
  },

  onShow: function () {
    bus.fire("gpio.on", {});
    let onTime = this.formatTime(UIManager.now());
    this.timeValueLabel.text(onTime);
    let store = map.get("qrapp");
    store.put("lastMachineOnTime", onTime);
    this.usageStartMs = Date.now();
    this.usageLabel.text("0天0小时0分0秒");
    this.startClock();
  },

  onHide: function () {
    this.stopClock();
  },

  handleOff: function () {
    bus.fire("gpio.off", {});
    let offTime = this.formatTime(UIManager.now());
    let store = map.get("qrapp");
    store.put("lastMachineOffTime", offTime);
    this.stopClock();
    std.setTimeout(function () {
      UIManager.back();
    }, 50);
  },

  startClock: function () {
    let self = this;
    this.clockTimerId = std.setInterval(function updateClock() {
      try {
        let now = UIManager.now();
        let y = now.getFullYear();
        let mo = String(now.getMonth() + 1).padStart(2, "0");
        let d = String(now.getDate()).padStart(2, "0");
        let h = String(now.getHours()).padStart(2, "0");
        let mi = String(now.getMinutes()).padStart(2, "0");
        let s = String(now.getSeconds()).padStart(2, "0");
        self.clockLabel.text(y + "-" + mo + "-" + d + " " + h + ":" + mi + ":" + s);

        let elapsed = Math.floor((Date.now() - self.usageStartMs) / 1000);
        let days = Math.floor(elapsed / 86400);
        let hours = Math.floor((elapsed % 86400) / 3600);
        let mins = Math.floor((elapsed % 3600) / 60);
        let secs = elapsed % 60;
        self.usageLabel.text(days + "天" + hours + "小时" + mins + "分" + secs + "秒");
      } catch (e) {}
    }, 1000);
  },

  stopClock: function () {
    if (this.clockTimerId) {
      std.clearInterval(this.clockTimerId);
      this.clockTimerId = null;
    }
  },

  formatTime: function (date) {
    let y = date.getFullYear();
    let mo = String(date.getMonth() + 1).padStart(2, "0");
    let d = String(date.getDate()).padStart(2, "0");
    let h = String(date.getHours()).padStart(2, "0");
    let mi = String(date.getMinutes()).padStart(2, "0");
    let s = String(date.getSeconds()).padStart(2, "0");
    return y + "-" + mo + "-" + d + " " + h + ":" + mi + ":" + s;
  }
};

export default InUsePage;
