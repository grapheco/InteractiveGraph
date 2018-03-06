"use strict";
/**
 * Created by bluejoe on 2018/2/24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vis = require("vis");
const messages_1 = require("./messages");
const events = require("events");
const series = require("async/series");
const theme_1 = require("./theme");
class GraphBrowser extends events.EventEmitter {
    constructor(graphService, htmlGraphArea, theme) {
        super();
        this._autoCompletionItemLimit = 30;
        this._highlightedNodeIds = {};
        this._renderNodeDescriptions = function (descriptions) {
            console.log(descriptions);
        };
        this._renderAutoCompletionItem = function (item) {
            return "<b>" + item.name + "</b>"
                + (item.title === undefined ? "" : "<br>" + item.title);
        };
        //message bar
        this._jqueryMessageBar = $(document.createElement("div"));
        this._jqueryMessageBar.addClass("messageBar");
        this._jqueryMessageBar.hide();
        this._graphService = graphService;
        this._nodes = new vis.DataSet();
        this._edges = new vis.DataSet();
        this._theme = theme || theme_1.Themes.DEFAULT();
        this._jqueryGraphArea = $(htmlGraphArea);
        this._network = new vis.Network(htmlGraphArea, {
            nodes: this._nodes,
            edges: this._edges
        }, this._theme.networkOptions);
        var browser = this;
        this._network.on("click", function (args) {
            var nodeIds = args.nodes;
            if (nodeIds.length > 0) {
                browser._graphService.requestGetNodeDescriptions(nodeIds, function (nodeInfos) {
                    browser._renderNodeDescriptions(nodeInfos);
                });
            }
        });
        this._network.on("doubleClick", function (args) {
            //double click on backgroud (no nodes selected)
            if (args.nodes.length == 0 && args.edges.length == 0) {
                browser._highlightedNodeIds = [];
                return;
            }
            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                if (browser._highlightedNodeIds[nodeId] === undefined) {
                    browser._highlightedNodeIds[nodeId] = 0;
                }
                else {
                    delete browser._highlightedNodeIds[nodeId];
                }
            });
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
        this._network.on("afterDrawing", function (ctx) {
            ctx.strokeStyle = '#A6D5F7';
            ctx.lineWidth = 3;
            //ctx.fillStyle = '#294475';
            var nodeIds = browser.getHighlightedNodeIds();
            /*
            nodeIds.forEach(nodeId => {
                var box = browser._network.getBoundingBox(nodeId);
                ctx.fillRect(box.left - 10, box.top - 10, box.right - box.left + 20, box.bottom - box.top + 20);
                //ctx.fill();
            });
            */
            var nodePositions = browser._network.getPositions(nodeIds);
            for (let key in nodePositions) {
                var pos = nodePositions[key];
                var box = browser._network.getBoundingBox(key);
                ctx.circle(pos.x, pos.y, pos.y - box.top + 5);
                //ctx.fill();
                ctx.stroke();
            }
        });
    }
    setTheme(theme) {
        this._theme = theme;
        this._jqueryGraphArea.css('background', theme.canvasBackground);
        this._network.setOptions(theme.networkOptions);
    }
    updateTheme(update) {
        update(this._theme);
        this.setTheme(this._theme);
    }
    getHighlightedNodeIds() {
        return Object.keys(this._highlightedNodeIds);
    }
    highlightNode(nodeId, showOrNot) {
        if (showOrNot)
            this._highlightedNodeIds[nodeId] = 0;
        else
            delete this._highlightedNodeIds[nodeId];
    }
    bindInfoBox(htmlInfoBox) {
        this._renderNodeDescriptions = function (descriptions) {
            $(htmlInfoBox).empty();
            descriptions.forEach((description) => {
                $(htmlInfoBox).append(description);
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
                    $(htmlSearchBox).data("boundGraphNode", ui.item);
                }
                else {
                    $(htmlSearchBox).data("boundGraphNode", {});
                }
                return false;
            },
            select: function (event, ui) {
                if (ui.item !== undefined) {
                    $(htmlSearchBox).val(ui.item.name);
                    browser.highlight([ui.item.id]);
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
        this._graphService.requestInit(callback);
    }
    showMessage(msgCode) {
        this._jqueryMessageBar.html(messages_1.i18n.getMessage(msgCode));
        this._jqueryMessageBar.show();
    }
    hideMessage() {
        this._jqueryMessageBar.hide();
    }
    getNodeLabelMap() {
        return this._graphService.getNodeLabelMap();
    }
    showNodesOfLabel(nodeLabel, showOrNot) {
        var browser = this;
        this._graphService.update4ShowNodesOfLabel(nodeLabel, showOrNot, function (updates) {
            browser._nodes.update(updates);
        });
    }
    highlight(nodeIds) {
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
    chained(tasksWithCallback) {
        series(tasksWithCallback);
    }
    showDegrees(showOrNot) {
        this.showGraph({ showDegrees: showOrNot });
    }
    showFaces(showOrNot) {
        this.showGraph({ showFaces: showOrNot });
    }
    search(keyword, callback) {
        this._graphService.requestSearch(keyword, this._autoCompletionItemLimit, callback);
    }
    showGraph(showGraphOptions) {
        showGraphOptions = showGraphOptions || {};
        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);
        if (showGraphOptions.showEdges !== undefined)
            this.showEdges(showGraphOptions.showEdges);
        var updates = this._graphService.update4ShowNodes(showGraphOptions);
        if (updates.length > 0)
            this._nodes.update(updates);
    }
    loadGraph(options, callback) {
        var browser = this;
        this._graphService.requestLoadGraph(options, function (graphData) {
            browser._nodes = new vis.DataSet(graphData.nodes);
            browser._edges = new vis.DataSet(graphData.edges);
            browser._network.setData({ nodes: browser._nodes, edges: browser._edges });
            callback();
        });
    }
}
GraphBrowser.CANVAS_PADDING = 80;
exports.GraphBrowser = GraphBrowser;
