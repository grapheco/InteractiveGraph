"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vis = require("vis");
class GraphNodeSet extends vis.DataSet {
}
exports.GraphNodeSet = GraphNodeSet;
class GraphEdgeSet extends vis.DataSet {
}
exports.GraphEdgeSet = GraphEdgeSet;
class GraphNetwork extends vis.Network {
}
exports.GraphNetwork = GraphNetwork;
var FrameEventName;
(function (FrameEventName) {
    FrameEventName["THEME_CHANGED"] = "THEME_CHANGED";
    FrameEventName["DESTROY_CONTROL"] = "DESTROY_CONTROL";
    FrameEventName["REMOVE_CONTROL"] = "REMOVE_CONTROL";
    FrameEventName["CREATE_CONTROL"] = "CREATE_CONTROL";
    FrameEventName["ADD_CONTROL"] = "ADD_CONTROL";
    FrameEventName["GRAPH_CONNECTED"] = "GRAPH_CONNECTED";
    FrameEventName["FRAME_CREATED"] = "FRAME_CREATED";
    FrameEventName["FOCUS_NODES"] = "FOCUS_NODES";
    FrameEventName["INSERT_NODES"] = "INSERT_NODES";
    FrameEventName["NETWORK_SELECT_NODES"] = "NETWORK_SELECT_NODES";
    FrameEventName["NETWORK_DESELECT_NODES"] = "NETWORK_DESELECT_NODES";
    FrameEventName["NETWORK_SELECT_EDGES"] = "NETWORK_SELECT_EDGES";
    FrameEventName["NETWORK_DESELECT_EDGES"] = "NETWORK_DESELECT_EDGES";
    FrameEventName["NETWORK_BEFORE_DRAWING"] = "NETWORK_BEFORE_DRAWING";
    FrameEventName["NETWORK_AFTER_DRAWING"] = "NETWORK_END_DRAWING";
    FrameEventName["NETWORK_DBLCLICK"] = "NETWORK_DBLCLICK";
    FrameEventName["NETWORK_CLICK"] = "NETWORK_CLICK";
    FrameEventName["NETWORK_DRAGGING"] = "NETWORK_DRAGGING";
    FrameEventName["FRAME_RESIZE"] = "FRAME_RESIZE";
    FrameEventName["RELFINDER_START"] = "RELFINDER_START";
    FrameEventName["RELFINDER_STOP"] = "RELFINDER_STOP";
})(FrameEventName = exports.FrameEventName || (exports.FrameEventName = {}));
