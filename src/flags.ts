import { Utils, Rect, Point } from "./utils";
import { GraphBrowser } from "./browser";

export interface NodeFlag<T> {
    clear();
    unset(nodeId: string);
    getMarkedNodeIds(): string[];
    set(nodeId: string, value?: any);
    has(nodeId: string): boolean;
    get(nodeId: string): any;
    beforeDrawing(browser: GraphBrowser, ctx): boolean;
    afterDrawing(browser: GraphBrowser, ctx): boolean;
}

abstract class NodeFlagBase<T>{
    protected _mapNodeId2FlagValue: Map<string, T> = new Map<string, T>();
    abstract getDefaultValue(): T;

    getMarkedNodeIds(): string[] {
        return Utils.toArray(this._mapNodeId2FlagValue.keys());
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

export class NodeExpansionFlag extends NodeFlagBase<number> implements NodeFlag<number>{
    getDefaultValue() {
        return -1;
    }

    beforeDrawing(browser: GraphBrowser, ctx): boolean {
        return true;
    }

    afterDrawing(browser: GraphBrowser, ctx): boolean {
        //draw unexpanded nodes
        ctx.save();
        ctx.lineWidth = 1;
        var colors = browser._theme.nodeUnexpanedColor;
        ctx.strokeStyle = colors[2];

        this._mapNodeId2FlagValue.forEach((v, k, map) => {
            var nodeId = k;
            var node: any = browser._nodes.get(nodeId);
            if (!node.hidden) {
                var nodePositions: any = browser._network.getPositions([nodeId]);
                var pos = nodePositions[nodeId];
                /*
                ctx.font = "20px FontAwesome";
                ctx.strokeText(v == -1 ? "\uf0e0" : "\uf0e9", pos.x - 15, pos.y - 8);
                ctx.font = "10px Arail";
                ctx.strokeText(v == -1 ? "?" : "" + v, pos.x + 5, pos.y);
                */
                var box = browser._network.getBoundingBox(nodeId);
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
    }
}

export class NodeHighlightFlag extends NodeFlagBase<number> implements NodeFlag<number>{
    getDefaultValue() {
        return 0;
    }

    beforeDrawing(browser: GraphBrowser, ctx): boolean {
        //draw highlighted nodes
        var nodeIds = this.getMarkedNodeIds();
        /*
        nodeIds.forEach(nodeId => {
            var box = browser._network.getBoundingBox(nodeId);
            ctx.fillRect(box.left - 10, box.top - 10, box.right - box.left + 20, box.bottom - box.top + 20);
            //ctx.fill();
        });
        */
        if (nodeIds.length > 0) {
            var nodePositions: any = browser._network.getPositions(nodeIds);
            var colors = browser._theme.nodeHighlightColor;

            for (let nodeId in nodePositions) {
                var node: any = browser._nodes.get(nodeId);
                if (node.hidden)
                    continue;

                var pos = nodePositions[nodeId];
                var box = browser._network.getBoundingBox(nodeId);

                var grd = ctx.createRadialGradient(pos.x, pos.y, pos.y - box.top,
                    pos.x, pos.y, pos.y - box.top + 40);
                grd.addColorStop(0, colors[0]);
                grd.addColorStop(1, colors[1]);

                ctx.fillStyle = grd;
                ctx.circle(pos.x, pos.y, pos.y - box.top + 40);
                ctx.fill();
            }
        }

        return true;
    }

    afterDrawing(browser: GraphBrowser, ctx): boolean {
        return true;
    }
}