import { } from "jquery";
import {
    CommunityData,
    GraphEdge,
    GraphNode,
    GSON, InitData,
    LoadGraphOption, LoadGraphOptionCallback,
    NodesEdges,
    PAIR,
    QUERY_RESULTS,
    RELATION_PATH
} from '../types';
import { Utils } from '../utils';
import { GraphService } from './service';

export class LocalGraph implements GraphService {
    private _nodes: object[];
    private _communityData: CommunityData;
    private _edges: object[];
    private _labels: object;
    private _loadGraphOption: object;
    private _performLoadData: (callbackAfterLoad: () => void) => void;
    private _taskManager = new FindRelationsTaskManager();
    private _eventHandlers = {};

    private DEFAULT_GET_DESCRIPTION = function (node) {
        var description = "<p align=center>";
        if (node.image !== undefined) {
            description += "<img src='" + node.image + "' width=150/><br>";
        }
        description += "<b>" + node.label + "</b>" + "[" + node.id + "]";
        description += "</p>";
        if (node.info !== undefined) {
            description += "<p align=left>" + node.info + "</p>";
        } else {
            if (node.title !== undefined)
                description += "<p align=left>" + node.title + "</p>";
        }

        return description;
    }

    //indices
    private _indexDB = {
        _mapId2Node: new Map<string, object>(),
        _mapId2Edge: new Map<string, object>(),
        _mapNodeId2NeighbourNodeIds: new Map<string, Set<string>>(),
        _mapNodePair2EdgeIds: new Map<string, Set<string>>(),
    };

    //cells
    private _cells = new Array<Array<string>>();
    private l=0;
    private r=0;
    private t=0;
    private b=0;
    private w=0;
    private h=0;
    private cell_col_num=0;
    private cell_w=0;
    private cell_h=0;
    private NODE_PRE_CELL = 100;

    private _translate(gson: GSON): NodesEdges {
        var nodes = gson.data.nodes;
        var edges = gson.data.edges;
        var counterNode = 1;
        var counterEdge = 1;

        nodes.forEach((node: any) => {
            if (node.id === undefined)
                node.id = counterNode++;
            //set title
            if (node.title === undefined && node.label !== undefined)
                node.title = "<b>" + node.label + "</b>" + "[" + node.id + "]";
            //set group
            if (node.group === undefined && node.categories instanceof Array)
                node.group = node.categories[0];
        });

        edges.forEach((edge: any) => {
            if (edge.id === undefined)
                edge.id = counterEdge++;
        });

        return {
            nodes: nodes,
            edges: edges
        };
    }

    private constructor() {
    }

    private _processGson(gson: GSON) {
        this._labels = gson.categories;
        var local = this;

        //translate gson to composite empty fields
        var data = this._translate(gson);
        this._nodes = data.nodes;
        this._edges = data.edges;
        //set loadGraphOption
        this._loadGraphOption = gson.option || {
            autoLayout: gson.data.communities === undefined
        };

        this._createIndexDB();
        if (!this._loadGraphOption["autoLayout"]) {
            this._createCells();
        }

        this._communityData = {
            communities: gson.data.communities,
            nodeMap: data.nodes.map((x: object) => {
                return {
                    node: x['id'],
                    community: x['community'],
                };
            })
        };
    }

    //Cut data into many cells
    private _createCells() {
        this._nodes.forEach( (n:any) =>{
            this.r = n.x > this.r? n.x: this.r;
            this.l = n.x < this.l? n.x: this.l;
            this.t = n.y > this.t? n.y: this.t;
            this.b = n.y < this.b? n.y: this.b;
        });

        this.w = Math.ceil(this.r - this.l );
        this.h = Math.ceil(this.t - this.b );

        this.cell_col_num = Math.ceil(
            Math.sqrt(this._nodes.length / this.NODE_PRE_CELL));
        // console.log(this.t, this.b, this.l, this.r, this.w, this.h,this._nodes.length, this.cell_col_num);

        this.cell_w = Math.ceil(this.w / this.cell_col_num);
        this.cell_h = Math.ceil(this.h / this.cell_col_num);

        for (let i = 0; i < this.cell_col_num * this.cell_col_num; i++){
            let cell = new Array<string>();
            this._cells.push(cell)
        }

        this._nodes.forEach( (n:any) => {
            let cell_x = Math.floor((n['x'] - this.l) / this.cell_w);
            let cell_y = Math.floor((this.t - n['y']) / this.cell_h);
            this._cells[cell_y * this.cell_col_num + cell_x].push(n.id)
        });

        // let sum = 0;
        // this._cells.forEach(c=>{
        //     console.log(c.length, c[0]);
        //     sum += c.length;
        // });
        // console.log(sum)
    }

