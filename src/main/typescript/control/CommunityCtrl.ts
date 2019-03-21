import { Community, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_DRAWING, FrameEventName, CommunityData } from '../types';
import { BGControl } from "./Control";

export class CommunityCtrl extends BGControl {
    private _data: CommunityData;
    private _showOrNot = true;

    public getTypeName(): string {
        return "CommunityCtrl";
    }

    public bind(value: CommunityData) {
        this._data = value;
    }

    public toggle(showOrNot: boolean) {
        this._showOrNot = showOrNot;
    }

    onCreate(args: EVENT_ARGS_FRAME) {
        var thisCtrl = this;
        var frame = args.mainFrame;
        frame.on(FrameEventName.NETWORK_BEFORE_DRAWING, function (args: EVENT_ARGS_FRAME_DRAWING) {
            var ctx = args.context2d;
            if (thisCtrl._showOrNot && thisCtrl._data !== undefined && thisCtrl._data.communities !== undefined) {
                thisCtrl._drawZones(ctx);
            }
        });
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }

    private _drawZones(ctx: CanvasRenderingContext2D) {
        this._data.communities.forEach((zone: Community) => {
            this._drawZone(zone, ctx)
        })
    }

    private _drawZone(zone: Community, ctx: CanvasRenderingContext2D) {
        var outline = zone.outline;
        if (outline.length > 2) {
            var head = outline[0];
            var tail = outline[outline.length - 1];

            ctx.save();
            ctx.beginPath();

            ctx.moveTo(head.x, head.y);
            for (let i = 1; i < outline.length - 1; i++) {
                var node0 = outline[i]
                var node1 = outline[i + 1]
                ctx.quadraticCurveTo(node0.x, node0.y, (node0.x + node1.x) / 2, (node0.y + node1.y) / 2);
            }

            ctx.lineTo(tail.x, tail.y)
            ctx.closePath();

            ctx.fillStyle = zone.fillColor || 'rgba(135,206,250,0.2)';
            ctx.fill();
            ctx.restore();
        }
        else {
            console.log("wrong community outline");
        }
    }
}
