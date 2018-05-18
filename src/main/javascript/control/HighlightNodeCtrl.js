"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const Control_1 = require("./Control");
class HighlightNodeCtrl extends Control_1.BGControl {
    constructor() {
        super(...arguments);
        this._mapNodeId2HighlightFlag = new Map();
    }
    highlight(nodeIds) {
        var x = nodeIds instanceof Array ? nodeIds : [nodeIds];
        x.forEach((nodeId) => {
            this._mapNodeId2HighlightFlag.set(nodeId, true);
        });
    }
    toggle(nodeId) {
        var highlighted = this._mapNodeId2HighlightFlag.get(nodeId);
        if (highlighted)
            this._mapNodeId2HighlightFlag.delete(nodeId);
        else
            this._mapNodeId2HighlightFlag.set(nodeId, true);
    }
    unhighlight(nodeIds) {
        var x = nodeIds instanceof Array ? nodeIds : [nodeIds];
        x.forEach((nodeId) => {
            this._mapNodeId2HighlightFlag.delete(nodeId);
        });
    }
    clear() {
        this._mapNodeId2HighlightFlag.clear();
    }
    onCreate(args) {
        var thisCtrl = this;
        var frame = args.mainFrame;
        frame.on(types_1.FrameEventName.NETWORK_BEFORE_DRAWING, function (args) {
            var ctx = args.context2d;
            ctx.save();
            //draw highlighted nodes
            thisCtrl._mapNodeId2HighlightFlag.forEach((highlighted, nodeId, map) => {
                if (highlighted) {
                    var nodePositions = args.network.getPositions([nodeId]);
                    var node = frame.getNodeById(nodeId);
                    if (!node.hidden) {
                        var pos = nodePositions[nodeId];
                        var box = args.network.getBoundingBox(nodeId);
                        if (pos.y < box.top) {
                            console.warn("some exceptions happened");
                            console.debug(pos, box);
                            return;
                        }
                        var grd = ctx.createRadialGradient(pos.x, pos.y, pos.y - box.top, pos.x, pos.y, pos.y - box.top + 40);
                        grd.addColorStop(0, args.theme.highlight.gradientInnerColor);
                        grd.addColorStop(1, args.theme.highlight.gradientOutterColor);
                        ctx.fillStyle = grd;
                        ctx.circle(pos.x, pos.y, pos.y - box.top + 40);
                        ctx.fill();
                    }
                }
            });
            ctx.restore();
        });
        //DANGER!!!
        frame.off(types_1.FrameEventName.FOCUS_NODES);
        frame.on(types_1.FrameEventName.FOCUS_NODES, function (args) {
            thisCtrl.highlight(args.nodes);
        });
        //DANGER!!!
        frame.off(types_1.FrameEventName.NETWORK_DBLCLICK);
        frame.on(types_1.FrameEventName.NETWORK_DBLCLICK, function (args) {
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
    onDestroy(args) {
    }
}
exports.HighlightNodeCtrl = HighlightNodeCtrl;
