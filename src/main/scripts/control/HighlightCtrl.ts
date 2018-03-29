import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { BrowserEventName } from '../types';
import { Connector } from '../connector/base';
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

    init(browser: MainFrame) {
        var thisCtrl = this;

        browser.on(BrowserEventName.NETWORK_BEFORE_DRAWING, function (network, ctx) {
            ctx.save();
            //draw highlighted nodes
            thisCtrl._mapNodeId2HighlightFlag.forEach((highlighted, nodeId, map) => {
                if (highlighted) {
                    var nodePositions: any = network.getPositions([nodeId]);
                    var colors = browser.getTheme().nodeHighlightColor;

                    var node: any = browser.getNodeById(nodeId);
                    if (!node.hidden) {
                        var pos = nodePositions[nodeId];
                        var box = network.getBoundingBox(nodeId);

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
                        ctx.circle(pos.x, pos.y, pos.y - box.top + 40);
                        ctx.fill();
                    }
                }
            });

            ctx.restore();
        });

        //DANGER!!!
        browser.removeAllListeners(BrowserEventName.FOCUS_NODES);
        browser.on(BrowserEventName.FOCUS_NODES, function (network, nodeIds) {
            thisCtrl.highlight(nodeIds);
        });

        //DANGER!!!
        browser.removeAllListeners(BrowserEventName.NETWORK_DBLCLICK);
        browser.on(BrowserEventName.NETWORK_DBLCLICK, function (network, args) {
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
}
