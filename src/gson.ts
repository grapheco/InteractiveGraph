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
                    var x = Utils.extend(defaults.nodes || {}, node);
                    Utils.evaluate(x);

                    return x;
                }),
            edges:
                gson.data.edges.map(edge => {
                    var x = Utils.extend(defaults.edges || {}, edge);
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

    getMapName2Class(): object {
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

    private _gsonNodes2VisNodes(nodes: object[], showGraphOptions: ShowGraphOptions): vis.Node[] {
        return nodes.map((node: any) => {
            return this._gsonNode2VisNode(node, showGraphOptions);
        }
        );
    }

    asyncLoadGraph(showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[], edges: vis.Edge[]) => void) {
        callback(this._gsonNodes2VisNodes(this._graphData.nodes, showGraphOptions),
            this._graphData.edges);
    }

    public asyncSearch(expr: any, limit: number, showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[]) => void) {
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
        for (var item in this._graphData.nodes) {
            var node: any = this._graphData.nodes[item];
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

        return results;
    }

    private _searchByExprArray(exprs: any[], limit: number): vis.Node[] {
        var results = [];
        exprs.forEach((expr) => {
            results = results.concat(this._searchBySingleExpr(expr, limit));
        });

        return results;
    }

    asyncGetNeighbours(nodeId: string, showGraphOptions: ShowGraphOptions, callback: (neighbourNodes: vis.Node[], neighbourEdges: vis.Node[]) => void) {
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
            return this._gsonNode2VisNode(this._mapId2Node.get(nodeId), showGraphOptions);
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

    asyncUpdate4ShowNodes(nodeIds: any[], showGraphOptions: ShowGraphOptions,
        callback: (updates: object[]) => void) {
        var gson = this;
        var updates = [];
        nodeIds.forEach((nodeId) => {
            var node: any = gson._mapId2Node.get(nodeId);
            var update = this._gsonNode2VisNode(node, showGraphOptions);

            if (Object.keys(update).length > 1)
                updates.push(update);
        }
        );

        callback(updates);
    }
}