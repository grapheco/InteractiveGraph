import { GraphService } from './service';

export class RemoteGraph /*implements GraphService*/ {
    private _url: string;
    constructor(url: string) {
        this._url = url;
    }

    init() {

    }

    private _ajaxCommand(command, params, callback) {
        params = params || {};
        params["command"] = command;
        jQuery.getJSON(this._url + "?jsoncallback=?", params, callback);
    };

    getNodesInfo(nodeIds: string[], callback: (nodeInfos: object[]) => void) {
        this._ajaxCommand("getNodesInfo", { nodes: nodeIds }, function (json, textStatus) {
            callback(json.nodeInfos);
        });
    }

    loadGraph(options: object, callback: (graphData: object) => void) {
        this._ajaxCommand("loadGraph", options, function (json, textStatus) {
            callback({ nodes: json.nodes, edges: json.edges });
        });
    }
}