import { Utils, Rect, Point } from "./utils";
import { GraphBrowser } from "./browser";
import { BrowserEventName } from './types';

export interface NodeFlagType<T> {
    clear();
    unset(nodeId: string);
    getMarkedNodeIds(valueFilter?: (t: T) => boolean): string[];
    set(nodeId: string, value?: any);
    has(nodeId: string): boolean;
    get(nodeId: string): any;
    init(browser: GraphBrowser);
}

abstract class NodeFlagTypeBase<T>{
    protected _mapNodeId2FlagValue: Map<string, T> = new Map<string, T>();
    abstract getDefaultValue(): T;

    getMarkedNodeIds(valueFilter?: (t: T) => boolean): string[] {
        if (valueFilter === undefined)
            return Utils.toArray(this._mapNodeId2FlagValue.keys());

        var nodeIds = [];
        this._mapNodeId2FlagValue.forEach((v, k, map) => {
            if (valueFilter(v))
                nodeIds.push(k);
        });

        return nodeIds;
    }

    unset(nodeId: string) {
        this._mapNodeId2FlagValue.delete(nodeId);
    }

    clear() {
        this._mapNodeId2FlagValue.clear();
    }

    set(nodeId: string, value?: any) {
        if (value === undefined)
            value = this.getDefaultValue();

        this._mapNodeId2FlagValue.set(nodeId, value);
    }

    has(nodeId: string): boolean {
        return this._mapNodeId2FlagValue.has(nodeId);
    }

    get(nodeId: string): any {
        return this._mapNodeId2FlagValue.get(nodeId);
    }
}

export class NodeExpansionFlagType extends NodeFlagTypeBase<number>
    implements NodeFlagType<number>{
    getDefaultValue() {
        return -1;
    }

    init(browser: GraphBrowser) {
        var thisFlag = this;

        browser.on(BrowserEventName.NETWORK_AFTER_DRAWING, function (network, ctx) {
            //draw unexpanded nodes
            ctx.save();
            ctx.lineWidth = 1;
            var colors = browser.getTheme().nodeUnexpanedColor;
            ctx.strokeStyle = colors[2];

            thisFlag._mapNodeId2FlagValue.forEach((v, k, map) => {
                var nodeId = k;
                var node: any = browser.getNodeById(nodeId);
                if (!node.hidden) {
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
                    ctx.circle(x2, y2, 10);

                    ctx.fillStyle = v == -1 ? colors[0] : colors[1];
                    ctx.fill();

                    ctx.font = "10px Arail";
                    var text: string = v == -1 ? "?" : "" + v;
                    ctx.strokeText(text, x2 - 2.5 * text.length, y2 - 5);
                }
            }
            );

            ctx.restore();
            return true;
        });

        browser.on(BrowserEventName.NETWORK_DBLCLICK, function (network, args) {
            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                if (thisFlag.get(nodeId) == -1) {
                    browser.expandNode(nodeId);
                }
            });
        });
    }
}

export class NodeHighlightFlagType extends NodeFlagTypeBase<number>
    implements NodeFlagType<number>{

    getDefaultValue() {
        return 0;
    }

    init(browser: GraphBrowser) {
        var thisFlag = this;

        browser.on(BrowserEventName.NETWORK_BEFORE_DRAWING, function (network, ctx) {
            //draw highlighted nodes
            var nodeIds = thisFlag.getMarkedNodeIds((value: number) => {
                return value == 1;
            });

            if (nodeIds.length > 0) {
                var nodePositions: any = network.getPositions(nodeIds);
                var colors = browser.getTheme().nodeHighlightColor;

                for (let nodeId in nodePositions) {
                    var node: any = browser.getNodeById(nodeId);
                    if (node.hidden)
                        continue;

                    var pos = nodePositions[nodeId];
                    var box = network.getBoundingBox(nodeId);

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

        browser.on(BrowserEventName.NETWORK_DBLCLICK, function (network, args) {
            //double click on backgroud (no nodes selected)
            if (args.nodes.length == 0 && args.edges.length == 0) {
                thisFlag.clear();
                return;
            }

            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                //only with this flag
                console.log(browser.getFlags(nodeId));
                var flags = browser.getFlags(nodeId);
                //flags=["HIGHLIGHT"], ok
                //flags=[],ok
                if (flags.length == 0 || flags.length == 1 && flags[0] == "HIGHLIGHT") {
                    if (thisFlag.get(nodeId) != 1) {
                        thisFlag.set(nodeId, 1);
                    }
                    else {
                        thisFlag.set(nodeId, 0);
                    }
                }
            });
        });
    }
}