"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const Control_1 = require("./Control");
const SearchBarCtrl_1 = require("./SearchBarCtrl");
class RelFinderDialogCtrl extends Control_1.UIControl {
    onCreateUI(htmlContainer, args) {
        var frame = args.mainFrame;
        var ctrl = this;
        $(htmlContainer).addClass("relfinder-dlg").draggable();
        //input box
        var sbCtrl = new SearchBarCtrl_1.SearchBarCtrl();
        var icons = ["fa-flag", "fa-flag-checkered"];
        this._searchBoxes = [];
        for (var m = 0; m < 2; m++) {
            var line = document.createElement("div");
            $(line).addClass("line").appendTo($(htmlContainer));
            $('<span class="fa relfinder-icon"></span>')
                .addClass(icons[m])
                .appendTo($(line));
            var span = $('<div class="relfinder-searchbox-container"></div>');
            span.appendTo($(line));
            var sb = $(sbCtrl.createSearchBox(frame));
            sb.appendTo($(span));
            this._searchBoxes.push(sb);
        }
        //maxdepth spinner
        var line = document.createElement("div");
        $(line).addClass("line").appendTo($(htmlContainer));
        $(document.createElement("label")).text("maxdepth: ").appendTo($(line));
        var spinner = $(document.createElement("input"))
            .attr("size", 10)
            .val(3)
            .appendTo($(line))
            .spinner({
            min: 1,
            max: 8
        });
        //buttons: start/stop
        var div = $('<p align="center"></p>');
        div.appendTo($(htmlContainer));
        $('<button type="button" class="btn relfinder-btn">find relations</button>')
            .appendTo($(div))
            .click(function () {
            frame.fire(types_1.FrameEventName.RELFINDER_START, {
                ctrl: ctrl,
                maxDepth: parseInt("" + spinner.val())
            });
        });
        $('<span> </span>').appendTo($(div));
        $('<button type="button" class="btn relfinder-btn">stop</button>')
            .appendTo($(div))
            .click(function () {
            frame.fire(types_1.FrameEventName.RELFINDER_STOP, {
                ctrl: ctrl,
                maxDepth: parseInt("" + spinner.val())
            });
        });
        super.setPosition((frameRect, ctrlRect) => {
            return {
                x: frameRect.right - 6 - ctrlRect.right + ctrlRect.left,
                y: frameRect.top + 45
            };
        });
    }
    getSelectedNodeIds() {
        var nodeIds = [];
        this._searchBoxes.forEach((j) => {
            var data = j.data("node");
            if (data !== undefined && data !== null)
                nodeIds.push(data.id);
        });
        return nodeIds;
    }
    selectNodes(nodes) {
        var i = 0;
        this._searchBoxes.forEach((sb) => {
            sb.val("");
            sb.data("node", null);
        });
        var ctrl = this;
        nodes.forEach((node) => {
            ctrl._searchBoxes[i].val(node.label);
            ctrl._searchBoxes[i].data("node", node);
            i++;
        });
    }
}
exports.RelFinderDialogCtrl = RelFinderDialogCtrl;