    private _createIndexDB() {
        //create indices
        var indexDB = this._indexDB;

        this._nodes.forEach((x: any) => {
            indexDB._mapId2Node.set(x.id, x);
        });

        this._edges.forEach((x: any) => {
            indexDB._mapId2Edge.set(x.id, x);

            //create adjacent matrix
            var pairs = [{ _1: x.from, _2: x.to }, { _1: x.to, _2: x.from }];
            pairs.forEach((pair: PAIR<string, string>) => {
                if (!indexDB._mapNodeId2NeighbourNodeIds.has(pair._1))
                    indexDB._mapNodeId2NeighbourNodeIds.set(pair._1, new Set<string>());

                var neighbours = indexDB._mapNodeId2NeighbourNodeIds.get(pair._1);
                neighbours.add(pair._2);
            });

            //create node pair->edges
            pairs.forEach((pair: PAIR<string, string>) => {
                var key = "" + pair._1 + "-" + pair._2;
                if (!indexDB._mapNodePair2EdgeIds.has(key))
                    indexDB._mapNodePair2EdgeIds.set(key, new Set<string>());

                var edges = indexDB._mapNodePair2EdgeIds.get(key);
                edges.add(x.id);
            });
        });
    }

    public static fromGson(gson: GSON) {
        var graph = new LocalGraph();
        graph._performLoadData = (callback: () => void) => {
            graph._processGson(gson);
            callback();
        };

        return graph;
    }

    private static _string2GSON(gsonString: string): GSON {
        /*
        var __gson__: GSON;
        eval("__gson__=" + gsonString);
        return __gson__;
        */
       return JSON.parse(gsonString);
    }

    public static fromGsonString(gsonString: string) {
        var graph = new LocalGraph();
        graph._performLoadData = (callback: () => void) => {
            graph._processGson(LocalGraph._string2GSON(gsonString));
            callback();
        };

        return graph;
    }

    public static fromGsonFile(gsonUrl: string, eventHandlers: object) {
        var graph = new LocalGraph();
        graph._performLoadData = (callback: () => void) => {
            $.get(gsonUrl, { t: new Date().getTime() }, function (data) {
                graph._eventHandlers = eventHandlers || {};
                graph._processGson(LocalGraph._string2GSON(data));
                callback();
            }, "text");
        };

        return graph;
    }

    requestGetNodeCategories(callback: (catagoryMap: object) => void) {
        var local: LocalGraph = this;
        this._async(() => {
            callback(local._labels);
        });
    }

    _async(fn: (timerId: number) => void) {
        var timerId;
        timerId = window.setTimeout(() => {
            fn(timerId);
        }, 1);
    }

    requestConnect(callback: (data:InitData) => void) {
        var local: LocalGraph = this;
        this._async(() => {
            local._performLoadData(()=> {
                console.log(local)
                let option: InitData = {
                    categories: [],
                    nodesNum: this._nodes.length,
                    edgesNum: this._edges.length,
                    autoLayout: this._loadGraphOption["autoLayout"] || false
                };
                callback(option)
            });

        });
    }

    requestGetCommunityData(callback: (data: CommunityData) => void) {
        var local: LocalGraph = this;
        this._async(() =>
            callback(local._communityData)
        );
    }

    requestGetNodeInfos(nodeIds: string[], callback: (infos: string[]) => void) {
        var local: LocalGraph = this;
        this._async(() =>
            callback(nodeIds.map(nodeId => {
                let node: any = local._getNode(nodeId);
                let handler = local._eventHandlers['onGetNodeDescription'] || local.DEFAULT_GET_DESCRIPTION;

                return handler(node);
            })));
    }

    //TODO load a batch of data
    requestLoadGraph(option: LoadGraphOption, callback: (nodes: GraphNode[], edges: GraphEdge[], back: LoadGraphOptionCallback) => void) {
        let local: LocalGraph = this;
        if ( option.dynamic ){
            let cell_x = Math.floor((option.centerPointX - this.l) / this.cell_w);
            let cell_y = Math.floor((this.t - option.centerPointY) / this.cell_h);
            let point_cell = cell_y * this.cell_col_num + cell_x;
            let cells = [];
            let ids = [];
            //TODO preload
            [-1,0,1].forEach(i=>{
                [-1,0,1].forEach(j=>{
                    let c = point_cell + i*this.cell_col_num + j;
                    if (c >= 0 && c < this.cell_col_num*this.cell_col_num){
                        cells.push(c);
                        ids = ids.concat(this._cells[c]);
                    }
                })
            });

            this.getDataByNodeId(ids,(nodes, edges)=>{
                this._async(() =>
                    callback(nodes, edges, {
                        width: 3 * this.cell_w,
                        height: 3 * this.cell_h
                    }));
            });
        }else {
            this._async(() =>
                callback(local._nodes, local._edges, {
                    width: 0,
                    height: 0,
                }));
        }
    }

