"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const types_1 = require("../types");
class Control extends events.EventEmitter {
    constructor() {
        super();
        this._disabled = false;
        this.on(types_1.FrameEventName.CREATE_CONTROL, this.onCreate.bind(this));
        this.on(types_1.FrameEventName.DESTROY_CONTROL, this.onDestroy.bind(this));
    }
    enable() {
        this._disabled = false;
    }
    disable() {
        this._disabled = true;
    }
}
exports.Control = Control;
/**
 * control with no UI
 */
class BGControl extends Control {
}
exports.BGControl = BGControl;
/**
 * control with UI
 */
class UIControl extends Control {
    constructor() {
        super();
    }
    onCreate(args) {
        this._htmlContainer = document.createElement("div");
        $(this._htmlContainer).addClass("htmlContainer").appendTo($(args.htmlMainFrame));
        //resize
        this.on(types_1.FrameEventName.FRAME_RESIZE, this.onResize.bind(this));
        this.onCreateUI(this._htmlContainer, args);
        this.emit(types_1.FrameEventName.FRAME_RESIZE, args);
    }
    show() {
        $(this._htmlContainer).show();
    }
    setPosition(position) {
        this._position = position;
    }
    hide() {
        $(this._htmlContainer).hide();
    }
    onResize(args) {
        if (this._position !== undefined) {
            var a = $(args.htmlMainFrame);
            var b = $(this._htmlContainer);
            var oa = a.offset();
            var ob = b.offset();
            var offset = this._position({ left: oa.left, top: oa.top, right: oa.left + a.width(), bottom: oa.top + a.height() }, { left: ob.left, top: ob.top, right: ob.left + b.width(), bottom: ob.top + b.height() });
            if (offset !== undefined) {
                b.offset({
                    left: offset.x,
                    top: offset.y
                });
            }
        }
    }
    onDestroy(args) {
        $(this._htmlContainer).hide();
        $(this._htmlContainer).remove();
    }
}
exports.UIControl = UIControl;
