import * as events from "events";
import { MainFrame } from "../mainframe";
import { EVENT_ARGS_FRAME, FrameEventName, POINT, RECT } from "../types";

export abstract class Control extends events.EventEmitter {
    protected _disabled: boolean = false;

    public getTypeName(): string {
        return this.constructor.name;
    }

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

/**
 * control with no UI
 */
export abstract class BGControl extends Control {
}

/**
 * control with UI
 */
export abstract class UIControl extends Control {
    protected _htmlContainer: HTMLElement;
    protected _position: (frameRect: RECT, ctrlRect: RECT) => POINT;

    constructor() {
        super();
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
    }

    public bindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        this._htmlContainer = htmlContainer;
        this.onBindElement(htmlContainer, frame, args);
    }

    protected createContainerIfAbsent(): HTMLElement {
        return document.createElement("div");
    }

    public onCreate(args: EVENT_ARGS_FRAME) {
        if (this._htmlContainer == null) {
            var e = this._htmlContainer = this.createContainerIfAbsent();
            $(e).addClass("htmlContainer").addClass("igraph-float").appendTo($(args.htmlMainFrame));
            console.log("created default control: " + this.getTypeName());
            this.bindElement(e, args.mainFrame, args);
        }

        var hc = this._htmlContainer;

        //is float?
        if ($(hc).hasClass("igraph-float")) {
            $(hc).draggable();
            this.on(FrameEventName.FRAME_RESIZE, this.onResize.bind(this));

            //set offset
            //A|B|C|D:10,10
            var pos = $(hc).attr("igraph-float-position");
            if (pos == undefined) {
                pos = "A:0,0";
            }

            var s1 = pos.split(":");
            if (s1.length != 2) {
                throw new Error("wrong igraph-float-position: " + pos);
            }
            var corner = s1[0].toUpperCase().charAt(0);
            var offset = s1[1].split(",").map((x: string) => {
                return parseInt(x);
            });

            if (offset.length != 2) {
                throw new Error("wrong igraph-float-position: " + pos);
            }

            this.setPosition((frameRect: RECT, ctrlRect: RECT) => {
                switch (corner) {
                    case 'A': return {
                        x: frameRect.left + offset[0],
                        y: frameRect.top + offset[1]
                    };
                    case 'B': return {
                        x: frameRect.right + offset[0] - (ctrlRect.right - ctrlRect.left),
                        y: frameRect.top + offset[1]
                    };
                    case 'C': return {
                        x: frameRect.right + offset[0] - (ctrlRect.right - ctrlRect.left),
                        y: frameRect.top + offset[1] - (ctrlRect.bottom - ctrlRect.top)
                    };
                    case 'D': return {
                        x: frameRect.left + offset[0],
                        y: frameRect.top + offset[1] - (ctrlRect.bottom - ctrlRect.top)
                    };
                    default:
                        throw new Error("invalid alignment corner: " + corner);
                }
            });
        }

        this.emit(FrameEventName.FRAME_RESIZE, args);
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