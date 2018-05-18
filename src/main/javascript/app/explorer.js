"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const SearchBarCtrl_1 = require("../control/SearchBarCtrl");
const ExpansionCtrl_1 = require("../control/ExpansionCtrl");
const InfoBoxCtrl_1 = require("../control/InfoBoxCtrl");
const types_1 = require("../types");
const ToolbarCtrl_1 = require("../control/ToolbarCtrl");
const ConnectCtrl_1 = require("../control/ConnectCtrl");
class GraphExplorer extends app_1.BaseApp {
    constructor(htmlFrame) {
        super(htmlFrame, {
            showLabels: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        });
    }
    onCreateFrame(args) {
        var frame = args.mainFrame;
        frame.addControl("search", new SearchBarCtrl_1.SearchBarCtrl());
        frame.addControl("info", new InfoBoxCtrl_1.InfoBoxCtrl());
        var expansion = frame.addControl("expansion", new ExpansionCtrl_1.ExpansionCtrl());
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
            expansion.clear();
        });
    }
}
exports.GraphExplorer = GraphExplorer;
