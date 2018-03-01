/**
 * Created by bluejoe on 2018/2/24.
 */
import { GraphService } from './service';

export class LocalGraph implements GraphService {
    private _graphData: GraphData;
    private _nodeIdMap: Map<string, object> = new Map<string, object>();

    constructor(jsonGraphData: JsonGraphData) {
        this._graphData = jsonGraphData.data;
        var self = this;
        this._graphData.nodes.forEach(node => {
            self._nodeIdMap.set(node['id'], node);
        });
    }

    init(callback) {
        callback();
    }

    getNodesInfo(nodeIds: string[], callback: (nodeInfos: string[]) => void) {
        var self = this;
        callback(nodeIds.map(nodeId => {
            let node: any = self._nodeIdMap.get(nodeId);
            if (node.info !== undefined) {
                return node.info;
            }

            return null;
        }));
    }

    loadGraph(options: object, callback: (graphData: object) => void) {
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
        for (var item in this._graphData.nodes) {
            var node: any = this._graphData.nodes[item];
            var update = { id: node.id };
            fnDoUpdate(node, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        }

        return updates;
    }

    search(keyword: string, limit: number, callback: (nodes: any[]) => void) {
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

    updateNodes(showOptions): object[] {
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