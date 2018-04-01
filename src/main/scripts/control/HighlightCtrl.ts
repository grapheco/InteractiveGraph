import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, EVENT_ARGS_FRAME_DRAWING, EVENT_ARGS_FRAME_INPUT, EVENT_ARGS_FRAME } from '../types';
import { Connector } from '../connector/connector';
import { i18n } from "../messages";
import { Control } from "./Control";

export class HighlightCtrl extends Control {
    private _mapNodeId2HighlightFlag: Map<string, boolean> = new Map<string, boolean>();

    public highlight(nodeIds: string | string[]) {
        var x: string[] = nodeIds instanceof Array ? nodeIds : [nodeIds];
        x.forEach((nodeId) => {
            this._mapNodeId2HighlightFlag.set(nodeId, true);
        });
    }

    public toggle(nodeId: string) {
        var highlighted = this._mapNodeId2HighlightFlag.get(nodeId);
        if (highlighted)
            this._mapNodeId2HighlightFlag.delete(nodeId);
        else
            this._mapNodeId2HighlightFlag.set(nodeId, true);
    }

    public unhighlight(nodeIds: string | string[]) {
        var x: string[] = nodeIds instanceof Array ? nodeIds : [nodeIds];
        x.forEach((nodeId) => {
            this._mapNodeId2HighlightFlag.delete(nodeId);
        });
    }

    public unhighlightAll() {
        this._mapNodeId2HighlightFlag.clear();
    }

    onCreate(args: EVENT_ARGS_FRAME) {
        var thisCtrl = this;
        var frame = args.frame;
        frame.on(FrameEventName.NETWORK_BEFORE_DRAWING, function (args: EVENT_ARGS_FRAME_DRAWING) {
            var ctx = args.context2d;
            ctx.save();
            //draw highlighted nodes
            thisCtrl._mapNodeId2HighlightFlag.forEach((highlighted, nodeId, map) => {
                if (highlighted) {
                    var nodePositions: any = args.network.getPositions([nodeId]);
                    var colors = args.theme.nodeHighlightColor;

                    var node: any = frame.getNodeById(nodeId);
                    if (!node.hidden) {
                        var pos = nodePositions[nodeId];
                        var box = args.network.getBoundingBox(nodeId);

                        if (pos.y < box.top) {
                            console.warn("some exceptions happened");
                            console.debug(pos, box);
                            return;
                        }

                        var grd = ctx.createRadialGradient(pos.x, pos.y, pos.y - box.top,
                            pos.x, pos.y, pos.y - box.top + 40);
                        grd.addColorStop(0, colors[0]);
                        grd.addColorStop(1, colors[1]);


                        ctx.fillStyle = grd;
                        (<any>ctx).circle(pos.x, pos.y, pos.y - box.top + 40);
                        ctx.fill();
                    }
                }
            });

            ctx.restore();
        });

        //DANGER!!!
        frame.off(FrameEventName.FOCUS_NODES);
        frame.on(FrameEventName.FOCUS_NODES, function (args: EVENT_ARGS_FRAME_INPUT) {
            thisCtrl.highlight(args.nodes);
        });

        //DANGER!!!
        frame.off(FrameEventName.NETWORK_DBLCLICK);
        frame.on(FrameEventName.NETWORK_DBLCLICK, function (args: EVENT_ARGS_FRAME_INPUT) {
            //double click on backgroud (no nodes selected)
            if (args.nodes.length == 0 && args.edges.length == 0) {
                thisCtrl._mapNodeId2HighlightFlag.clear();
                return;
            }

            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                thisCtrl.toggle(nodeId);
            });
        });
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}
