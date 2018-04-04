import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../mainframe";
import { FrameEventName, EVENT_ARGS_FRAME } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";

export class MessageBoxCtrl extends UIControl {
    private _htmlFrame: HTMLElement;

    onCreateUI(htmlContainer: HTMLElement, args: EVENT_ARGS_FRAME) {
        //message bar
        this._htmlFrame = args.htmlMainFrame;
        $(htmlContainer).addClass("messageBox").hide();
    }

    public showMessage(msgCode: string) {
        var jaa = $(this._htmlFrame);
        var box = $(this._htmlContainer);

        var pos = jaa.position();
        var left = pos.left + (jaa.width() - box.width()) / 2;
        var top = pos.top + (jaa.height() - box.height()) / 2;

        box.css("left", left)
            .css("top", top)
            .css("text-align", "center")
            .html("<i class='fa fa-spinner fa-spin'></i> " + i18n.getMessage(msgCode)).
            show();
    }

    public hideMessage() {
        super.hide();
    }

    public onResize(args: EVENT_ARGS_FRAME) {

    }
}