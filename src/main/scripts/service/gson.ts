/**
 * Created by bluejoe on 2018/2/24.
 */
import { GraphService } from './service';
import { Utils } from '../utils';
import { } from "jquery";
import { GraphData, Pair, Gson, ShowGraphOptions, QueryResults, RelationPath } from '../types';

export class GsonSource implements GraphService {
    private _graphData: GraphData;
    private _labels: object;
    private _attachSource: (GraphJson, callback: () => void) => void;

    //indices
    private _indexDB = {
        _mapId2Node: new Map<string, object>(),
        _mapId2Edge: new Map<string, object>(),
        _mapNodeId2NeighbourNodeIds: new Map<string, Set<string>>(),
        _mapNodePair2EdgeIds: new Map<string, Set<string>>(),
    };

    private _defaultTranslateGson2GraphData: (source: Gson) => GraphData = function (source: Gson) {
        var nodes = source.data.nodes;
        var edges = source.data.edges;

        nodes.forEach((node: any) => {
            //set description
            if (node.description === undefined) {
                var description = "<p align=center>";
                if (node.image !== undefined) {
                    description += "<img src='" + node.image + "' width=150/><br>";
                }
                description += "<b>" + node.name + "</b>" + "[" + node.id + "]";
                description += "</p>";

                if (node.info !== undefined)
                    description += "<p align=left>" + node.info + "</p>";

                node.description = description;
            }

            //set label
            if (node.label === undefined)
                node.label = node.name;

            //set group
            if (node.group === undefined)
                node.group = node.labels[0];
        });

        return {
            nodes: nodes,
            edges: edges
        };
    }

    private constructor(attachSource: (GsonSource, callback: () => void) => void) {
        this._attachSource = attachSource;
    }

    private _processGson(gson: Gson, translate?: (source: Gson) => GraphData) {
        this._labels = gson.labels;
        var local = this;
        if (translate === undefined) {
            translate = local._defaultTranslateGson2GraphData;
        }

        this._graphData = translate(gson);
        this._createIndexDB();
    }

    private _createIndexDB() {
        //create indices
        var indexDB = this._indexDB;

        this._graphData.nodes.forEach((x: any) => {
            indexDB._mapId2Node.set(x.id, x);
        });

        this._graphData.edges.forEach((x: any) => {
            indexDB._mapId2Edge.set(x.id, x);

            //create adjacent matrix
            var pairs = [{ _1: x.from, _2: x.to }, { _1: x.to, _2: x.from }];
            pairs.forEach((pair: Pair<string, string>) => {
                if (!indexDB._mapNodeId2NeighbourNodeIds.has(pair._1))
                    indexDB._mapNodeId2NeighbourNodeIds.set(pair._1, new Set<string>());

                var neighbours = indexDB._mapNodeId2NeighbourNodeIds.get(pair._1);
                neighbours.add(pair._2);
            });

            //create node pair->edges
            pairs.forEach((pair: Pair<string, string>) => {
                var key = "" + pair._1 + "-" + pair._2;
                if (!indexDB._mapNodePair2EdgeIds.has(key))
                    indexDB._mapNodePair2EdgeIds.set(key, new Set<string>());

                var edges = indexDB._mapNodePair2EdgeIds.get(key);
                edges.add(x.id);
            });
        });

        console.debug(indexDB);
    }

    public static fromObject(gson: Gson, translate?: (source: Gson) => GraphData) {
        return new GsonSource(function (local: GsonSource, callback: () => void) {
            local._processGson(gson, translate);
            callback();
        });
    }

    public static fromFile(gsonURL, translate?: (source: Gson) => GraphData) {
        return new GsonSource(function (local: GsonSource, callback: () => void) {
            $.getJSON(gsonURL, function (data) {
                local._processGson(data, translate);

                callback();
            });
        });
    }

    requestInit(callback: () => void) {
        this._attachSource(this, callback);
    }

