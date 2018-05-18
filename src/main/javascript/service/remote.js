"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RemoteGraph {
    constructor(url) {
        this._url = url;
    }
    init() {
        //var remote: RemoteGraph = this;
        console.log("remote_init");
    }
    _ajaxCommand(command, params, callback) {
        console.log("remote_" + command);
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
    requestConnect(callback) {
        this._ajaxCommand("requestConnect", null, function (data, status) {
            callback();
        });
    }
    requestGetNodeDescriptions(nodeIds, callback) {
        this._ajaxCommand("requestGetNodeDescriptions", nodeIds, function (data, status) {
            callback(data.descriptions);
        });
    }
    requestLoadGraph(callback) {
        this._ajaxCommand("requestLoadGraph", null, function (data, status) {
            callback(data.nodes, data.edges);
        });
    }
    requestSearch(expr, limit, callback) {
        this._ajaxCommand("requestSearch", { expr, limit }, function (data, status) {
            callback(data.nodes);
        });
    }
    requestGetNeighbours(nodeId, callback) {
        this._ajaxCommand("requestGetNeighbours", nodeId, function (data, status) {
            callback(data.neighbourNodes, data.neighbourEdges);
        });
    }
    getNodeCategories() {
        return this._labels;
    }
    requestFilterNodesByCategory(catagory, nodeIds, showOrNot, callback) {
        this._ajaxCommand("requestFilterNodesByCategory", { catagory, nodeIds, showOrNot }, function (data, status) {
            callback(data.filteredNodeIds);
        });
    }
    requestFindRelations(startNodeId, endNodeId, maxDepth, callback) {
        this._ajaxCommand("requestFindRelations", { startNodeId, endNodeId, maxDepth }, function (data, status) {
            callback(data.queryResults);
        });
    }
    requestGetMoreRelations(queryId, callback) {
        this._ajaxCommand("requestGetMoreRelations", queryId, function (data, status) {
            callback(data.queryResults);
        });
    }
    requestStopFindRelations(queryId) {
        this._ajaxCommand("requestStopFindRelations", queryId, function (status) {
            //how to stop?
            return status;
        });
    }
}
exports.RemoteGraph = RemoteGraph;
