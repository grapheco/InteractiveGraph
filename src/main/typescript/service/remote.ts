import { GraphService } from './service';
import { QUERY_RESULTS, GraphNode, GraphEdge, LoadGraphOption, CommunityData } from '../types';
//import request = require('superagent');
import 'jquery';

export class RemoteGraph implements GraphService {
    private _url: string;

    constructor(url: string) {
        this._url = url;
    }

    private _ajaxCommand(command, params, callback: (data) => void) {
        console.log("command:" + command);
        params = params || {};
        /*
        request.post(this._url + "?command=" + command).send(params)
            .then(function (res) {
                if (!res.error) {
                    callback(JSON.parse(res.text));
                }
            });
        */
        $.ajax({
            type: "post",
            url: this._url + "?command=" + command,
            async: true,
            data: JSON.stringify(params),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                callback(data);
            }
        });
    }

    requestConnect(callback: () => void) {
        var remote = this;
        this._ajaxCommand("init", {}, (data) => {
            callback();
        });
    }

    requestGetNodeInfos(nodeIds: string[], callback: (infos: string[]) => void) {
        this._ajaxCommand("getNodesInfo", { nodeIds: nodeIds }, function (data) {
            callback(data.infos);
        })
    }

    requestLoadGraph(callback: (nodes: GraphNode[], edges: GraphEdge[], option: LoadGraphOption) => void) {
        this._ajaxCommand("loadGraph", {}, function (data) {
            callback(data.nodes, data.edges, data.option);
        })
    }

    requestSearch(expr: any, limit: number, callback: (nodes: GraphNode[]) => void) {
        this._ajaxCommand("search", { expr: expr, limit: limit }, function (data) {
            callback(data.nodes);
        })
    }

    requestGetNeighbours(nodeId, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void) {
        this._ajaxCommand("getNeighbours", { nodeId: nodeId }, function (data) {
            callback(data.neighbourNodes, data.neighbourEdges);
        })
    }

    requestGetNodeCategories(callback: (catagoryMap: object) => void){
        var remote = this;
        this._ajaxCommand("init", {}, (data)=>{
            callback(data.catagorys)
        })
    }

    requestGetCommunityData(callback: (data: CommunityData) => void) {
        callback(null)
    }

    requestFilterNodesByCategory(catagory: string, nodeIds: any[],
        callback: (filteredNodeIds: any[]) => void) {
        this._ajaxCommand("filterNodesByCategory", { catagory: catagory, nodeIds: nodeIds }, function (data) {
            callback(data.filteredNodeIds);
        })
    }

    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number, callback: (queryId: string) => void) {
        this._ajaxCommand("findRelations", { startNodeId: startNodeId, endNodeId: endNodeId, maxDepth: maxDepth }, function (data) {
            callback(data.queryId);
        })
    }

    requestGetMoreRelations(queryId: string, callback: (queryResults: QUERY_RESULTS) => void) {
        this._ajaxCommand("getMoreRelations", { queryId: queryId }, function (data) {
            callback(data);
        })
    }

    requestStopFindRelations(queryId: string) {
        this._ajaxCommand("stopFindRelations", { queryId: queryId }, function (status) {
            //how to stop?
            return status;
        })
    }

    requestImageSearch(img: any, limit: number, callback: (nodes: GraphNode[]) => void) {
        this._ajaxCommand("searchImage", { file: img, limit: limit }, function (data) {
            callback(data.nodes);
        })
    }


}