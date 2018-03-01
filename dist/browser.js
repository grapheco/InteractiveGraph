"use strict";
/**
 * Created by bluejoe on 2018/2/24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vis = require("vis");
const messages_1 = require("./messages");
const events = require("events");
const series = require("async/series");
class GraphBrowser extends events.EventEmitter {
    constructor(graphService, htmlGraphArea) {
        super();
        this._autoCompletionItemLimit = 30;
        this._renderNodesInfo = function (nodeInfos) {
            console.log(nodeInfos);
        };
        this._renderAutoCompletionItem = function (item) {
            return "<b>" + item.name + "</b>"
                + (item.title === undefined ? "" : "<br>" + item.title);
        };
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
            var nodeIds = args.nodes;
            if (nodeIds.length > 0) {
                browser._graphService.getNodesInfo(nodeIds, function (nodeInfos) {
                    browser._renderNodesInfo(nodeInfos);
                });
            }
        });
        this._network.on("selectEdge", function (args) {
            //set font size normal
            if (args.edges.length > 0) {
                var updates = [];
                var edgeIds = args.edges;
                edgeIds.forEach(edgeId => {
                    updates.push({
                        id: edgeId, font: {
                            size: 12,
                        }
                    });
                });
                browser._edges.update(updates);
            }
        });
        this._network.on("deselectEdge", function (args) {
            //set font size 0
            if (args.previousSelection.edges.length > 0) {
                var updates = [];
                var edgeIds = args.previousSelection.edges;
                edgeIds.forEach(edgeId => {
                    updates.push({
                        id: edgeId, font: {
                            size: 0,
                        }
                    });
                });
                browser._edges.update(updates);
            }
        });
    }
    bindInfoBox(htmlInfoBox) {
        this._renderNodesInfo = function (nodesInfo) {
            $(htmlInfoBox).empty();
            nodesInfo.forEach((nodeInfo) => {
                var div = document.createElement("div");
                $(div).html(nodeInfo);
                $(htmlInfoBox).append($(div));
            });
        };
    }
    bindSearchBox(htmlSearchBox) {
        var browser = this;
        $(htmlSearchBox).change(function () {
            $(htmlSearchBox).data("boundGraphNode", {});
        });
        $(htmlSearchBox).autocomplete({
            source: function (request, response) {
                var term = request.term;
                browser.search(term, function (nodeInfos) {
                    response(nodeInfos);
                });
            },
            change: function (event, ui) {
                if (ui.item !== undefined) {
                    $(htmlSearchBox).val(ui.item.name);
                    $(htmlSearchBox).data("boundGraphNode", ui.item);
                    browser.focus([ui.item.id]);
                }
                else {
                    $(htmlSearchBox).data("boundGraphNode", {});
                }
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(browser._renderAutoCompletionItem(item))
                .appendTo(ul);
        };
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
                font: {
                    size: 0,
                },
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
        this._network.fit({ nodes: nodeIds, animation: true });
        this._network.selectNodes(nodeIds, false);
    }
    _updateEdges(fnDoUpdate) {
        var updates = [];
        this._edges.forEach(edge => {
            var update = { id: edge['id'] };
            fnDoUpdate(edge, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        });
        if (updates.length > 0)
            this._edges.update(updates);
    }
    showEdges(showOrNot) {
        showOrNot = !(false === showOrNot);
        this._updateEdges(function (edge, update) {
            update.hidden = !showOrNot;
        });
    }
    scaleTo(scale) {
        this._network.moveTo({ scale: scale });
    }
    fits(nodeIds, animation = false) {
        this._network.fit({ nodes: nodeIds, animation: animation });
    }
    run(tasks) {
        series(tasks);
    }
    showDegrees(showOrNot) {
        this.showGraph({ showDegrees: showOrNot });
    }
    showFaces(showOrNot) {
        this.showGraph({ showFaces: showOrNot });
    }
    search(keyword, callback) {
        this._graphService.search(keyword, this._autoCompletionItemLimit, callback);
    }
    showGraph(showGraphOptions) {
        showGraphOptions = showGraphOptions || {};
        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);
        if (showGraphOptions.showEdges !== undefined)
            this.showEdges(showGraphOptions.showEdges);
        var updates = this._graphService.updateNodes(showGraphOptions);
        if (updates.length > 0)
            this._nodes.update(updates);
    }
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
