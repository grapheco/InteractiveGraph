import { GraphService } from './service';
import { NodesEdges, PAIR, GSON, FRAME_OPTIONS, QUERY_RESULTS, RELATION_PATH, GraphNode, GraphEdge } from '../types';
import * as http from 'http';
import { filterSeries } from 'async';

export class RemoteGraph implements GraphService {
    private _url: string;
    private _nodes: object[];
    private _edges: object[];
    private _labels: object;
    constructor(url: string) {
        this._url = url;
    }

    init() {
        //var remote: RemoteGraph = this;
        console.log("remote_init");
    }

    private _ajaxCommand(command, params, callback: (data, status) => void) {
        console.log("remote_"+command);
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

    requestConnect(callback: () => void){
        this._ajaxCommand("requestConnect",null,function(data,status) {
            callback () });
    }

    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void){
        this._ajaxCommand("requestGetNodeDescriptions",nodeIds,function(data,status){
            callback(data.descriptions);})  
    }

    requestLoadGraph(callback: (nodes: GraphNode[], edges: GraphEdge[]) => void){
        this._ajaxCommand("requestLoadGraph",null,function(data,status){
            callback(data.nodes, data.edges);})
    }

    requestSearch(expr: any, limit: number, callback: (nodes: GraphNode[]) => void){
        this._ajaxCommand("requestSearch",{expr ,limit},function(data,status){
            callback(data.nodes);})
    }

    requestGetNeighbours(nodeId, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void){
        this._ajaxCommand("requestGetNeighbours",nodeId,function(data,status){
            callback(data.neighbourNodes,data.neighbourEdges);})
    }

    getNodeCategories(): object{
        return this._labels;
    }

    requestFilterNodesByCategory(catagory: string, nodeIds: any[], showOrNot: boolean,
        callback: (filteredNodeIds: any[]) => void){
            this._ajaxCommand("requestFilterNodesByCategory",{catagory,nodeIds,showOrNot},function(data,status){
                callback(data.filteredNodeIds);
            })
        }
    
    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number, callback: (queryResults: QUERY_RESULTS) => void){
        this._ajaxCommand("requestFindRelations",{startNodeId,endNodeId,maxDepth},function(data,status){
            callback(data.queryResults);
        })
    }

    requestGetMoreRelations(queryId: string, callback: (queryResults: QUERY_RESULTS) => void){
        this._ajaxCommand("requestGetMoreRelations",queryId,function(data,status){
            callback(data.queryResults);
        })
    }

    requestStopFindRelations(queryId: string){
        this._ajaxCommand("requestStopFindRelations",queryId,function(status){
            //how to stop?
            return status;
        })
    }






}