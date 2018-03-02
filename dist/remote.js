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
        $.getJSON(this._url + "?jsoncallback=?", params, callback);
    }
    ;
    getNodesInfo(nodeIds, callback) {
        this._ajaxCommand("getNodesInfo", { nodes: nodeIds }, function (data, status) {
            callback(data.nodeInfos);
        });
    }
    loadGraph(options, callback) {
        this._ajaxCommand("loadGraph", options, function (data, status) {
            callback({ nodes: data.nodes, edges: data.edges });
        });
    }
}
exports.RemoteGraph = RemoteGraph;
