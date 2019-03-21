import { i18n } from "../messages";
import { EVENT_ARGS_FRAME } from '../types';
import { UIControl } from "./Control";
import { MainFrame } from "../mainframe";

export class MessageBoxCtrl extends UIControl {
    private _htmlFrame: HTMLElement;

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
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