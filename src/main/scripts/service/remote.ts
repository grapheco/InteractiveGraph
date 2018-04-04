import { GraphService } from './service';

export class RemoteGraph /*implements GraphService*/ {
    private _url: string;
    constructor(url: string) {
        this._url = url;
    }

    init() {

    }

    private _ajaxCommand(command, params, callback: (data, status) => void) {
        params = params || {};
        params["command"] = command;
        $.getJSON(this._url + "?jsoncallback=?", params, callback);
    };

    getNodesInfo(nodeIds: string[], callback: (nodeInfos: object[]) => void) {
        this._ajaxCommand("getNodesInfo", { nodes: nodeIds }, function (data, status) {
            callback(data.nodeInfos);
        });
    }

    loadGraph(options: object, callback: (graphData: object) => void) {
        this._ajaxCommand("loadGraph", options, function (data, status) {
            callback({ nodes: data.nodes, edges: data.edges });
        });
    }
}