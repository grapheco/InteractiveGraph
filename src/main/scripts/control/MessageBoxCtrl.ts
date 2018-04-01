import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, EVENT_ARGS_FRAME } from '../types';
import { Connector } from '../connector/connector';
import { i18n } from "../messages";
import { Control } from "./Control";

export class MessageBoxCtrl extends Control {
    private _jqueryMessageBox: JQuery<HTMLElement>;
    private _htmlFrame: HTMLElement;

    onCreate(args: EVENT_ARGS_FRAME) {
        //message bar
        this._htmlFrame = args.htmlFrame;
        this._jqueryMessageBox = $(document.createElement("div"))
            .addClass("messageBox")
            .appendTo($(document.body))
            .hide();
    }

    public showMessage(msgCode: string) {
        var jaa = $(this._htmlFrame);
        var pos = jaa.position();
        var left = pos.left + (jaa.width() - this._jqueryMessageBox.width()) / 2;
        var top = pos.top + (jaa.height() - this._jqueryMessageBox.height()) / 2;

        this._jqueryMessageBox.css("left", left)
            .css("top", top)
            .css("text-align", "center")
            .html("<i class='fa fa-spinner fa-spin'></i> " + i18n.getMessage(msgCode)).
            show();
    }

    public hideMessage() {
        this._jqueryMessageBox.hide();
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}