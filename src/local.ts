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
            if (node._meta !== undefined && node._meta.info !== undefined) {
                return node._meta.info;
            }

            return null;
        }));
    }

    loadGraph(options: object, callback: (graphData: object) => void) {
        callback(this._graphData);
    }

    private _updateNodes(fnDoUpdate: (node, update) => void): object[] {
        var updates = [];
        for (var item in this._graphData.nodes) {
            var node = this._graphData.nodes[item];
            var update = { id: node['id'] };
            fnDoUpdate(node, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        }

        return updates;
    }

    updateNodes(showOptions): object[] {
        return this._updateNodes(function (node, update) {
            if (node._meta !== undefined) {
                ///////show node?
                if (showOptions.showNodes === true) {
                    update.hidden = false;
                }
                if (showOptions.showNodes === false) {
                    update.hidden = true;
                }

                ///////show face?
                if (showOptions.showFaces === true && node._meta.image !== undefined) {
                    update.shape = 'circularImage';
                    update.image = node._meta.image;
                }
                if (showOptions.showFaces === false) {
                    update.shape = 'dot';
                }

                ///////show group?
                if (showOptions.showGroups === true && node._meta.group !== undefined) {
                    update.group = node._meta.group;
                }
                if (showOptions.showGroups === false) {
                    update.group = 0;
                }

                ///////show degree?
                if (showOptions.showDegrees === true && node._meta.degree !== undefined) {
                    update.value = node._meta.degree;
                }
                if (showOptions.showDegrees === false) {
                    update.value = 1;
                }
            }
        });
    }
}