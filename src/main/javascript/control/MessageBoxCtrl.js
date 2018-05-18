"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
const Control_1 = require("./Control");
class MessageBoxCtrl extends Control_1.UIControl {
    onCreateUI(htmlContainer, args) {
        //message bar
        this._htmlFrame = args.htmlMainFrame;
        $(htmlContainer).addClass("messageBox").hide();
    }
    showMessage(msgCode) {
        var jaa = $(this._htmlFrame);
        var box = $(this._htmlContainer);
        var pos = jaa.position();
        var left = pos.left + (jaa.width() - box.width()) / 2;
        var top = pos.top + (jaa.height() - box.height()) / 2;
        box.css("left", left)
            .css("top", top)
            .css("text-align", "center")
            .html("<i class='fa fa-spinner fa-spin'></i> " + messages_1.i18n.getMessage(msgCode)).
            show();
    }
    hideMessage() {
        super.hide();
    }
    onResize(args) {
    }
}
exports.MessageBoxCtrl = MessageBoxCtrl;
