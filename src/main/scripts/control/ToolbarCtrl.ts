import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { BrowserEventName, ButtonOptions, EVENT_ARGS_CREATE_BUTTONS } from '../types';
import { Connector } from '../connector/base';
import { i18n } from "../messages";
import { Control } from "./Control";
import { } from "jquery";
import { } from "jqueryui";

export class ToolbarCtrl extends Control {
    private _htmlToolbar: HTMLElement;

    public addTool(f: (ctrl: ToolbarCtrl, htmlToolbar: HTMLElement) => void) {
        f(this, this._htmlToolbar);
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

        if (info.click !== undefined)
            $(e).click(<any>info.click);

        $(e).addClass("ui-button-2");
        return e;
    }

    public addButtons(buttons: JQueryUI.ButtonOptions[]): HTMLElement[] {
        return buttons.map((button) => {
            return this.addButton(button);
        })
    }

    init(browser: MainFrame) {
        var jaa = $(browser.getContainerElement());
        var offset = jaa.offset();

        var htmlCtrl = document.createElement("div");
        $(htmlCtrl).addClass("toolbarPanel")
            .offset({ left: offset.left + jaa.width() - 330, top: offset.top + 20 })
            .appendTo($(document.body));

        //<div id="toolbar" class="ui-widget-header ui-corner-all">
        var div = document.createElement("div");
        this._htmlToolbar = div;
        $(div).attr("id", "toolbar")
            .addClass("controlgroup");

        browser.emit(BrowserEventName.CREATE_BUTTONS, <EVENT_ARGS_CREATE_BUTTONS>{
            toolbar: this,
            htmlElement: div
        });

        (<any>$(".controlgroup")).controlgroup();

        $(div).appendTo($(htmlCtrl));
        $(htmlCtrl).draggable();
    }
}