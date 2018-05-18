"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class LocalGraph {
    constructor() {
        //indices
        this._indexDB = {
            _mapId2Node: new Map(),
            _mapId2Edge: new Map(),
            _mapNodeId2NeighbourNodeIds: new Map(),
            _mapNodePair2EdgeIds: new Map(),
        };
    }
    _translate(gson) {
        var nodes = gson.data.nodes;
        var edges = gson.data.edges;
        var counterNode = 1;
        var counterEdge = 1;
        var transNode = (node) => { };
        var transEdge = (node) => { };
        if (gson.translator !== undefined) {
            if (gson.translator.nodes !== undefined && gson.translator.nodes instanceof Function) {
                transNode = gson.translator.nodes;
            }
            if (gson.translator.edges !== undefined && gson.translator.edges instanceof Function) {
                transNode = gson.translator.edges;
            }
        }
        nodes.forEach((node) => {
            transNode(node);
            if (node.id === undefined)
                node.id = counterNode++;
            //set title
            if (node.title === undefined && node.label !== undefined)
                node.title = "<b>" + node.label + "</b>" + "[" + node.id + "]";
            //set group
            if (node.group === undefined && node.categories instanceof Array)
                node.group = node.categories[0];
        });
        edges.forEach((edge) => {
            transEdge(edge);
            if (edge.id === undefined)
                edge.id = counterEdge++;
        });
        return {
            nodes: nodes,
            edges: edges
        };
    }
    _processGson(gson) {
        this._labels = gson.categories;
        var local = this;
        //translate gson to composite empty fields
        var data = this._translate(gson);
        this._nodes = data.nodes;
        this._edges = data.edges;
        this._createIndexDB();
    }
    _createIndexDB() {
        //create indices
        var indexDB = this._indexDB;
        this._nodes.forEach((x) => {
            indexDB._mapId2Node.set(x.id, x);
        });
        this._edges.forEach((x) => {
            indexDB._mapId2Edge.set(x.id, x);
            //create adjacent matrix
            var pairs = [{ _1: x.from, _2: x.to }, { _1: x.to, _2: x.from }];
            pairs.forEach((pair) => {
                if (!indexDB._mapNodeId2NeighbourNodeIds.has(pair._1))
                    indexDB._mapNodeId2NeighbourNodeIds.set(pair._1, new Set());
                var neighbours = indexDB._mapNodeId2NeighbourNodeIds.get(pair._1);
                neighbours.add(pair._2);
            });
            //create node pair->edges
            pairs.forEach((pair) => {
                var key = "" + pair._1 + "-" + pair._2;
                if (!indexDB._mapNodePair2EdgeIds.has(key))
                    indexDB._mapNodePair2EdgeIds.set(key, new Set());
                var edges = indexDB._mapNodePair2EdgeIds.get(key);
                edges.add(x.id);
            });
        });
    }
    static fromGson(gson) {
        var graph = new LocalGraph();
        graph._callbackLoadData = (callback) => {
            graph._processGson(gson);
            callback();
        };
        return graph;
    }
    static _string2GSON(gsonString) {
        var __gson__;
        eval("__gson__=" + gsonString);
        return __gson__;
    }
    static fromGsonString(gsonString) {
        var graph = new LocalGraph();
        graph._callbackLoadData = (callback) => {
            graph._processGson(LocalGraph._string2GSON(gsonString));
            callback();
        };
        return graph;
    }
    static fromGsonFile(gsonUrl) {
        var graph = new LocalGraph();
        graph._callbackLoadData = (callback) => {
            $.get(gsonUrl, { t: new Date().getTime() }, function (data) {
                graph._processGson(LocalGraph._string2GSON(data));
                callback();
            }, "text");
        };
        return graph;
    }
    getNodeCategories() {
        return this._labels;
    }
    _async(fn) {
        //for tests
        if (typeof window == 'undefined') {
            fn(0);
        }
        else {
            var timerId;
            timerId = window.setTimeout(() => {
                fn(timerId);
            }, 1);
        }
    }
    requestConnect(callback) {
        var local = this;
        this._async(() => {
            local._callbackLoadData(callback);
        });
    }
    requestGetNodeDescriptions(nodeIds, callback) {
        var local = this;
        this._async(() => callback(nodeIds.map(nodeId => {
            let node = local._getNode(nodeId);
            if (node.description !== undefined) {
                return node.description;
            }
            return null;
        })));
    }
    requestLoadGraph(callback) {
        var local = this;
        this._async(() => callback(local._nodes, local._edges));
    }
    requestSearch(expr, limit, callback) {
        var local = this;
        this._async(() => {
            var results = expr instanceof Array ?
                local._searchByExprArray(expr, limit) :
                local._searchBySingleExpr(expr, limit);
            callback(results);
        });
    }
    _searchBySingleExpr(expr, limit) {
        if (typeof (expr) === 'string')
            return this._searchByKeyword(expr.toString(), limit);
        return this._searchByExample(expr, limit);
    }
    _searchByKeyword(keyword, limit) {
        var results = [];
        var node;
        for (node of this._nodes) {
            if (node.label.indexOf(keyword) > -1) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }
        return results;
    }
    _searchByExample(example, limit) {
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
    _searchByExprArray(exprs, limit) {
        var results = [];
        exprs.forEach((expr) => {
            results = results.concat(this._searchBySingleExpr(expr, limit));
        });
        return results;
    }
    requestGetNeighbours(nodeId, callback) {
        var local = this;
        this._async(() => {
            var neighbourEdges = utils_1.Utils.distinct(local._edges.filter((edge) => {
                return edge.from == nodeId || edge.from == nodeId;
            }));
            var neighbourNodeIds = utils_1.Utils.distinct(utils_1.Utils.flatMap(neighbourEdges, (edge) => {
                return [edge.from, edge.to];
            }));
            var neighbourNodes = neighbourNodeIds.map((nodeId) => {
                return local._getNode(nodeId);
            });
            callback(neighbourNodes, neighbourEdges);
        });
    }
    requestFilterNodesByCategory(className, nodeIds, showOrNot, callback) {
        var local = this;
        this._async(() => {
            var filteredNodeIds = [];
            nodeIds.forEach((nodeId) => {
                var node = local._getNode(nodeId);
                var nls = node.categories;
                if (nls.indexOf(className) > -1) {
                    filteredNodeIds.push(nodeId);
                }
            });
            callback(filteredNodeIds);
        });
    }
    _getNode(nodeId) {
        return this._indexDB._mapId2Node.get(nodeId);
    }
    _getEdge(edgeId) {
        return this._indexDB._mapId2Edge.get(edgeId);
    }
    _getEdgesInPath(path) {
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
    _getEdgesBetween(startNodeId, endNodeId) {
        return this._indexDB._mapNodePair2EdgeIds.get("" + startNodeId + "-" + endNodeId);
    }
    requestFindRelations(startNodeId, endNodeId, maxDepth, callback, algDfsOrBfs = true) {
        var graph = this;
        this._async((timerId) => {
            var results = [];
            var pointer = 0;
            if (algDfsOrBfs)
                graph._findRelationsDFS(startNodeId, endNodeId, maxDepth, results, [], 0);
            else
                graph._findRelationsBFS(startNodeId, endNodeId, maxDepth, results);
            var paths = results.map((path) => {
                return {
                    nodes: path.map((id) => {
                        return graph._getNode(id);
                    }),
                    edges: graph._getEdgesInPath(path).map((id) => {
                        return graph._getEdge(id);
                    }),
                };
            });
            callback({
                hasMore: false,
                paths: paths,
                queryId: "" + timerId,
            });
        });
    }
    requestGetMoreRelations(queryId, callback) {
    }
    requestStopFindRelations(queryId) {
        window.clearTimeout(parseInt(queryId));
    }
    _findRelationsDFS(startNodeId, endNodeId, maxDepth, results, path, depth) {
        if (depth > maxDepth)
            return;
        var newPath = path.concat([startNodeId]);
        if (startNodeId == endNodeId) {
            //BINGO!!!
            results.push(newPath);
            return;
        }
        var gson = this;
        //get all adjant nodes
        var neighbours = this._indexDB._mapNodeId2NeighbourNodeIds.get(startNodeId);
        neighbours.forEach((nodeId) => {
            //no loop
            if (path.indexOf(nodeId) < 0) {
                gson._findRelationsDFS(nodeId, endNodeId, maxDepth, results, newPath, depth + 1);
            }
        });
    }
    _findRelationsBFS(startNodeId, endNodeId, maxDepth, results) {
        var queue = new Array();
        queue.push({ nodeId: startNodeId, depth: 0, path: [startNodeId] });
        while (queue.length > 0) {
            var one = queue.shift();
            if (one.depth > maxDepth)
                continue;
            if (one.nodeId == endNodeId) {
                //BINGO!!!
                results.push(one.path);
                continue;
            }
            var neighbours = this._indexDB._mapNodeId2NeighbourNodeIds.get(one.nodeId);
            for (var neighbour of neighbours) {
                if (one.path.indexOf(neighbour) >= 0)
                    continue;
                var newPath = one.path.concat([neighbour]);
                queue.push({
                    nodeId: neighbour,
                    depth: one.depth + 1,
                    path: newPath
                });
            }
        }
    }
}
exports.LocalGraph = LocalGraph;
