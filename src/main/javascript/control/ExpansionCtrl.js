"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const Control_1 = require("./Control");
class ExpansionCtrl extends Control_1.BGControl {
    constructor() {
        super(...arguments);
        this._mapNodeId2ExpansionValue = new Map();
    }
    collapse(nodeId) {
        var nodeIds = (nodeId instanceof Array) ? nodeId : [nodeId];
        nodeIds.forEach((nodeId) => {
            this._mapNodeId2ExpansionValue.set(nodeId, -1);
        });
    }
    isExpanded(nodeId) {
        return this._mapNodeId2ExpansionValue.get(nodeId) != -1;
    }
    clear() {
        this._mapNodeId2ExpansionValue.clear();
    }
    expand(nodeId) {
        var thisCtrl = this;
        this._frame.getGraphService().requestGetNeighbours(nodeId, function (neighbourNodes, neighbourEdges) {
            thisCtrl._frame.insertNodes(neighbourNodes);
            thisCtrl._frame.insertEdges(neighbourEdges);
            thisCtrl._mapNodeId2ExpansionValue.set(nodeId, neighbourEdges.length);
        });
    }
    onCreate(args) {
        var frame = args.mainFrame;
        this._frame = frame;
        var thisCtrl = this;
        frame.on(types_1.FrameEventName.NETWORK_AFTER_DRAWING, function (args) {
            //draw unexpanded nodes
            var ctx = args.context2d;
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = args.theme.expansion.fontColor;
            thisCtrl._mapNodeId2ExpansionValue.forEach((v, nodeId, map) => {
                var node = frame.getNodeById(nodeId);
                if (node.hidden !== true) {
                    var nodePositions = args.network.getPositions([nodeId]);
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
                    ctx.circle(x2, y2, v == -1 ? 6 : 10);
                    ctx.fillStyle = (v == -1 ?
                        args.theme.expansion.backgroudColorCollapsed :
                        args.theme.expansion.backgroudColorExpanded);
                    ctx.fill();
                    ctx.font = "10px Arail";
                    var text = v == -1 ? "?" : "" + v;
                    ctx.strokeText(text, x2 - 2.5 * text.length, y2 - 5);
                }
            });
            ctx.restore();
        });
        //DANGER!!!
        frame.off(types_1.FrameEventName.INSERT_NODES);
        frame.on(types_1.FrameEventName.INSERT_NODES, function (args) {
            thisCtrl.collapse(args.nodes);
        });
        //browser.removeAllListeners(BrowserEventName.NETWORK_DBLCLICK);
        frame.on(types_1.FrameEventName.NETWORK_DBLCLICK, function (args) {
            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                if (!thisCtrl.isExpanded(nodeId)) {
                    thisCtrl.expand(nodeId);
                }
            });
        });
    }
    onDestroy(args) {
    }
}
exports.ExpansionCtrl = ExpansionCtrl;
