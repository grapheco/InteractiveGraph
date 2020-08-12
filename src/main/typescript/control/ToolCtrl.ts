import { BUTTON_OPTIONS, EVENT_ARGS_FRAME, RECT } from '../types';
import { UIControl } from "./Control";
import "jquery";
import "jqueryui";

export class ToolCtrl extends UIControl {

    protected _content = `<div class="toolbar"></div>`;
    protected _classname = 'toolbarPanel';
    protected _dockable = true;
    protected _draggable = false;
    protected _positionStr = "B:-6,0";

    getTypeName(): string {
        return "ToolCtrl";
    }



}
