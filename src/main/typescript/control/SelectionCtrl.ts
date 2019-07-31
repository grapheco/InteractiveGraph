import { EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_DRAWING, EVENT_ARGS_FRAME_INPUT, FrameEventName } from '../types';
import { BGControl } from "./Control";

export class SelectionCtrl extends BGControl {
    private _mapNodeId2SelectionFlag: Map<string, boolean> = new Map<string, boolean>();

    public getTypeName(): string {
        return "SelectionCtrl";
    }

    public flagNodes(nodeIds: string | string[]) {
        var x: string[] = nodeIds instanceof Array ? nodeIds : [nodeIds];
        x.forEach((nodeId) => {
            this._mapNodeId2SelectionFlag.set(nodeId, true);
        });
    }

    public unflagNodes(nodeIds: string | string[]) {
        var x: string[] = nodeIds instanceof Array ? nodeIds : [nodeIds];
        x.forEach((nodeId) => {
            this._mapNodeId2SelectionFlag.set(nodeId, false);
        });
    }

    public clear() {
        this._mapNodeId2SelectionFlag.clear();
    }

    onCreate(args: EVENT_ARGS_FRAME) {
        var thisCtrl = this;
        var frame = args.mainFrame;

        thisCtrl.on(FrameEventName.FRAME_CLEAR_ALL_FLAGS, function (args) {
            thisCtrl.clear();
        });

        frame.on(FrameEventName.NETWORK_AFTER_DRAWING, function (args: EVENT_ARGS_FRAME_DRAWING) {
            var ctx = args.context2d;
            ctx.save();
            //draw highlighted nodes
            thisCtrl._mapNodeId2SelectionFlag.forEach((highlighted, nodeId, map) => {
                if (highlighted) {
                    var nodePositions: any = args.network.getPositions([nodeId]);

                    var node: any = frame.getNodeById(nodeId);
                    if (node != null && !node.hidden) {
                        var nodePositions: any = args.network.getPositions([nodeId]);
                        var pos = nodePositions[nodeId];
                        if (pos != undefined) {
                            var box = args.network.getBoundingBox(nodeId);
                            var r = pos.y - box.top;
                            var r2 = r / 1.414;
                            var x2 = pos.x + r2;
                            var y2 = pos.y - r2;
                            ctx.font = "30px FontAwesome";
                            //ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
                            ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
                            //ctx.strokeText("\uf11e", x2 - 5, y2 - 5);
                            ctx.fillText("\uf041", x2 - 5, y2 - 5);
                        }
                    }
                }
            });

            ctx.restore();
        });
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}
