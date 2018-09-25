import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../mainframe";
import { FrameEventName, EVENT_ARGS_FRAME, GraphNode, RECT } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";
import { SearchBarCtrl } from "./SearchBarCtrl";

export class RelFinderDialogCtrl extends UIControl {
    private _searchBoxes: JQuery[];

    onCreateUI(htmlContainer: HTMLElement, args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        var ctrl = this;

        $(htmlContainer).addClass("relfinder-dlg").draggable();
        
        //input box
        var sbCtrl = new SearchBarCtrl();
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
                frame.fire(FrameEventName.RELFINDER_START, {
                    ctrl: ctrl,
                    maxDepth: parseInt("" + spinner.val())
                });
            });

        $('<span> </span>').appendTo($(div));

        $('<button type="button" class="btn relfinder-btn">stop</button>')
            .appendTo($(div))
            .click(function () {
                frame.fire(FrameEventName.RELFINDER_STOP, {
                    ctrl: ctrl,
                    maxDepth: parseInt("" + spinner.val())
                });
            });

        super.setPosition((frameRect: RECT, ctrlRect: RECT) => {
            return {
                x: frameRect.right - 6 - ctrlRect.right + ctrlRect.left,
                y: frameRect.top + 45
            };
        });
    }

    public getSelectedNodeIds(): string[] {
        var nodeIds: string[] = [];
        this._searchBoxes.forEach((j: JQuery) => {
            var data: GraphNode = j.data("node");
            if (data !== undefined && data !== null)
                nodeIds.push(<any>data.id);
        });

        return nodeIds;
    }

    public selectNodes(nodes: GraphNode[]) {
        var i = 0;

        this._searchBoxes.forEach((sb: JQuery) => {
            sb.val("");
            sb.data("node", null);
        });

        var ctrl = this;
        nodes.forEach((node: GraphNode) => {
            ctrl._searchBoxes[i].val(node.label);
            ctrl._searchBoxes[i].data("node", node);
            i++;
        });
    }
}
