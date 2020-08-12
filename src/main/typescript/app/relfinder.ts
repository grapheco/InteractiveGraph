import { ConnectCtrl } from '../control/ConnectCtrl';
import { HighlightCtrl } from '../control/HighlightCtrl';
import { RelFinderCtrl } from '../control/RelFinderCtrl';
import { RelFinderDialogCtrl } from '../control/RelFinderDialogCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import {
    CommunityData,
    EVENT_ARGS_FRAME, EVENT_ARGS_GRAPH_CONNECTED,
    EVENT_ARGS_RELFINDER,
    EVENT_ARGS_RELLIST,
    FrameEventName,
    GraphNode,
    NETWORK_OPTIONS
} from '../types';
import { BaseApp } from './app';
import {RelListCtrl} from "../control/RelListCtrl";
import {StatusBarCtrl} from "../control/StatusBarCtrl";
import {Theme} from "../theme";

export class RelFinder extends BaseApp {
    private _relfinder: RelFinderCtrl;
    private _dlgNoEnoughNodesSelected;
    private _dlgClearScreenAlert;
    private _relfinderDlg: RelFinderDialogCtrl;
    private _rellist: RelListCtrl;
    private _statusBar: StatusBarCtrl;

    public constructor(htmlFrame: HTMLElement,theme?: Theme, showDialog?: boolean) {
        super(htmlFrame, {
            showLabels: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        }, { showDialog: showDialog },theme);
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        var app = this;

        var hilight = frame.addControl( new HighlightCtrl());
        var connect = frame.addControl( new ConnectCtrl());
        var toolbar = frame.getRequiredControlLike(new ToolbarCtrl());
        this._statusBar = frame.getRequiredControlLike(new StatusBarCtrl());

        toolbar.addButton({
            icon: "fa fa-exchange",
            checked: true,
            tooltip: "toggle physics",
            click: (checked: boolean) => { app.togglePhysics(checked); }
        });

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

        this._relfinderDlg = frame.getRequiredControlLike(new RelFinderDialogCtrl());
        this._rellist = frame.getRequiredControlLike(new RelListCtrl());
        this._relfinder = frame.addControl( new RelFinderCtrl());

        frame.updateNetworkOptions(function (options: NETWORK_OPTIONS) {
            options.edges.physics = false;
            options.edges.length = 0.5;
            options.physics.timestep = 0.1;
        });

        super.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_GRAPH_CONNECTED) => {
            this.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                options.physics.enabled = true;
            });
            frame.setDynamic(false)
            app._statusBar.showMessage("nodes: " + args.nodesNum + ", edges: " + args.edgesNum);
        });

        frame.on(FrameEventName.RELFINDER_START, (args: EVENT_ARGS_RELFINDER) => {
            app.startQueryWithPrompt(500, args.maxDepth);
            app._rellist.emit(FrameEventName.RELFINDER_START, args);
        })

        frame.on(FrameEventName.RELFINDER_STOP, (args: EVENT_ARGS_RELFINDER) => {
            app.stopQuery();
        })

        frame.on(FrameEventName.RELFINDER_STARTED, (args: EVENT_ARGS_RELFINDER) => {
            app._relfinderDlg.emit(FrameEventName.RELFINDER_STARTED, args);
        })

        frame.on(FrameEventName.RELFINDER_STOPPED, (args: EVENT_ARGS_RELFINDER) => {
            app._relfinderDlg.emit(FrameEventName.RELFINDER_STOPPED, args);
        })

        frame.on(FrameEventName.RELLIST_PUT, (args:EVENT_ARGS_RELLIST)=>{
            app._rellist.emit(FrameEventName.RELLIST_PUT, args);
        })

        this._dlgNoEnoughNodesSelected = $('<div title="No enough nodes"><p><span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>TWO nodes are required to start relation path discovery.</p></div>').appendTo($(args.htmlMainFrame)).hide();

        this._dlgClearScreenAlert = $('<div id="dialog-confirm" title="Empty the results?"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>These items will be deleted. Are you sure?</p> </div>').appendTo($(args.htmlMainFrame)).hide();
    }

    public startQueryWithPrompt(refreshInterval: number = 500, maxDepth: number = 6) {
        var app = this;
        var pickedNodeIds = this._relfinderDlg.getSelectedNodeIds();
        if (pickedNodeIds.length != 2) {
            this._dlgNoEnoughNodesSelected.dialog({
                modal: true,
                resizable: false,
                height: "auto",
                width: 400,
                buttons: {
                    "I see": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return;
        }

        if (super.getScreenData().edges.length > 0) {
            this._dlgClearScreenAlert.dialog({
                resizable: false,
                height: "auto",
                width: 400,
                modal: true,
                buttons: {
                    "Delete all items": function () {
                        $(this).dialog("close");
                        app.startQuery(refreshInterval, maxDepth);
                    },
                    "Cancel": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return;
        }

        app.startQuery(refreshInterval, maxDepth);
    }

    public startQuery(refreshInterval: number = 500, maxDepth: number = 6) {
        var app = this;
        var pickedNodeIds = this._relfinderDlg.getSelectedNodeIds();
        super.deleteNodes(function (node) {
            return pickedNodeIds.indexOf(node.id) < 0;
        });

        this._relfinder.startQuery(pickedNodeIds, refreshInterval, maxDepth);
    }

    public stopQuery() {
        this._relfinder.stopQuery();
    }

    public pickup(keywords: object[], callback: (nodes: GraphNode[]) => void) {
        var app = this;
        super.pickup(keywords, (nodes: GraphNode[]) => {
            this._relfinderDlg.selectNodes(nodes);

            if (callback !== undefined)
                callback(nodes);
        });
    }
}
