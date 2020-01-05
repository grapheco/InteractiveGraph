import { ConnectCtrl } from '../control/ConnectCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import { EVENT_ARGS_FRAME, FrameEventName } from '../types';
import { BaseApp } from './app';
import {Theme} from "../theme";

export class GraphExplorer extends BaseApp {

    public constructor(htmlFrame: HTMLElement, theme?: Theme) {
        super(htmlFrame, {
            showLabels: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        },null,theme);
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        var expansion = frame.addControl(new ExpansionCtrl());

        var toolbar = frame.getRequiredControlLike(new ToolbarCtrl());
        var connect = frame.addControl( new ConnectCtrl());
        toolbar.addButton({
            icon: "fa fa-file-code-o",
            tooltip: "load GSON string",
            click: (checked: boolean) => { connect.loadGsonString(); }
        });

        toolbar.addButton({
            icon: "fa fa-folder-open-o",
            tooltip: "load GSON url",
            click: (checked: boolean) => { connect.loadGsonUrl(); }
        });

        toolbar.addButton({
            icon: "fa fa-universal-access",
            tooltip: "connect remote IGP server",
            click: (checked: boolean) => { connect.loadRemoteServer(); }
        });
    }
}