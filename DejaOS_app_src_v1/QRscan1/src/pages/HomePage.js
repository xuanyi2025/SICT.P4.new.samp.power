import dxui from "../../dxmodules/dxUi.js";
import dxDriver from "../../dxmodules/dxDriver.js";
import log from "../../dxmodules/dxLogger.js";
import bus from "../../dxmodules/dxEventBus.js";
import map from "../../dxmodules/dxMap.js";
import std from "../../dxmodules/dxStd.js";
import UIManager from "../UIManager.js";
import Theme from "../Theme.js";

const HomePage = {
  id: "homePage",
  clockTimerId: null,
  qrObj: null,
  scanLocked: false,
  scanResumeTimer: null,
  scanUnlockTimer: null,

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

    this.initBgImage(W, H);
    this.initCorners(W, H);
    this.initClock(W, M);
    this.initInstrumentCard(W, M);
    this.initBottomRow(W, H, M);
    return this.root;
  },

  initBgImage: function (W, H) {
    let bg = dxui.Image.build(this.id + "_bg", this.root);
    bg.setSize(W, H);
    bg.setPos(0, 0);
    bg.source("/app/code/bg1.png");
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
    this.clockLabel.textColor(0xFFFFFF);
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
    card.bgColor(0xFFFFFF);
    card.bgOpa(30);
    card.radius(Theme.LAYOUT.CARD_RADIUS);
    card.borderWidth(0);
    card.padAll(6);
    card.scroll(false);
    let label = dxui.Label.build(this.id + "_instName", card);
    label.text("激光电感等离子质谱仪");
    label.textColor(0xFFFFFF);
    label.textFont(UIManager.font(Theme.FONT.LARGE, dxui.Utils.FONT_STYLE.BOLD));
    label.textAlign(dxui.Utils.TEXT_ALIGN.CENTER);
    label.setSize(cardW - 12, cardH - 12);
    label.setPos(6, 6);
    label.longMode(dxui.Utils.LABEL_LONG_MODE.WRAP);
  },

  initBottomRow: function (W, H, M) {
    let rowY = 32 + 56 + M;
    let rowH = H - rowY - M;
    let cardW = Math.floor((W - M * 3) / 2);
    let qrX = M + cardW + M;

    let scanCard = dxui.View.build(this.id + "_scanCard", this.root);
    scanCard.setSize(cardW, rowH);
    scanCard.setPos(M, rowY);
    scanCard.bgColor(Theme.COLOR.CARD);
    scanCard.radius(Theme.LAYOUT.CARD_RADIUS);
    scanCard.borderWidth(0);
    scanCard.padAll(12);
    scanCard.scroll(false);

    this.scanStatusLabel = dxui.Label.build(this.id + "_scanStatus", scanCard);
    this.scanStatusLabel.text("● 扫描中...");
    this.scanStatusLabel.textColor(Theme.COLOR.PRIMARY);
    this.scanStatusLabel.textFont(UIManager.font(Theme.FONT.TITLE, dxui.Utils.FONT_STYLE.BOLD));
    this.scanStatusLabel.setPos(12, 16);

    let sep = dxui.View.build(this.id + "_scanSep", scanCard);
    sep.setSize(cardW - 24, 1);
    sep.setPos(12, 52);
    sep.bgColor(Theme.COLOR.SEPARATOR);
    sep.radius(0);
    sep.borderWidth(0);
    sep.padAll(0);
    sep.scroll(false);

    this.decodeLabel = dxui.Label.build(this.id + "_decodeResult", scanCard);
    this.decodeLabel.text("");
    this.decodeLabel.textColor(Theme.COLOR.TEXT_SECONDARY);
    this.decodeLabel.textFont(UIManager.font(Theme.FONT.BODY, dxui.Utils.FONT_STYLE.NORMAL));
    this.decodeLabel.setPos(12, 64);

    let qrCard = dxui.View.build(this.id + "_qrCard", this.root);
    qrCard.setSize(cardW, rowH);
    qrCard.setPos(qrX, rowY);
    qrCard.bgColor(Theme.COLOR.CARD);
    qrCard.radius(Theme.LAYOUT.CARD_RADIUS);
    qrCard.borderWidth(0);
    qrCard.padAll(0);
    qrCard.scroll(false);

    let size = Math.min(cardW, rowH);
    this.qrObj = dxui.Utils.GG.NativeBasicComponent.lvQrcodeCreate(qrCard.obj, size, Theme.COLOR.QR_DARK, Theme.COLOR.QR_LIGHT);
  },

  renderQR: function (text) {
    if (!this.qrObj) return;
    let rawText = text || "2026-05-11 09:33:55@2026-05-12 09:33:55@500236";
    dxui.Utils.GG.NativeBasicComponent.lvQrcodeUpdate(this.qrObj, rawText);
  },

  onShow: function () {
    let self = this;
    this.scanResumeTimer = std.setTimeout(function () {
      bus.fire("barcode.resume", {});
      self.scanUnlockTimer = std.setTimeout(function () {
        self.scanLocked = false;
      }, 600);
    }, 800);
    this.decodeLabel.text("");
    let store = map.get("qrapp");
    let onTime = store.get("lastMachineOnTime");
    let offTime = store.get("lastMachineOffTime");
    if (onTime && offTime) {
      this.renderQR(onTime + "@" + offTime + "@500236");
    } else {
      this.renderQR("2026-05-11 09:33:55@2026-05-12 09:33:55@500236");
    }
    this.startClock();
  },

  onHide: function () {
    this.stopClock();
    if (this.scanResumeTimer) {
      std.clearTimeout(this.scanResumeTimer);
      this.scanResumeTimer = null;
    }
    if (this.scanUnlockTimer) {
      std.clearTimeout(this.scanUnlockTimer);
      this.scanUnlockTimer = null;
    }
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
      } catch (e) {}
    }, 1000);
  },

  stopClock: function () {
    if (this.clockTimerId) {
      std.clearInterval(this.clockTimerId);
      this.clockTimerId = null;
    }
  },

  onQrDecoded: function (data) {
    if (this.scanLocked) return;
    let text = data.text;
    this.decodeLabel.text(text);
    if (text === "500236") {
      this.scanLocked = true;
      this.decodeLabel.text("");
      bus.fire("barcode.pause", {});
      std.setTimeout(function () {
        UIManager.open("inuse");
      }, 300);
    }
  }
};

export default HomePage;
