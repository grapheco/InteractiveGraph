"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class GsonSource {
    constructor(attachSource) {
        this._nodeIdMap = new Map();
        this._attachSource = attachSource;
    }
    _processGson(gson) {
        this._nodeLabelMap = gson.nodeLabelMap;
        var local = this;
        var defaults = gson.defaultData || {};
        this._graphData = {
            nodes: gson.data.nodes.map(node => {
                var x = {};
                utils_1.Utils.assign(x, defaults.nodes);
                utils_1.Utils.assign(x, node);
                utils_1.Utils.evaluate(x);
                return x;
            }),
            edges: gson.data.edges.map(edge => {
                var x = {};
                utils_1.Utils.assign(x, defaults.edges);
                utils_1.Utils.assign(x, edge);
                utils_1.Utils.evaluate(x);
                return x;
            })
        };
        this._graphData.nodes.forEach(node => {
            local._nodeIdMap.set(node['id'], node);
        });
    }
    static fromObject(gson) {
        return new GsonSource(function (local, callback) {
            local._processGson(gson);
            callback();
        });
    }
    static fromScript(gsonScriptURL, getGsonFromScript) {
        return new GsonSource(function (local, callback) {
            $.getScript(gsonScriptURL, function (data, status) {
                local._processGson(getGsonFromScript());
                callback();
            });
        });
    }
    requestInit(callback) {
        this._attachSource(this, callback);
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
                    label: node.label,
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
exports.GsonSource = GsonSource;
