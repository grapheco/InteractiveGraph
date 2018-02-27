"use strict";
/**
 * Created by bluejoe on 2018/2/24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vis = require("vis");
const messages_1 = require("./messages");
const $ = require("jquery");
const events = require("events");
const series = require("async/series");
class GraphBrowser extends events.EventEmitter {
    constructor(graphService, htmlGraphArea, htmlInfoBox, fnFormatNodesInfo) {
        super();
        this._infoBox = $(htmlInfoBox);
        this._fnFormatNodesInfo =
            fnFormatNodesInfo === undefined ?
                function (nodeInfos) { return JSON.stringify(nodeInfos); }
                : fnFormatNodesInfo;
        //message bar
        this._messageBar = $(document.createElement("div"));
        this._messageBar.addClass("messageBar");
        this._messageBar.hide();
        this._graphService = graphService;
        var options = this.getDefaultOptions();
        this._nodes = new vis.DataSet();
        this._edges = new vis.DataSet();
        this._network = new vis.Network(htmlGraphArea, {
            nodes: this._nodes,
            edges: this._edges
        }, options);
        var browser = this;
        this._network.on("click", function (args) {
            if (args.nodes.length > 0) {
                browser.showNodesInfo(args.nodes);
            }
        });
    }
    init(callback) {
        this._graphService.init(callback);
    }
    showMessage(msgCode) {
        this._messageBar.html(messages_1.i18n.getMessage(msgCode));
        this._messageBar.show();
    }
    hideMessage() {
        this._messageBar.hide();
    }
    getDefaultOptions() {
        return {
            nodes: {
                shape: 'dot',
                scaling: {
                    min: 10,
                    max: 30
                },
                font: {
                    size: 14,
                    strokeWidth: 7
                }
            },
            edges: {
                width: 0.05,
                color: {
                    highlight: '#ff0000',
                    hover: '#848484',
                },
                selectionWidth: 0.1,
                arrows: {
                    from: {},
                    to: {
                        enabled: true,
                        scaleFactor: 0.5,
                    }
                },
                smooth: {
                    enabled: true,
                    type: 'continuous',
                    roundness: 0.5,
                }
            },
            physics: {
                stabilization: false,
                solver: 'forceAtlas2Based',
                barnesHut: {
                    gravitationalConstant: -80000,
                    springConstant: 0.001,
                    springLength: 200
                },
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
            },
            interaction: {
                tooltipDelay: 200,
                hover: true,
                hideEdgesOnDrag: true,
                selectable: true,
                navigationButtons: true,
            }
        };
    }
    focus(nodeIds) {
        this._network.selectNodes(nodeIds, false);
        this._network.fit({ nodes: nodeIds, animation: false });
    }
    _updateEdges(functionDoUpdate) {
        var updates = [];
        for (var item in this._edges) {
            var edge = this._edges[item];
            var update = { id: edge['id'] };
            functionDoUpdate(edge, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        }
        if (updates.length > 0)
            this._edges.update(updates);
    }
    _showEdges(showOrNot) {
        showOrNot = !(false === showOrNot);
        this._updateEdges(function (edge, update) {
            update.hidden = !showOrNot;
        });
    }
    scaleTo(scale) {
        this._network.moveTo({ scale: scale });
    }
    run(tasks) {
        series(tasks);
    }
    showGraph(showGraphOptions) {
        showGraphOptions = showGraphOptions || {};
        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);
        if (showGraphOptions.showEdges !== undefined)
            this._showEdges(showGraphOptions.showEdges);
        var updates = this._graphService.updateNodes(showGraphOptions);
        if (updates.length > 0)
            this._nodes.update(updates);
    }
    showNodesInfo(nodeIds) {
        var browser = this;
        if (nodeIds.length > 0 && this._infoBox !== undefined) {
            this._graphService.getNodesInfo(nodeIds, function (nodeInfos) {
                console.log(nodeInfos);
                browser._infoBox.html(browser._fnFormatNodesInfo(nodeInfos));
            });
        }
    }
    ;
    loadGraph(options, callback) {
        var browser = this;
        this._graphService.loadGraph(options, function (graphData) {
            browser._nodes = new vis.DataSet(graphData.nodes);
            browser._edges = new vis.DataSet(graphData.edges);
            browser._network.setData({ nodes: browser._nodes, edges: browser._edges });
            callback();
        });
    }
}
GraphBrowser.CANVAS_PADDING = 80;
exports.GraphBrowser = GraphBrowser;
