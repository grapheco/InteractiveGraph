"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const SearchBarCtrl_1 = require("../control/SearchBarCtrl");
const InfoBoxCtrl_1 = require("../control/InfoBoxCtrl");
const RelFinderCtrl_1 = require("../control/RelFinderCtrl");
const types_1 = require("../types");
const RelFinderDialogCtrl_1 = require("../control/RelFinderDialogCtrl");
const ToolbarCtrl_1 = require("../control/ToolbarCtrl");
const ConnectCtrl_1 = require("../control/ConnectCtrl");
const HighlightNodeCtrl_1 = require("../control/HighlightNodeCtrl");
class RelationFinder extends app_1.BaseApp {
    constructor(htmlFrame, showDialog) {
        super(htmlFrame, {
            showLabels: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        }, { showDialog: showDialog });
    }
    onCreateFrame(args) {
        var frame = args.mainFrame;
        var app = this;
        frame.addControl("info", new InfoBoxCtrl_1.InfoBoxCtrl());
        var hilight = frame.addControl("hilight", new HighlightNodeCtrl_1.HighlightNodeCtrl());
        var toolbar = frame.addControl("toolbar", new ToolbarCtrl_1.ToolbarCtrl());
        var connect = frame.addControl("connect", new ConnectCtrl_1.ConnectCtrl());
        toolbar.addButton({
            icon: "fa fa-file-code-o",
            tooltip: "load GSON string",
            click: (checked) => { connect.loadGsonString(); }
        });
        toolbar.addButton({
            icon: "fa fa-folder-open-o",
            tooltip: "load GSON url",
            click: (checked) => { connect.loadGsonUrl(); }
        });
        this._frame.on(types_1.FrameEventName.GRAPH_CONNECTED, (args) => {
            this._frame.clearScreen();
            hilight.clear();
            this._dlgSelectionCtrl.selectNodes([]);
        });
        this._dlgSelectionCtrl = frame.addControl("selectiondlg", new RelFinderDialogCtrl_1.RelFinderDialogCtrl());
        this._relfinder = frame.addControl("relfinder", new RelFinderCtrl_1.RelFinderCtrl());
        if (args.showDialog === false) {
            this._dlgSelectionCtrl.hide();
            frame.addControl("search", new SearchBarCtrl_1.SearchBarCtrl());
        }
        frame.updateNetworkOptions(function (options) {
            options.edges.physics = false;
            options.edges.length = 0.5;
            options.physics.timestep = 0.1;
        });
        frame.on(types_1.FrameEventName.RELFINDER_START, (args) => {
            app.startQueryWithPrompt(500, args.maxDepth);
        });
        frame.on(types_1.FrameEventName.RELFINDER_STOP, (args) => {
            app.stopQuery();
        });
        this._dlgNoEnoughNodesSelected = $('<div title="No enough nodes"><p><span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>TWO nodes are required to start relation path discovery.</p></div>').appendTo($(args.htmlMainFrame)).hide();
        this._dlgClearScreenAlert = $('<div id="dialog-confirm" title="Empty the results?"><p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>These items will be deleted. Are you sure?</p> </div>').appendTo($(args.htmlMainFrame)).hide();
    }
    startQueryWithPrompt(refreshInterval = 500, maxDepth = 6) {
        var app = this;
        var pickedNodeIds = this._dlgSelectionCtrl.getSelectedNodeIds();
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
        if (this._frame.getScreenData().edges.length > 0) {
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
    startQuery(refreshInterval = 500, maxDepth = 6) {
        var app = this;
        var pickedNodeIds = this._dlgSelectionCtrl.getSelectedNodeIds();
        this._frame.deleteNodes(function (node) {
            return pickedNodeIds.indexOf(node.id) < 0;
        });
        this._relfinder.startQuery(pickedNodeIds, refreshInterval, maxDepth);
    }
    stopQuery() {
        this._relfinder.stopQuery();
    }
    pickup(keywords, callback) {
        var app = this;
        super.pickup(keywords, (nodes) => {
            this._dlgSelectionCtrl.selectNodes(nodes);
            if (callback !== undefined)
                callback(nodes);
        });
    }
}
exports.RelationFinder = RelationFinder;