    getMapName2Class(): object {
        return this._labels;
    }

    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void) {
        var local = this;
        callback(nodeIds.map(nodeId => {
            let node: any = local._getNode(nodeId);
            if (node.description !== undefined) {
                return node.description;
            }

            return null;
        }));
    }

    private _gsonNodes2VisNodes(nodes: object[], showGraphOptions: ShowGraphOptions): vis.Node[] {
        return nodes.map((node: any) => {
            return this._gsonNode2VisNode(node, showGraphOptions);
        }
        );
    }

    requestLoadGraph(showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[], edges: vis.Edge[]) => void) {
        callback(this._gsonNodes2VisNodes(this._graphData.nodes, showGraphOptions),
            this._graphData.edges);
    }

    public requestSearch(expr: any, limit: number, showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[]) => void) {
        var results = this._gsonNodes2VisNodes(
            expr instanceof Array ?
                this._searchByExprArray(expr, limit) :
                this._searchBySingleExpr(expr, limit),
            showGraphOptions);

        callback(results);
    }

    private _searchBySingleExpr(expr: any, limit: number): vis.Node[] {
        if (typeof (expr) === 'string')
            return this._searchByKeyword(expr.toString(), limit);

        return this._searchByExample(expr, limit);
    }

    private _searchByKeyword(keyword: string, limit: number): vis.Node[] {
        var results = [];
        var node: any;
        for (node of this._graphData.nodes) {
            if (node.name.indexOf(keyword) > -1) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }

        return results;
    }

    private _searchByExample(example: any, limit: number): vis.Node[] {
        var results = [];

        for (var node of this._graphData.nodes) {
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

    private _searchByExprArray(exprs: any[], limit: number): vis.Node[] {
        var results = [];
        exprs.forEach((expr) => {
            results = results.concat(this._searchBySingleExpr(expr, limit));
        });

        return results;
    }

    requestGetNeighbours(nodeId: string, showGraphOptions: ShowGraphOptions, callback: (neighbourNodes: vis.Node[], neighbourEdges: vis.Node[]) => void) {
        var neighbourEdges: vis.Node[] = Utils.distinct(
            this._graphData.edges.filter((edge: any) => {
                return edge.from == nodeId || edge.from == nodeId;
            })
        );

        var neighbourNodeIds = Utils.distinct(
            Utils.flatMap(neighbourEdges, (edge: any) => {
                return [edge.from, edge.to];
            })
        );

        var neighbourNodes: vis.Node[] = neighbourNodeIds.map((nodeId: string) => {
            return this._gsonNode2VisNode(this._getNode(nodeId), showGraphOptions);
        });

        callback(neighbourNodes, neighbourEdges);
    }

    requestUpdateNodesOfClass(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void) {
        var gson = this;
        var updates = [];
        nodeIds.forEach((nodeId) => {
            var update: any = { id: nodeId };
            var node: any = gson._getNode(nodeId);
            var nls: string[] = node.labels;
            if (nls.indexOf(className) > -1) {
                update.hidden = !showOrNot;
            }

            updates.push(update);
        });

        callback(updates);
    }

    private _gsonNode2VisNode(gsonNode: any, showGraphOptions: ShowGraphOptions): vis.Node {
        var visNode: any = { id: gsonNode.id };

        ///////show label
        if (showGraphOptions.showLabels === true) {
            visNode.label = gsonNode.name;
        }
        if (showGraphOptions.showLabels === false) {
            visNode.label = "";
        }

        ///////show node?
        if (showGraphOptions.showNodes === true) {
            visNode.hidden = false;
        }
        if (showGraphOptions.showNodes === false) {
            visNode.hidden = true;
        }

        ///////show face?
        if (showGraphOptions.showFaces === true && gsonNode.image !== undefined && gsonNode.image != "") {
            visNode.shape = 'circularImage';
            visNode.image = gsonNode.image;
        }
        if (showGraphOptions.showFaces === false) {
            visNode.shape = 'dot';
        }

        ///////show group?
        if (showGraphOptions.showGroups === true && gsonNode.group !== undefined) {
            visNode.group = gsonNode.group;
        }
        if (showGraphOptions.showGroups === false) {
            visNode.group = 0;
        }

        ///////show degree?
        if (showGraphOptions.showDegrees === true && gsonNode.degree !== undefined) {
            visNode.value = gsonNode.degree;
        }
        if (showGraphOptions.showDegrees === false) {
            visNode.value = 1;
        }

        return visNode;
    }

    requestUpdate4ShowNodes(nodeIds: any[], showGraphOptions: ShowGraphOptions,
        callback: (updates: object[]) => void) {
        var gson = this;
        var updates = [];
        nodeIds.forEach((nodeId) => {
            var node: any = gson._getNode(nodeId);
            var update = this._gsonNode2VisNode(node, showGraphOptions);

            if (Object.keys(update).length > 1)
                updates.push(update);
        }
        );

        callback(updates);
    }

    private _getNode(nodeId: string) {
        return this._indexDB._mapId2Node.get(nodeId);
    }

    private _getEdge(edgeId: string) {
        return this._indexDB._mapId2Edge.get(edgeId);
    }

    private _getEdgesInPath(startNodeId: string, path: string[]): string[] {
        var edges = [];
        var lastNodeId = startNodeId;

        for (var node of path) {
            this._getEdgesBetween(lastNodeId, node).forEach((edge) => {
                edges.push(edge);
            });

            lastNodeId = node;
        }

        return edges;
    }

    private _getEdgesBetween(startNodeId, endNodeId): Set<string> {
        return this._indexDB._mapNodePair2EdgeIds.get("" + startNodeId + "-" + endNodeId);
    }

    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number,
        callback: (queryResults: QueryResults) => void) {
        var gson = this;
        var results: string[][] = [];
        this._findRelations(startNodeId, endNodeId, maxDepth, new Set<string>(), results, [], 0);

        var paths: RelationPath[] = results.map((path: string[]) => {
            return {
                nodes: path.map((id: string) => {
                    return gson._getNode(id);
                }),
                edges: this._getEdgesInPath(startNodeId, path).map((id: string) => {
                    return gson._getEdge(id);
                }),
            };
        });

        callback({
            hasMore: false,
            paths: paths,
            queryId: '0',
        });
    }

    requestGetMoreRelations(queryId: string,
        callback: (queryResults: QueryResults) => void) {
    }

    private _getNeighbours(nodeId: string): Set<string> {
        return this._indexDB._mapNodeId2NeighbourNodeIds.get(nodeId);
    }

    private _findRelations(startNodeId: string, endNodeId: string, maxDepth: number,
        visitedNodes: Set<string>, results: string[][], path: string[], depth: number) {
        if (depth >= maxDepth)
            return;

        visitedNodes.add(startNodeId);
        var gson = this;
        //get all adj nodes
        var neighbours = this._getNeighbours(startNodeId);
        for (var neighbour of neighbours) {
            //already visited?
            if (visitedNodes.has(neighbour))
                continue;

            var newPath = path.concat([neighbour]);
            if (neighbour == endNodeId) {
                //BINGO!!!
                results.push(newPath);
            }
            else {
                gson._findRelations(neighbour,
                    endNodeId, maxDepth, visitedNodes,
                    results, newPath, depth + 1);
            }
        }
    }
}