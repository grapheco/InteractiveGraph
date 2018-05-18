"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mainframe_1 = require("../mainframe");
const local_1 = require("../service/local");
const types_1 = require("../types");
const MessageBoxCtrl_1 = require("../control/MessageBoxCtrl");
const remote_1 = require("../service/remote");
class BaseApp {
    constructor(htmlFrame, initialOptions, extra) {
        this._toggleEdgeLabelHandlers = {
            onselect: this._toggleEdgeLabelOnSelect.bind(this),
            ondeselect: this._toggleEdgeLabelOnDeselect.bind(this)
        };
        this._htmlFrame = htmlFrame;
        var frame = new mainframe_1.MainFrame(htmlFrame, initialOptions);
        frame.on(types_1.FrameEventName.FRAME_CREATED, this.onCreateFrame.bind(this));
        this._frame = frame;
        frame.fire(types_1.FrameEventName.FRAME_CREATED, extra || {});
        this._messageBox = this._frame.addControl("messagebox", new MessageBoxCtrl_1.MessageBoxCtrl());
    }
    loadGson(url, callback) {
        this._frame.connect(local_1.LocalGraph.fromGsonFile(url), callback);
    }
    connect(url, callback) {
        //remote
        console.log("app-remote-connect2");
        var graph = new remote_1.RemoteGraph(url);
        graph.init();
    }
    showGraph(options, callback) {
        var app = this;
        this._messageBox.showMessage("LOADING_GRAPH");
        this._frame.load(options, function () {
            app._messageBox.hideMessage();
            if (callback !== undefined)
                callback();
        });
    }
    pickup(keywords, callback) {
        var frame = this._frame;
        var app = this;
        frame.search(keywords, (nodes) => {
            var nodeIds = frame.insertNodes(nodes);
            frame.placeNodes(nodeIds);
            frame.updateNodes(nodeIds.map(function (nodeId) {
                return { id: nodeId, physics: false };
            }));
            if (callback !== undefined)
                callback(nodes);
        });
    }
    clearScreen() {
        this._frame.clearScreen();
    }
    updateGraph(showGraphOptions, callback) {
        this._frame.updateGraph(showGraphOptions);
    }
    toggleWeights(checked) {
        this.updateGraph(function (options) {
            options.showDegrees = checked;
        });
    }
    toggleEdges(checked) {
        this.updateGraph(function (options) {
            options.showEdges = checked;
        });
    }
    toggleFaces(checked) {
        this.updateGraph(function (options) {
            options.showFaces = checked;
        });
    }
    toggleShadow(checked) {
        this._frame.updateNetworkOptions((options) => {
            options.nodes.shadow = checked;
        });
    }
    toggleNavigationButtons(checked) {
        this._frame.updateNetworkOptions((options) => {
            options.interaction.navigationButtons = checked;
        });
    }
    toggleNodeBorder(checked) {
        this._frame.updateNetworkOptions((options) => {
            options.nodes.borderWidth = checked ? 1 : 0;
        });
    }
    toggleShowEdgeLabelAlways(checked) {
        if (checked) {
            this._frame.updateNetworkOptions((options) => {
                options.edges.font['size'] = 11;
            });
            this._frame.off(types_1.FrameEventName.NETWORK_SELECT_EDGES, this._toggleEdgeLabelHandlers.onselect);
            this._frame.off(types_1.FrameEventName.NETWORK_DESELECT_EDGES, this._toggleEdgeLabelHandlers.ondeselect);
        }
        else {
            this._frame.updateNetworkOptions((options) => {
                options.edges.font['size'] = 0;
            });
            this._frame.on(types_1.FrameEventName.NETWORK_SELECT_EDGES, this._toggleEdgeLabelHandlers.onselect);
            //hide deselected edges
            this._frame.on(types_1.FrameEventName.NETWORK_DESELECT_EDGES, this._toggleEdgeLabelHandlers.ondeselect);
        }
    }
    toggleEdgeColor(checked) {
        this._frame.updateNetworkOptions((options) => {
            if (checked) {
                options.edges.color = {
                    'inherit': 'to'
                };
            }
            else {
                options.edges.color = {
                    opacity: 0.4,
                    highlight: '#ff0000',
                    hover: '#ff0000'
                };
            }
        });
    }
    _toggleEdgeLabelOnSelect(args) {
        var frame = this._frame;
        var app = this;
        //set font size normal
        if (args.edges.length > 0) {
            var updates = [];
            var edgeIds = args.edges;
            edgeIds.forEach(edgeId => {
                updates.push({
                    id: edgeId, font: {
                        size: 11,
                    }
                });
            });
            frame.updateEdges(updates);
        }
    }
    updateTheme(theme) {
        this._frame.updateTheme(theme);
    }
    _toggleEdgeLabelOnDeselect(args) {
        var frame = this._frame;
        var app = this;
        //set font size 0
        if (args.previousSelection.edges.length > 0) {
            var updates = [];
            var edgeIds = args.previousSelection.edges;
            edgeIds.forEach(edgeId => {
                updates.push({
                    id: edgeId, font: {
                        size: 0,
                    }
                });
            });
            frame.updateEdges(updates);
        }
    }
}
exports.BaseApp = BaseApp;
