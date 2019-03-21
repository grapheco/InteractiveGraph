import { MainFrame } from "../mainframe";
import { EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_DRAWING, EVENT_ARGS_FRAME_INPUT, FrameEventName } from '../types';
import { BGControl } from "./Control";

export class ExpansionCtrl extends BGControl {
    private _mapNodeId2ExpansionValue: Map<string, number> = new Map<string, number>();
    private _frame: MainFrame;

    public collapse(nodeId: string | string[]) {
        var nodeIds: string[] = (nodeId instanceof Array) ? nodeId : [nodeId];
        nodeIds.forEach((nodeId) => {
            this._mapNodeId2ExpansionValue.set(nodeId, -1);
        });
    }

    public isExpanded(nodeId: string) {
        return this._mapNodeId2ExpansionValue.get(nodeId) != -1;
    }

    public clear() {
        this._mapNodeId2ExpansionValue.clear();
    }

    public expand(nodeId: string) {
        var thisCtrl = this;
        this._frame.getGraphService().requestGetNeighbours(
            nodeId,
            function (neighbourNodes: object[], neighbourEdges: object[]) {
                thisCtrl._frame.insertNodes(neighbourNodes);
                thisCtrl._frame.insertEdges(neighbourEdges);
                thisCtrl._mapNodeId2ExpansionValue.set(nodeId, neighbourEdges.length);
            });
    }

    public onCreate(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        this._frame = frame;
        var thisCtrl = this;

        frame.on(FrameEventName.NETWORK_AFTER_DRAWING, function (args: EVENT_ARGS_FRAME_DRAWING) {
            //draw unexpanded nodes
            var ctx = args.context2d;
            ctx.save();
            ctx.lineWidth = 1;

            ctx.strokeStyle = args.theme.expansion.fontColor;

            thisCtrl._mapNodeId2ExpansionValue.forEach((v, nodeId, map) => {
                var node: any = frame.getNodeById(nodeId);
                if (node.hidden !== true) {
                    var nodePositions: any = args.network.getPositions([nodeId]);
                    var pos = nodePositions[nodeId];
                    /*
                    ctx.font = "20px FontAwesome";
                    ctx.strokeText(v == -1 ? "\uf0e0" : "\uf0e9", pos.x - 15, pos.y - 8);
                    ctx.font = "10px Arail";
                    ctx.strokeText(v == -1 ? "?" : "" + v, pos.x + 5, pos.y);
                    */
                    var box = args.network.getBoundingBox(nodeId);
                    var r = pos.y - box.top;
                    var r2 = r / 1.414;
                    var x2 = pos.x + r2;
                    var y2 = pos.y + r2;
                    (<any>ctx).circle(x2, y2, v == -1 ? 6 : 10);

                    ctx.fillStyle = (v == -1 ?
                        args.theme.expansion.backgroudColorCollapsed :
                        args.theme.expansion.backgroudColorExpanded
                    );
                    ctx.fill();

                    ctx.font = "10px Arail";
                    var text: string = v == -1 ? "?" : "" + v;
                    ctx.strokeText(text, x2 - 2.5 * text.length, y2 - 5);
                }
            }
            );

            ctx.restore();
        });

        //DANGER!!!
        frame.off(FrameEventName.INSERT_NODES);
        frame.on(FrameEventName.INSERT_NODES, function (args: EVENT_ARGS_FRAME_INPUT) {
            thisCtrl.collapse(args.nodes);
        });

        //browser.removeAllListeners(BrowserEventName.NETWORK_DBLCLICK);
        frame.on(FrameEventName.NETWORK_DBLCLICK, function (args: EVENT_ARGS_FRAME_INPUT) {
            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                if (!thisCtrl.isExpanded(nodeId)) {
                    thisCtrl.expand(nodeId);
                }
            });
        });
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}