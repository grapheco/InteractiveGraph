import { MainFrame } from "../framework";
import { EVENT_ARGS_FRAME } from "../types";

export class MainFrameWatcher {
    _frame: MainFrame;
    _addedListeners: EventListener[] = [];
    _removedListeners: EventListener[] = [];

    public constructor(frame: MainFrame) {
        this._frame = frame;
    }

    public on(event: string, listener: (args: EVENT_ARGS_FRAME) => void) {
        this._addedListeners.push({ name: event, listener: listener });
        this._frame.on(event, listener);
    }

    public off(event: string, listener?: (args: EVENT_ARGS_FRAME) => void) {
        var removed = this._frame.off(event, listener);
        removed.forEach((listener) => {
            this._removedListeners.push({ name: event, listener: <any>listener });
        });
    }

    public undo() {
        this._addedListeners.forEach((el: EventListener) => {
            this._frame.off(el.name, el.listener);
        });

        this._removedListeners.forEach((el: EventListener) => {
            this._frame.on(el.name, el.listener);
        });

        this._addedListeners = [];
        this._removedListeners = [];
    }
}

interface EventListener {
    name: string;
    listener: (args: EVENT_ARGS_FRAME) => void;
}