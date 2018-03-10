/**
 * Created by bluejoe on 2018/2/24.
 */
import { GraphService } from './service';
import { Utils } from './utils';

export class GsonSource implements GraphService {
    private _graphData: GraphData;
    private _canvasData = { nodes: [], edges: [] };
    private _mapLabel2Node: object;
    private _attachSource: (GraphJson, callback: () => void) => void;
    private _mapId2Node: Map<string, object> = new Map<string, object>();

    private constructor(attachSource: (GsonSource, callback: () => void) => void) {
        this._attachSource = attachSource;
    }

    private _processGson(gson: Gson) {
        this._mapLabel2Node = gson.nodeLabelMap;
        var local = this;
        var defaults: any = gson.defaultData || {};

        this._graphData = {
            nodes:
                gson.data.nodes.map(node => {
                    var x = {};
                    Utils.extend(x, defaults.nodes);
                    Utils.extend(x, node);
                    Utils.evaluate(x);

                    return x;
                }),
            edges:
                gson.data.edges.map(edge => {
                    var x = {};
                    Utils.extend(x, defaults.edges);
                    Utils.extend(x, edge);
                    Utils.evaluate(x);

                    return x;
                })
        };

        this._graphData.nodes.forEach(node => {
            local._mapId2Node.set(node['id'], node);
        });
    }

    public static fromObject(gson: Gson) {
        return new GsonSource(function (local: GsonSource, callback: () => void) {
            local._processGson(gson);
            callback();
        });
    }

    public static fromScript(gsonScriptURL, getGsonFromScript: () => Gson) {
        return new GsonSource(function (local: GsonSource, callback: () => void) {
            $.getScript(gsonScriptURL, function (data, status) {
                local._processGson(getGsonFromScript());
                callback();
            })
        });
    }

    asyncInit(callback: () => void) {
        this._attachSource(this, callback);
    }

    getNodeLabelMap(): object {
        return this._mapLabel2Node;
    }

    asyncGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void) {
        var local = this;
        callback(nodeIds.map(nodeId => {
            let node: any = local._mapId2Node.get(nodeId);
            if (node.description !== undefined) {
                return node.description;
            }

            return null;
        }));
    }

    asyncLoadGraph(options: object, callback: (graphData: object) => void) {
        this._canvasData = {
            nodes: this._graphData.nodes.map((node: any) => {
                return {
                    id: node.id,
                    label: node.label,
                    title: node.title
                }
            }), edges: this._graphData.edges
        };

        callback(this._canvasData);
    }

    public asyncSearch(expr: any, limit: number, callback: (nodes: any[]) => void) {
        var results = expr instanceof Array ?
            this._searchByExprArray(expr, limit) :
            this._searchBySingleExpr(expr, limit);

        callback(results);
    }

    private _searchBySingleExpr(expr: any, limit: number): any[] {
        if (typeof (expr) === 'string')
            return this._searchByKeyword(expr.toString(), limit);

        return this._searchByExample(expr, limit);
    }

    private _node2SearchResult(node: any): SearchResult {
        return {
            nodeId: node.id,
            value: node.name,
            title: node.title
        };
    }

    private _searchByKeyword(keyword: string, limit: number): any[] {
        var results = [];
        for (var item in this._graphData.nodes) {
            var node: any = this._graphData.nodes[item];
            if (node.name.indexOf(keyword) > -1) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }

        return results.map(this._node2SearchResult);
    }

    private _searchByExample(example: any, limit: number): any[] {
        var results = [];

        for (var item in this._graphData.nodes) {
            var node: any = this._graphData.nodes[item];
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

        return results.map(this._node2SearchResult);
    }

    private _searchByExprArray(exprs: any[], limit: number): any[] {
        var results = [];
        exprs.forEach((expr) => {
            results = results.concat(this._searchBySingleExpr(expr, limit));
        });

        return results;
    }

    asyncGetNeighbours(nodeId: string, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void) {
        var neighbourEdges = Utils.distinct(
            this._graphData.edges.filter((edge: any) => {
                return edge.from == nodeId || edge.from == nodeId;
            })
        );

        var neighbourNodeIds = Utils.distinct(
            Utils.flatMap(neighbourEdges, (edge: any) => {
                return [edge.from, edge.to];
            })
        );

        var neighbourNodes = neighbourNodeIds.map((nodeId: string) => {
            return this._mapId2Node.get(nodeId);
        });

        callback(neighbourNodes, neighbourEdges);
    }

    asyncUpdateNodesOfClass(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void) {
        var gson = this;
        var updates = [];
        nodeIds.forEach((nodeId) => {
            var update: any = { id: nodeId };
            var node: any = gson._mapId2Node.get(nodeId);
            var nls: string[] = node.labels;
            if (nls.indexOf(className) > -1) {
                update.hidden = !showOrNot;
            }

            updates.push(update);
        });

        callback(updates);
    }

    asyncUpdate4ShowNodes(nodeIds: any[], showOptions: ShowGraphOptions,
        callback: (updates: object[]) => void) {
        var gson = this;
        var updates = [];
        nodeIds.forEach((nodeId) => {
            var update: any = { id: nodeId };
            var node: any = gson._mapId2Node.get(nodeId);

            ///////show label
            if (showOptions.showLabel === true) {
                update.label = node.name;
            }
            if (showOptions.showLabel === false) {
                update.label = "";
            }

            ///////show node?
            if (showOptions.showNodes === true) {
                update.hidden = false;
            }
            if (showOptions.showNodes === false) {
                update.hidden = true;
            }

            ///////show face?
            if (showOptions.showFaces === true && node.image !== undefined && node.image != "") {
                update.shape = 'circularImage';
                update.image = node.image;
            }
            if (showOptions.showFaces === false) {
                update.shape = 'dot';
            }

            ///////show group?
            if (showOptions.showGroups === true && node.group !== undefined) {
                update.group = node.group;
            }
            if (showOptions.showGroups === false) {
                update.group = 0;
            }

            ///////show degree?
            if (showOptions.showDegrees === true && node.degree !== undefined) {
                update.value = node.degree;
            }
            if (showOptions.showDegrees === false) {
                update.value = 1;
            }

            if (Object.keys(update).length > 1)
                updates.push(update);
        }
        );

        callback(updates);
    }
}