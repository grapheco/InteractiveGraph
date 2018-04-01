import { MainFrame } from "../framework";
import * as events from "events";
import { FrameEventName, EVENT_ARGS_FRAME } from "../types";

export abstract class Control extends events.EventEmitter {
    abstract onCreate(args: EVENT_ARGS_FRAME);
    abstract onDestroy(args: EVENT_ARGS_FRAME);

    constructor() {
        super();
        this.on(FrameEventName.CREATE_CONTROL, this.onCreate.bind(this));
        this.on(FrameEventName.DESTROY_CONTROL, this.onDestroy.bind(this));
    }
}