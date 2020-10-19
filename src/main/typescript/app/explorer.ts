import { ConnectCtrl } from '../control/ConnectCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import {EVENT_ARGS_FRAME, EVENT_ARGS_GRAPH_CONNECTED, FrameEventName, GraphNode, NETWORK_OPTIONS} from '../types';
import { BaseApp } from './app';
import {Theme} from "../theme";
import {SearchBoxCtrl} from "../control/SearchBoxCtrl";

export class GraphExplorer extends BaseApp {

    private _searchBox:SearchBoxCtrl

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
        this._searchBox = frame.getRequiredControlLike(new SearchBoxCtrl())
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

        super.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_GRAPH_CONNECTED) => {
            this.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                options.physics.enabled = true;
            });
            frame.setDynamic(false)
        });
    }

    public pickup(keywords: object[], callback: (nodes: GraphNode[]) => void) {
        var app = this;
        super.pickup(keywords, (nodes: GraphNode[]) => {
            this._searchBox.setInputText(nodes[0].label)
            this._searchBox.setLabel(nodes[0].group)
            if (callback !== undefined)
                callback(nodes);
        });
    }
}
