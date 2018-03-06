/**
 * Created by bluejoe on 2018/2/24.
 */
import { GraphService } from './service';
import { Utils } from './utils';

export class GsonSource implements GraphService {
    private _graphData: GraphData;
    private _nodeLabelMap: object;
    private _attachSource: (GraphJson, callback: () => void) => void;
    private _nodeIdMap: Map<string, object> = new Map<string, object>();

    private constructor(attachSource: (GsonSource, callback: () => void) => void) {
        this._attachSource = attachSource;
    }

    private _processGson(gson: Gson) {
        this._nodeLabelMap = gson.nodeLabelMap;
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
            local._nodeIdMap.set(node['id'], node);
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

    requestInit(callback: () => void) {
        this._attachSource(this, callback);
    }

    getNodeLabelMap(): object {
        return this._nodeLabelMap;
    }

    update4ShowNodesOfLabel(nodeLabel: string, showOrNot: boolean, callback: (updates: object[]) => void) {
        var updates = this._updateNodes(function (node, update) {
            var nls: string[] = node.labels;
            if (nls.indexOf(nodeLabel) > -1) {
                update.hidden = !showOrNot;
            }
        });

        callback(updates);
    }

    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void) {
        var local = this;
        callback(nodeIds.map(nodeId => {
            let node: any = local._nodeIdMap.get(nodeId);
            if (node.description !== undefined) {
                return node.description;
            }

            return null;
        }));
    }

    requestLoadGraph(options: object, callback: (graphData: object) => void) {
        callback({
            nodes: this._graphData.nodes.map((node: any) => {
                return {
                    id: node.id,
                    label: node.label,
                    title: node.title
                }
            }), edges: this._graphData.edges
        });
    }

    private _updateNodes(fnDoUpdate: (node, update) => void): object[] {
        var updates = [];
        this._graphData.nodes.forEach((node: any) => {
            var update = { id: node.id };
            fnDoUpdate(node, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        });

        return updates;
    }

    requestSearch(keyword: string, limit: number, callback: (nodes: any[]) => void) {
        var results = [];
        for (var item in this._graphData.nodes) {
            var node: any = this._graphData.nodes[item];
            if (node.name.indexOf(keyword) > -1) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }

        callback(results);
    }

    update4ShowNodes(showOptions): object[] {
        return this._updateNodes(function (node, update) {
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
        }
        );
    }
}