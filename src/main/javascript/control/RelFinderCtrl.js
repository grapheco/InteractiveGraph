"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const types_1 = require("../types");
const Control_1 = require("./Control");
class RelFinderCtrl extends Control_1.BGControl {
    constructor() {
        super(...arguments);
        this._pathColors = [
            '#fa0006', '#1cd8f8', '#1a6cfd',
            '#f800cf', '6500d5', '#9e00fd',
            '#fb8617', '#f6ff0a', '#96e508'
        ];
    }
    onCreate(args) {
        var frame = args.mainFrame;
        this._frame = frame;
        var onselect = function (args) {
            if (this._queryStartNodeIds !== undefined) {
                var inPathNodeIds = [];
                var inPathEdgeIds = [];
                var selectedNodeIds = args.nodes;
                var selectedEdgeIds = args.edges;
                var colorIndex = 0;
                var updates = [];
                if (selectedNodeIds.length == 1 && this._queryStartNodeIds.indexOf(selectedNodeIds[0]) < 0) {
                    this._collectedPaths.forEach((path) => {
                        var inPath = false;
                        for (var x of path.nodes) {
                            if (selectedNodeIds.indexOf(x['id']) >= 0) {
                                inPath = true;
                                break;
                            }
                        }
                        if (!inPath) {
                            for (var x of path.edges) {
                                if (selectedEdgeIds.indexOf(x['id']) >= 0) {
                                    inPath = true;
                                    break;
                                }
                            }
                        }
                        if (inPath) {
                            path.nodes.forEach((x) => { inPathNodeIds.push(x.id); });
                            path.edges.forEach((x) => {
                                inPathEdgeIds.push(x.id);
                                updates.push({
                                    id: x.id, color: {
                                        highlight: this._pathColors[colorIndex % this._pathColors.length]
                                    }
                                });
                            });
                            colorIndex++;
                        }
                    });
                    frame.updateEdges(updates);
                    args.network.selectNodes(utils_1.Utils.distinct(inPathNodeIds));
                    args.network.selectEdges(utils_1.Utils.distinct(inPathEdgeIds));
                }
            }
        };
        frame.updateNetworkOptions((options) => {
            options.edges.font['size'] = 11;
        });
        frame.off(types_1.FrameEventName.NETWORK_SELECT_EDGES);
        frame.off(types_1.FrameEventName.NETWORK_DESELECT_EDGES);
        frame.on(types_1.FrameEventName.NETWORK_CLICK, onselect.bind(this));
    }
    _collectFoundRelations(queryResults) {
        var thisCtrl = this;
        this._queryId = queryResults.queryId;
        //collect paths
        queryResults.paths.forEach((path) => {
            thisCtrl._consumerPathBuffer.push(path);
        });
        //has more?
        if (this._stopped)
            return;
        if (queryResults.hasMore) {
            this._frame.getGraphService().requestGetMoreRelations(queryResults.queryId, (queryResults) => {
                thisCtrl._collectFoundRelations(queryResults);
            });
        }
    }
    startQuery(nodeIds, refreshInterval = 1000, maxDepth = 6) {
        this._stopped = false;
        this._frame.placeNodes(nodeIds);
        this._frame.focusNodes(nodeIds);
        var thisCtrl = this;
        //create a render timer
        this._consumerPathBuffer = [];
        this._collectedPaths = [];
        this._queryStartNodeIds = nodeIds;
        this._renderTimer = window.setInterval(() => {
            if (thisCtrl._consumerPathBuffer.length > 0) {
                var path = thisCtrl._consumerPathBuffer.shift();
                thisCtrl._frame.insertNodes(path.nodes);
                thisCtrl._frame.insertEdges(path.edges);
                thisCtrl._collectedPaths.push(path);
            }
        }, refreshInterval);
        //if no longer received new data, stop query
        this._checkDataTimer = window.setInterval(() => {
            if (thisCtrl._consumerPathBuffer.length == 0) {
                thisCtrl.stopQuery();
                return;
            }
        }, 30000);
        this._frame.getGraphService().requestFindRelations(nodeIds[0], nodeIds[1], maxDepth, (queryResults) => {
            thisCtrl._collectFoundRelations(queryResults);
        });
    }
    stopQuery() {
        this._stopped = true;
        window.clearInterval(this._renderTimer);
        window.clearInterval(this._checkDataTimer);
        this._frame.getGraphService().requestStopFindRelations(this._queryId);
    }
    onDestroy(args) {
    }
}
exports.RelFinderCtrl = RelFinderCtrl;
