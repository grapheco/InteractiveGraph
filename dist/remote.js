"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RemoteGraph /*implements GraphService*/ {
    constructor(url) {
        this._url = url;
    }
    init() {
    }
    _ajaxCommand(command, params, callback) {
        params = params || {};
        params["command"] = command;
        jQuery.getJSON(this._url + "?jsoncallback=?", params, callback);
    }
    ;
    getNodesInfo(nodeIds, callback) {
        this._ajaxCommand("getNodesInfo", { nodes: nodeIds }, function (json, textStatus) {
            callback(json.nodeInfos);
        });
    }
    loadGraph(options, callback) {
        this._ajaxCommand("loadGraph", options, function (json, textStatus) {
            callback({ nodes: json.nodes, edges: json.edges });
        });
    }
}
exports.RemoteGraph = RemoteGraph;