    private getDataByNodeId(ids:string[], callback: (nodes:GraphNode[], edges:GraphEdge[])=>void){
        let nodes=[];
        let edges=[];
        ids.forEach(node=>{
            nodes.push(this._getNode(node));
            let nei = this._indexDB
                ._mapNodeId2NeighbourNodeIds
                .get(node);
            if (nei) {
                nei.forEach(neighbour => {
                    //nodes.push(neighbour);
                    this._indexDB
                        ._mapNodePair2EdgeIds
                        .get("" + node + "-" + neighbour)
                        .forEach(edge=>{
                            edges.push(this._indexDB._mapId2Edge.get(edge));
                        })
                })
            }
        });
        this._async(() =>
            callback(nodes, edges));
    }

    requestSearch(expr: any, limit: number, callback: (nodes: GraphNode[]) => void) {
        var local: LocalGraph = this;
        this._async(() => {
            var results =
                expr instanceof Array ?
                    local._searchByExprArray(expr, limit) :
                    local._searchBySingleExpr(expr, limit);

            callback(results);
        }
        );
    }

    private _searchBySingleExpr(expr: any, limit: number): GraphNode[] {
        if (typeof (expr) === 'string')
            return this._searchByKeyword(expr.toString(), limit);

        return this._searchByExample(expr, limit);
    }

    private _searchByKeyword(keyword: string, limit: number): GraphNode[] {
        var results = [];
        var node: any;
        for (node of this._nodes) {
            if (node.label.indexOf(keyword) > -1) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }

        return results;
    }

