import { MainFrame } from "../framework";
import * as events from "events";
import { FrameEventName, EVENT_ARGS_FRAME, RECT, POINT } from "../types";
import { Rect, Point } from "../utils";

export abstract class Control extends events.EventEmitter {
    protected _disabled: boolean = false;
    abstract onCreate(args: EVENT_ARGS_FRAME);
    abstract onDestroy(args: EVENT_ARGS_FRAME);

    constructor() {
        super();
        this.on(FrameEventName.CREATE_CONTROL, this.onCreate.bind(this));
        this.on(FrameEventName.DESTROY_CONTROL, this.onDestroy.bind(this));
    }

    public enable() {
        this._disabled = false;
    }

    public disable() {
        this._disabled = true;
    }
}

export abstract class UIControl extends Control {
    protected _htmlContainer: HTMLElement;
    protected _position: (frameRect: RECT, ctrlRect: RECT) => POINT;

    constructor() {
        super();
        //resize
        this.on(FrameEventName.FRAME_RESIZE, this.onResize.bind(this));
    }

    public show() {
        $(this._htmlContainer).show();
    }

    public setPosition(position: (frameRect: RECT, ctrlRect: RECT) => POINT) {
        this._position = position;
    }

    public hide() {
        $(this._htmlContainer).hide();
    }

    public onResize(args: EVENT_ARGS_FRAME) {
        if (this._position !== undefined) {
            var a = $(args.htmlMainFrame);
            var b = $(this._htmlContainer);
            var oa = a.offset();
            var ob = b.offset();

            var offset = this._position(
                { left: oa.left, top: oa.top, right: oa.left + a.width(), bottom: oa.top + a.height() },
                { left: ob.left, top: ob.top, right: ob.left + b.width(), bottom: ob.top + b.height() }
            );

            if (offset !== undefined) {
                b.offset({
                    left: offset.x,
                    top: offset.y
                });
            }
        }
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
        $(this._htmlContainer).hide();
        $(this._htmlContainer).remove();
    }
}