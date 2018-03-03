"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LocalGraph {
    constructor(source) {
        this._nodeIdMap = new Map();
        this._source = source;
    }
    processJsonGraphData(jsonGraphData) {
        this._graphData = jsonGraphData.data;
        this._nodeLabelMap = jsonGraphData.nodeLabelMap;
        var local = this;
        this._graphData.nodes.forEach(node => {
            local._nodeIdMap.set(node['id'], node);
        });
    }
    requestInit(callback) {
        var local = this;
        if (this._source.json) {
            local.processJsonGraphData(local._source.json);
            callback();
        }
        else {
            $.getScript(this._source.jsonScriptURL, function (data, status) {
                local.processJsonGraphData(local._source.getJsonFromScript());
                callback();
            });
        }
    }
    getNodeLabelMap() {
        return this._nodeLabelMap;
    }
    update4ShowNodesOfLabel(nodeLabel, showOrNot, callback) {
        var updates = this._updateNodes(function (node, update) {
            var nls = node.labels;
            if (nls.indexOf(nodeLabel) > -1) {
                update.hidden = !showOrNot;
            }
        });
        callback(updates);
    }
    requestGetNodesInfo(nodeIds, callback) {
        var local = this;
        callback(nodeIds.map(nodeId => {
            let node = local._nodeIdMap.get(nodeId);
            if (node.info !== undefined) {
                return node.info;
            }
            return null;
        }));
    }
    requestLoadGraph(options, callback) {
        callback({
            nodes: this._graphData.nodes.map((node) => {
                return {
                    id: node.id,
                    label: node.name,
                    title: node.title
                };
            }), edges: this._graphData.edges
        });
    }
    _updateNodes(fnDoUpdate) {
        var updates = [];
        this._graphData.nodes.forEach((node) => {
            var update = { id: node.id };
            fnDoUpdate(node, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        });
        return updates;
    }
    requestSearch(keyword, limit, callback) {
        var results = [];
        for (var item in this._graphData.nodes) {
            var node = this._graphData.nodes[item];
            if (node.name.indexOf(keyword) > -1) {
                results.push(node);
                if (results.length > limit)
                    break;
            }
        }
        callback(results);
    }
    update4ShowNodes(showOptions) {
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
        });
    }
}
exports.LocalGraph = LocalGraph;