    private _searchByExample(example: any, limit: number): GraphNode[] {
        var results = [];

        for (var node of this._nodes) {
            var matches = true;
            for (let key in example) {
                if (node[key] != example[key]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }

        return results;
    }

    private _searchByExprArray(exprs: any[], limit: number): GraphNode[] {
        var results = [];
        exprs.forEach((expr) => {
            results = results.concat(this._searchBySingleExpr(expr, limit));
        });

        return results;
    }

    requestGetNeighbours(nodeId: string, callback: (neighbourNodes: GraphNode[], neighbourEdges: GraphNode[]) => void) {
        var local: LocalGraph = this;
        this._async(() => {
            var neighbourEdges: GraphNode[] = Utils.distinct(
                local._edges.filter((edge: any) => {
                    return edge.from == nodeId || edge.from == nodeId;
                })
            );

            var neighbourNodeIds = Utils.distinct(
                Utils.flatMap(neighbourEdges, (edge: any) => {
                    return [edge.from, edge.to];
                })
            );

            var neighbourNodes: GraphNode[] = neighbourNodeIds.map((nodeId: string) => {
                return local._getNode(nodeId);
            });

            callback(neighbourNodes, neighbourEdges);
        });
    }

    requestFilterNodesByCategory(className: string, nodeIds: any[],
        callback: (filteredNodeIds: any[]) => void) {
        var local: LocalGraph = this;
        this._async(() => {
            var filteredNodeIds = [];
            nodeIds.forEach((nodeId) => {
                var node: any = local._getNode(nodeId);
                var nls: string[] = node.categories;
                if (nls.indexOf(className) > -1) {
                    filteredNodeIds.push(nodeId);
                }
            });

            callback(filteredNodeIds);
        });
    }

    private _getNode(nodeId: string) {
        return this._indexDB._mapId2Node.get(nodeId);
    }

    private _getEdge(edgeId: string) {
        return this._indexDB._mapId2Edge.get(edgeId);
    }

    private _getEdgesInPath(path: string[]): string[] {
        var edges = [];
        var lastNodeId = null;

        for (var node of path) {
            if (lastNodeId != null) {
                this._getEdgesBetween(lastNodeId, node).forEach((edge) => {
                    edges.push(edge);
                });
            }

            lastNodeId = node;
        }

        return edges;
    }

    private _getEdgesBetween(startNodeId, endNodeId): Set<string> {
        return this._indexDB._mapNodePair2EdgeIds.get("" + startNodeId + "-" + endNodeId);
    }

    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number,
        callback: (queryId: string) => void) {
        var task = this._taskManager.createTask();
        task.start(this, startNodeId, endNodeId, maxDepth);
        callback("" + task._taskId);
    }

    requestGetMoreRelations(queryId: string,
        callback: (queryResults: QUERY_RESULTS) => void) {
        var task = this._taskManager.getTask(queryId);
        callback(task.readMore(10));
    }

    requestStopFindRelations(queryId: string) {
        var task = this._taskManager.getTask(queryId);
        task.stop();
    }

    private _wrapPath(pathOfNodes: string[]): RELATION_PATH {
        return {
            nodes: pathOfNodes.map((id: string) => {
                return this._getNode(id);
            }),
            edges: this._getEdgesInPath(pathOfNodes).map((id: string) => {
                return this._getEdge(id);
            }),
        };
    }

    findRelations(algDfsOrBfs: boolean, startNodeId: string, endNodeId: string, maxDepth: number, paths: RELATION_PATH[]) {
        if (algDfsOrBfs)
            this._findRelationsDFS(startNodeId, endNodeId, maxDepth, paths, [], 0);
        else
            this._findRelationsBFS(startNodeId, endNodeId, maxDepth, paths);
    }

    private _findRelationsDFS(startNodeId: string, endNodeId: string, maxDepth: number,
        paths: RELATION_PATH[], pathOfNodes: string[], depth: number) {

        if (depth > maxDepth)
            return;

        var newPath = pathOfNodes.concat([startNodeId]);
        if (startNodeId == endNodeId) {
            //BINGO!!!
            var wpath = this._wrapPath(newPath);
            paths.push(wpath);
            return;
        }

        var local = this;
        //get all adjant nodes
        var neighbours = this._indexDB._mapNodeId2NeighbourNodeIds.get(startNodeId);
        neighbours.forEach((nodeId: string) => {
            //no loop
            if (pathOfNodes.indexOf(nodeId) < 0) {
                local._findRelationsDFS(nodeId,
                    endNodeId, maxDepth,
                    paths, newPath, depth + 1);
            }
        }
        );
    }

    private _findRelationsBFS(startNodeId: string, endNodeId: string, maxDepth: number, results: RELATION_PATH[]) {
        var queue = new Array<{ nodeId: string, depth: number, pathOfNodes: string[] }>();

        queue.push({ nodeId: startNodeId, depth: 0, pathOfNodes: [startNodeId] });

        while (queue.length > 0) {
            var one = queue.shift();

            if (one.depth > maxDepth)
                continue;

            if (one.nodeId == endNodeId) {
                //BINGO!!!
                var wpath = this._wrapPath(one.pathOfNodes);
                results.push(wpath);
                continue;
            }

            var neighbours = this._indexDB._mapNodeId2NeighbourNodeIds.get(one.nodeId);
            for (var neighbour of neighbours) {
                if (one.pathOfNodes.indexOf(neighbour) >= 0)
                    continue;

                var newPath = one.pathOfNodes.concat([neighbour]);
                queue.push({
                    nodeId: neighbour,
                    depth: one.depth + 1,
                    pathOfNodes: newPath
                });
            }
        }
    }

    requestImageSearch(img: any, limit: number, callback: (nodes: GraphNode[]) => void) {
        //TODO image recognization
        let index = Math.floor((Math.random()*this._nodes.length)+1);
        let nodes = [this._nodes[index]];
        callback(nodes);
    }
}

class FindRelationsTask {
    _taskId = 0;
    _pointer = 0;
    _completed = false;
    _timerId = 0;

    paths: RELATION_PATH[] = [];

    public constructor(taskId: number) {
        this._taskId = taskId;
    }

    start(graph: LocalGraph, startNodeId: string, endNodeId: string, maxDepth: number) {
        graph._async((timerId: number) => {
            this._timerId = timerId;
            graph.findRelations(true, startNodeId, endNodeId, maxDepth, this.paths);
            this._completed = true;
        });
    }

    readMore(limit: number): QUERY_RESULTS {
        var token = this.paths.slice(this._pointer, limit);
        this._pointer += token.length;
        return { 'paths': token, 'completed': this._completed };
    }

    stop() {
        clearTimeout(this._timerId);
    }
}

class FindRelationsTaskManager {
    private _seq = 1224;
    private _allTasks = {};

    createTask(): FindRelationsTask {
        var taskId = this._seq++;
        var task = new FindRelationsTask(taskId);
        this._allTasks["" + taskId] = task;

        return task;
    }

    getTask(taskId: string): FindRelationsTask {
        return this._allTasks[taskId];
    }
}