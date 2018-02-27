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

    getNodesInfo(nodeIds: string[], callback: (nodeInfos: object[]) => void) {
        var self = this;
        callback(nodeIds.map(nodeId => {
            return self._nodeIdMap.get(nodeId);
        }));
    }

    loadGraph(options: object, callback: (graphData: object) => void) {
        callback(this._graphData);
    }

    private _updateNodes(functionDoUpdate: (node, update) => void): object[] {
        var updates = [];
        for (var item in this._graphData.nodes) {
            var node = this._graphData.nodes[item];
            var update = { id: node['id'] };
            functionDoUpdate(node, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        }

        return updates;
    }

    updateNodes(showOptions): object[] {
        return this._updateNodes(function (node, update) {
            if (node._meta !== undefined) {
                if (showOptions.showFaces === true && node._meta.image !== undefined) {
                    update.shape = 'circularImage';
                    update.image = node._meta.image;
                }
                if (showOptions.showGroups === true && node._meta.group !== undefined) {
                    update.group = node._meta.group;
                }
                if (showOptions.showDegrees === true && node._meta.degree !== undefined) {
                    update.value = node._meta.degree;
                }
            }
        });
    }
}