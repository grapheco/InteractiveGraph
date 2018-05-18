"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Control_1 = require("./Control");
class ToolbarCtrl extends Control_1.UIControl {
    addTool(e) {
        var container = document.createElement("span");
        $(container).addClass("ui-tool").appendTo($(this._htmlContainer));
        $(e).appendTo($(container));
    }
    addButton(info) {
        var e = document.createElement("button");
        var x = info;
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
                $(e).click(info.click);
            }
        }
        //toggle button
        if (info.checked === true) {
            $(e).addClass("ui-button2-checked");
        }
        return e;
    }
    addButtons(buttons) {
        return buttons.map((button) => {
            return this.addButton(button);
        });
    }
    onCreateUI(htmlContainer, args) {
        $(htmlContainer).addClass("toolbarPanel");
        var div = document.createElement("div");
        $(div).attr("id", "toolbar");
        $(div).appendTo($(htmlContainer));
        $(htmlContainer).draggable();
        super.setPosition((frameRect, ctrlRect) => {
            return {
                x: frameRect.right - 6 - ctrlRect.right + ctrlRect.left,
                y: frameRect.top
            };
        });
    }
    posite(htmlMainFrame, htmlCtrl) {
        var jaa = $(htmlMainFrame);
        var offset = jaa.offset();
        $(htmlCtrl).offset({
            left: offset.left + jaa.width() - $(htmlCtrl).width() - 6,
            top: offset.top
        });
    }
    onDestroy(args) {
    }
}
exports.ToolbarCtrl = ToolbarCtrl;
