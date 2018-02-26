class LocalGraph {
    constructor(jsonGraphData) {
        this._nodeIdMap = new Map();
        this._jsonGraphData = jsonGraphData;
        var self = this;
        jsonGraphData['nodes'].forEach(node => {
            self._nodeIdMap.set(node['id'], node);
        });
    }
    init() {
    }
    getNodesInfo(nodeIds) {
        var self = this;
        return nodeIds.map(nodeId => {
            return self._nodeIdMap.get(nodeId);
        });
    }
    loadGraph(options, callback) {
        callback(this._jsonGraphData);
    }
}
exports.LocalGraph = LocalGraph;
