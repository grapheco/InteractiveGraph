import { BUTTON_OPTIONS, EVENT_ARGS_FRAME, RECT } from '../types';
import { UIControl } from "./Control";
import "jquery";
import "jqueryui";

export class ToolbarCtrl extends UIControl {
    public getTypeName(): string {
        return "ToolbarCtrl";
    }

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

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}