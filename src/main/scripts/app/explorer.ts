import { BaseApp } from './app';
import { MainFrame } from '../framework';
import { SearchBarCtrl } from '../control/SearchBarCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { EVENT_ARGS_FRAME, FrameEventName } from '../types';
import { HighlightNodeCtrl } from '../control/HighlightNodeCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import { ConnectCtrl } from '../control/ConnectCtrl';

export class GraphExplorer extends BaseApp {

    public constructor(htmlFrame: HTMLElement) {
        super(htmlFrame, {
            showLabels: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        });
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.frame;

        frame.addControl("search", new SearchBarCtrl());
        frame.addControl("info", new InfoBoxCtrl());
        var expansion = frame.addControl("expansion", new ExpansionCtrl());

        var toolbar = frame.addControl("toolbar", new ToolbarCtrl());
        var connect = frame.addControl("connect", new ConnectCtrl());
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

        this._frame.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_FRAME) => {
            this._frame.clearScreen();
            expansion.clear();
        });
    }
}