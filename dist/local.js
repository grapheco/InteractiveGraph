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
            let node = self._nodeIdMap.get(nodeId);
            if (node._meta !== undefined && node._meta.info !== undefined) {
                return node._meta.info;
            }
            return null;
        }));
    }
    loadGraph(options, callback) {
        callback(this._graphData);
    }
    _updateNodes(fnDoUpdate) {
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
    updateNodes(showOptions) {
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
exports.LocalGraph = LocalGraph;
