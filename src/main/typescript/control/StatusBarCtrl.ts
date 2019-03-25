import { UIControl } from "./Control";

export class StatusBarCtrl extends UIControl {
    private _htmlFrame: HTMLElement;
   
    public getTypeName(): string {
        return "StatusBarCtrl";
    }

    public showMessage(msg: string) {
        $(".statusBar", this._htmlFrame).html(msg);
    }
}