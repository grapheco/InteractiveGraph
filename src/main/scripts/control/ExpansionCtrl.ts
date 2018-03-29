import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { BrowserEventName } from '../types';
import { Connector } from '../connector/base';
import { i18n } from "../messages";
import { Control } from "./Control";

export class ExpansionCtrl extends Control {
    private _mapNodeId2ExpansionValue: Map<string, number> = new Map<string, number>();
    private _browser: MainFrame;

    public collapse(nodeId: string | string[]) {
        var nodeIds: string[] = (nodeId instanceof Array) ? nodeId : [nodeId];
        nodeIds.forEach((nodeId) => {
            this._mapNodeId2ExpansionValue.set(nodeId, -1);
        });
    }

    public isExpanded(nodeId: string) {
        return this._mapNodeId2ExpansionValue.get(nodeId) != -1;
    }

    public expand(nodeId: string) {
        var thisCtrl = this;
        this._browser.getConnector().requestGetNeighbours(
            nodeId,
            function (neighbourNodes: object[], neighbourEdges: object[]) {
                thisCtrl._browser.insertNodes(neighbourNodes);
                thisCtrl._browser.insertEdges(neighbourEdges);
                thisCtrl._mapNodeId2ExpansionValue.set(nodeId, neighbourEdges.length);
            });
    }

    public init(browser: MainFrame) {
        this._browser = browser;

        var thisCtrl = this;

        browser.on(BrowserEventName.NETWORK_AFTER_DRAWING, function (network, ctx) {
            //draw unexpanded nodes
            ctx.save();
            ctx.lineWidth = 1;
            var colors = browser.getTheme().nodeUnexpanedColor;
            ctx.strokeStyle = colors[2];

            thisCtrl._mapNodeId2ExpansionValue.forEach((v, nodeId, map) => {
                var node: any = browser.getNodeById(nodeId);
                if (node.hidden !== true) {
                    var nodePositions: any = network.getPositions([nodeId]);
                    var pos = nodePositions[nodeId];
                    /*
                    ctx.font = "20px FontAwesome";
                    ctx.strokeText(v == -1 ? "\uf0e0" : "\uf0e9", pos.x - 15, pos.y - 8);
                    ctx.font = "10px Arail";
                    ctx.strokeText(v == -1 ? "?" : "" + v, pos.x + 5, pos.y);
                    */
                    var box = network.getBoundingBox(nodeId);
                    var r = pos.y - box.top;
                    var r2 = r / 1.414;
                    var x2 = pos.x + r2;
                    var y2 = pos.y + r2;
                    ctx.circle(x2, y2, v == -1 ? 6 : 10);

                    ctx.fillStyle = v == -1 ? colors[0] : colors[1];
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
        browser.removeAllListeners(BrowserEventName.INSERT_NODES);
        browser.on(BrowserEventName.INSERT_NODES, function (network, nodeId) {
            thisCtrl.collapse(nodeId);
        });

        //browser.removeAllListeners(BrowserEventName.NETWORK_DBLCLICK);
        browser.on(BrowserEventName.NETWORK_DBLCLICK, function (network, args) {
            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                if (!thisCtrl.isExpanded(nodeId)) {
                    thisCtrl.expand(nodeId);
                }
            });
        });
    }
}