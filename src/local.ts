/**
 * Created by bluejoe on 2018/2/24.
 */
import { GraphService } from './service';

export class LocalGraph implements GraphService {
    private _graphData: GraphData;
    private _nodeLabelMap: object;
    private _source: LocalGraphSource;
    private _nodeIdMap: Map<string, object> = new Map<string, object>();

    constructor(source: LocalGraphSource) {
        this._source = source;
    }

    private processJsonGraphData(jsonGraphData: JsonGraphData) {
        this._graphData = jsonGraphData.data;
        this._nodeLabelMap = jsonGraphData.nodeLabelMap;
        var local = this;
        this._graphData.nodes.forEach(node => {
            local._nodeIdMap.set(node['id'], node);
        });
    }

    requestInit(callback: () => void) {
        var local = this;
        if (this._source.json) {
            local.processJsonGraphData(local._source.json);
            callback();
        }
        else {
            $.getScript(this._source.jsonScriptURL, function (data, status) {
                local.processJsonGraphData(local._source.getJsonFromScript());
                callback();
            })
        }
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

    requestGetNodesInfo(nodeIds: string[], callback: (nodeInfos: string[]) => void) {
        var local = this;
        callback(nodeIds.map(nodeId => {
            let node: any = local._nodeIdMap.get(nodeId);
            if (node.info !== undefined) {
                return node.info;
            }

            return null;
        }));
    }

    requestLoadGraph(options: object, callback: (graphData: object) => void) {
        callback({
            nodes: this._graphData.nodes.map((node: any) => {
                return {
                    id: node.id,
                    label: node.name,
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