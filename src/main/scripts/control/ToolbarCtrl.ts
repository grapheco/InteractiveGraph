import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, BUTTON_OPTIONS, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_RESIZE, RECT } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";
import { } from "jquery";
import { } from "jqueryui";

export class ToolbarCtrl extends UIControl {
    public addTool(e: HTMLElement) {
        var container = document.createElement("span");
        $(container).addClass("ui-tool").appendTo($(this._htmlContainer));
        $(e).appendTo($(container));
    }

    public addButton(info: BUTTON_OPTIONS): HTMLElement {
        var e = document.createElement("button");

        var x: any = info;
        x.showLabel = true;
        x.label = (info.caption === undefined ? "" : info.caption);

        $(e).addClass("ui-button2")
            .appendTo($(this._htmlContainer));

        if (info.tooltip !== undefined)
            $(e).attr("title", info.tooltip);

        var span = document.createElement("span");
        if (info.icon !== undefined) {
            $(span).addClass(info.icon);
        }
        else {
            $(span).text(info.caption);
        }

        $(span).appendTo($(e));

        if (info.click !== undefined) {
            //toggle button
            if (info.checked !== undefined) {
                $(e).click(() => {
                    $(e).toggleClass("ui-button2-checked");
                    var checked = $(e).hasClass("ui-button2-checked");
                    info.click(checked);
                });
            }
            else {
                $(e).click(<any>info.click);
            }
        }

        //toggle button
        if (info.checked === true) {
            $(e).addClass("ui-button2-checked");
        }

        return e;
    }

    public addButtons(buttons: JQueryUI.ButtonOptions[]): HTMLElement[] {
        return buttons.map((button) => {
            return this.addButton(button);
        })
    }

    onCreate(args: EVENT_ARGS_FRAME) {
        var htmlCtrl = document.createElement("div");
        this._htmlContainer = htmlCtrl;
        $(htmlCtrl).addClass("toolbarPanel")
            .appendTo($(document.body));

        var div = document.createElement("div");

        $(div).attr("id", "toolbar");

        $(div).appendTo($(htmlCtrl));
        $(htmlCtrl).draggable();

        super.setPosition((frameRect: RECT, ctrlRect: RECT) => {
            return {
                x: frameRect.right - 6 - ctrlRect.right + ctrlRect.left,
                y: frameRect.top
            };
        });

        this.onResize(args);
    }

    private posite(htmlMainFrame: HTMLElement, htmlCtrl: HTMLElement) {
        var jaa = $(htmlMainFrame);
        var offset = jaa.offset();

        $(htmlCtrl).offset({
            left: offset.left + jaa.width() - $(htmlCtrl).width() - 6,
            top: offset.top
        });
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}