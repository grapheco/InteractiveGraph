import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, ButtonOptions, EVENT_ARGS_FRAME } from '../types';
import { Connector } from '../connector/connector';
import { i18n } from "../messages";
import { Control } from "./Control";
import { } from "jquery";
import { } from "jqueryui";

export class ToolbarCtrl extends Control {
    private _htmlToolbar: HTMLElement;

    public addTool(e: HTMLElement){
        $(e).appendTo($(this._htmlToolbar));
    }

    public addButton(info: ButtonOptions): HTMLElement {
        var e = document.createElement("button");

        var x: any = info;
        x.showLabel = true;
        x.label = (info.caption === undefined ? "" : info.caption);

        $(e).appendTo($(this._htmlToolbar))
            .button(x);

        if (info.tooltip !== undefined)
            $(e).attr("title", info.tooltip);

        //fa icons
        var span = $("span", e);

        //ui-icon conflicts with fa, remove it! 
        if (span.hasClass("fa")) {
            span.removeClass("ui-icon");
        }

        if (info.click !== undefined) {
            //toggle button
            if (info.checked !== undefined) {
                $(e).click(() => {
                    $(e).toggleClass("ui-button-checked");
                    var checked = $(e).hasClass("ui-button-checked");
                    info.click(checked);
                });
            }
            else {
                $(e).click(<any>info.click);
            }
        }

        $(e).addClass("ui-button-2");

        //toggle button
        if (info.checked === true) {
            $(e).addClass("ui-button-checked");
        }

        return e;
    }

    public addButtons(buttons: JQueryUI.ButtonOptions[]): HTMLElement[] {
        return buttons.map((button) => {
            return this.addButton(button);
        })
    }

    onCreate(args: EVENT_ARGS_FRAME) {
        var jaa = $(args.htmlFrame);
        var offset = jaa.offset();

        var htmlCtrl = document.createElement("div");
        $(htmlCtrl).addClass("toolbarPanel")
            .offset({ left: offset.left + jaa.width() - 400, top: offset.top + 20 })
            .appendTo($(document.body));

        //<div id="toolbar" class="ui-widget-header ui-corner-all">
        var div = document.createElement("div");
        this._htmlToolbar = div;
        $(div).attr("id", "toolbar")
            .addClass("controlgroup");

        (<any>$(".controlgroup")).controlgroup();

        $(div).appendTo($(htmlCtrl));
        $(htmlCtrl).draggable();
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}