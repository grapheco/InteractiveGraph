import { MainFrame } from "../framework";
import * as events from "events";

export abstract class Control extends events.EventEmitter {
    abstract init(browser: MainFrame);
}