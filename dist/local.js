"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LocalGraph {
    constructor(jsonGraphData) {
        this._nodeIdMap = new Map();
        this._graphData = jsonGraphData.data;
        var self = this;
        this._graphData.nodes.forEach(node => {
            self._nodeIdMap.set(node['id'], node);
        });
    }
    init(callback) {
        callback();
    }
    getNodesInfo(nodeIds, callback) {
        var self = this;
        callback(nodeIds.map(nodeId => {
            return self._nodeIdMap.get(nodeId);
        }));
    }
    loadGraph(options, callback) {
        callback(this._graphData);
    }
    _updateNodes(functionDoUpdate) {
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
    updateNodes(showOptions) {
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
exports.LocalGraph = LocalGraph;
