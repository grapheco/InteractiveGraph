import { EVENT_ARGS_FRAME, EVENT_ARGS_RELFINDER, FrameEventName, GraphNode, RECT } from '../types';
import { UIControl } from "./Control";
import { SearchBoxCtrl } from "./SearchBoxCtrl";
import { MainFrame } from '../mainframe';

export class RelFinderDialogCtrl extends UIControl {

    private _searchBoxes: JQuery[];

    public getTypeName(): string {
        return "RelFinderDialogCtrl";
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        var ctrl = this;

        this._searchBoxes = [];
        $(".relfinder-searchbox-container", htmlContainer).each(function () {
            var sbctrl = new SearchBoxCtrl();
            sbctrl.bindElement(this, frame, args);
            ctrl._searchBoxes.push(sbctrl._input);
        });

        var spinner = $(".relfinder-depth-spinner", htmlContainer)
            .val(3).spinner({ min: 1, max: 8 });

        var btnStart = $(".relfinder-btn-start", htmlContainer)
            .click(function () {
                frame.fire(FrameEventName.RELFINDER_START, {
                    ctrl: ctrl,
                    maxDepth: parseInt("" + spinner.val())
                });
            });

        var btnStop = $(".relfinder-btn-stop", htmlContainer)
            .click(function () {
                frame.fire(FrameEventName.RELFINDER_STOP, {
                    ctrl: ctrl,
                    maxDepth: parseInt("" + spinner.val())
                });
            });

        this.on(FrameEventName.RELFINDER_STARTED, (args: EVENT_ARGS_RELFINDER) => {
            btnStart.attr("disabled", "disabled");
            btnStop.removeAttr("disabled");
        })

        this.on(FrameEventName.RELFINDER_STOPPED, (args: EVENT_ARGS_RELFINDER) => {
            btnStop.attr("disabled", "disabled");
            btnStart.removeAttr("disabled");
        })

        this.on(FrameEventName.FRAME_CLEAR_ALL_FLAGS, function (args) {
            this.selectNodes([]);
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
