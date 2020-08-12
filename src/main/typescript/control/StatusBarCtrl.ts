import { UIControl } from "./Control";

export class StatusBarCtrl extends UIControl {
    private _htmlFrame: HTMLElement;

    protected _content = `
            <div class="statusBar"></div>`;
    protected _classname = 'statusBar';
    protected _dockable = true;
    protected _draggable = false;
    protected _positionStr = "C:-100,0";

    public getTypeName(): string {
        return "StatusBarCtrl";
    }

    public showMessage(msg: string) {
        $(".statusBar", this._htmlFrame).html(msg);
    }
}
