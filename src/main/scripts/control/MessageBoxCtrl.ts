import { Utils, Rect, Point } from "../utils";
import { GraphBrowser } from "../browser";
import { BrowserEventName } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control } from "./Control";

export class MessageBoxCtrl implements Control {
    private _jqueryMessageBox: JQuery<HTMLElement>;
    private _browser:GraphBrowser;

    init(browser: GraphBrowser, network: vis.Network, service: GraphService) {
        //message bar
        this._browser = browser;
        this._jqueryMessageBox = $(document.createElement("div"))
            .addClass("messageBox")
            .appendTo($(document.body))
            .hide();
    }

    public showMessage(msgCode: string) {
        var jaa = $(this._browser.getContainerElement());
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
}