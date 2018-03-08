/**
 * Created by bluejoe on 2018/2/24.
 */


import * as vis from "vis";
import { GraphService } from './service';
import { Utils, Rect, Point } from "./utils";
import { i18n } from "./messages";
import { } from "jquery";
import { } from "jqueryui";
import * as events from "events";
import * as series from "async/series";
import { Themes, Theme } from "./theme";

export class GraphBrowser extends events.EventEmitter {
    static CANVAS_PADDING: number = 80;
    private _jqueryMessageBar: JQuery<HTMLElement>;
    private _jqueryGraphArea: JQuery<HTMLElement>;

    private _graphService: GraphService;
    private _network: vis.Network;
    private _nodes: vis.DataSet<vis.Node>;
    private _edges: vis.DataSet<vis.Edge>;
    private _autoCompletionItemLimit = 30;
    private _theme: Theme;

    private _highlightedNodeIds = {};

    public _renderNodeDescriptions: (descriptions: string[]) => void = function (descriptions) {
        console.log(descriptions);
    }

    public _renderAutoCompletionItem: (item: any) => string = function (item: any) {
        return "<b>" + item.name + "</b>"
            + (item.title === undefined ? "" : "<br>" + item.title);
    }

    public constructor(graphService: GraphService,
        htmlGraphArea: HTMLElement,
        theme: Theme) {
        super();

        //message bar
        this._jqueryMessageBar = $(document.createElement("div"))
            .addClass("messageBar")
            .appendTo($(document.body))
            .hide();

        this._graphService = graphService;

        this._nodes = new vis.DataSet<vis.Node>();
        this._edges = new vis.DataSet<vis.Edge>();
        this._theme = theme || Themes.DEFAULT();
        this._jqueryGraphArea = $(htmlGraphArea);

        this._network = new vis.Network(htmlGraphArea, {
            nodes: this._nodes,
            edges: this._edges
        }, this._theme.networkOptions);

        this.bindNetworkEvents();
        this.createSearchPanel();
        this.createInfoPanel();
    }

    private bindNetworkEvents() {
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
                var edgeIds: string[] = args.edges;
                edgeIds.forEach(edgeId => {
                    updates.push({
                        id: edgeId, font: {
                            size: 12,
                        }
                    });
                }
                );

                browser._edges.update(updates);
            }
        });

        this._network.on("deselectEdge", function (args) {
            //set font size 0
            if (args.previousSelection.edges.length > 0) {
                var updates = [];
                var edgeIds: string[] = args.previousSelection.edges;
                edgeIds.forEach(edgeId => {
                    updates.push({
                        id: edgeId, font: {
                            size: 0,
                        }
                    });
                }
                );

                browser._edges.update(updates);
            }
        });

        this._network.on("beforeDrawing", function (ctx) {
            var nodeIds = browser.getHighlightedNodeIds();
            /*
            nodeIds.forEach(nodeId => {
                var box = browser._network.getBoundingBox(nodeId);
                ctx.fillRect(box.left - 10, box.top - 10, box.right - box.left + 20, box.bottom - box.top + 20);
                //ctx.fill();
            });
            */
            if (nodeIds.length > 0) {
                var nodePositions: any = browser._network.getPositions(nodeIds);
                var colors = browser._theme.nodeHighlightColor;

                for (let nodeId in nodePositions) {
                    var node: any = browser._nodes.get(nodeId);
                    if (node.hidden)
                        continue;

                    var pos = nodePositions[nodeId];
                    var box = browser._network.getBoundingBox(nodeId);

                    var grd = ctx.createRadialGradient(pos.x, pos.y, pos.y - box.top,
                        pos.x, pos.y, pos.y - box.top + 40);
                    grd.addColorStop(0, colors[0]);
                    grd.addColorStop(1, colors[1]);

                    ctx.fillStyle = grd;
                    ctx.circle(pos.x, pos.y, pos.y - box.top + 40);
                    ctx.fill();
                }
            }
        });
    }

    private createSearchPanel() {
        /*
        <div id="searchPanel" class="searchPanel">
            <div id="searchPanel1" class="searchPanel1">
                <input id="searchBox" class="searchBox" type="text" size="16" placeholder="input keyword">
            </div>
            <div id="searchPanel2" class="searchPanel2">
                <i align="center" class="fa fa-search fa-lg"></i>
            </div>
        </div>
        */
        var panel = document.createElement("div");
        $(panel).addClass("searchPanel")
            .appendTo($(document.body));
        var searchPanel1 = document.createElement("div");
        $(searchPanel1).addClass("searchPanel1")
            .appendTo($(panel));
        var htmlSearchBox = document.createElement("input");
        $(htmlSearchBox).addClass("searchBox")
            .attr("type", "text")
            .attr("placeholder", "input keyword")
            .appendTo($(searchPanel1));
        var searchPanel2 = document.createElement("div");
        $(searchPanel2).addClass("searchPanel2")
            .appendTo($(panel));
        var i = document.createElement("i");
        $(i).addClass("fa")
            .addClass("fa-search")
            .addClass("fa-lg")
            .appendTo($(searchPanel2));

        console.log(panel.outerHTML);

        //binds events
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
                    browser._network.fit({ nodes: [ui.item.id], animation: true });
                    browser.highlightNode(ui.item.id, true);
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(browser._renderAutoCompletionItem(item))
                .appendTo(ul);
        };
    }

    private createInfoPanel() {
        /*
        <div id="infoPanel" class="infoPanel">
            <div>
                <div id="infoPanel1" class="infoPanel1">node description</div>
                <div id="infoPanel2" class="infoPanel2">
                    <i id="btnCloseInfoPanel" align="center" class="fa fa-close fa-lg btnCloseInfoPanel"></i>
                </div>
            </div>
            <div id="infoBox" class="infoBox"></div>
        </div>
        */
        var htmlInfoPanel = document.createElement("div");
        $(htmlInfoPanel).addClass("infoPanel")
            .appendTo($(document.body));
        var div = document.createElement("div");
        $(div).appendTo($(htmlInfoPanel));
        var infoPanel1 = document.createElement("div");
        $(infoPanel1).addClass("infoPanel1")
            .text("information")
            .appendTo($(div));
        var infoPanel2 = document.createElement("div");
        $(infoPanel2).addClass("infoPanel2")
            .appendTo($(div));
        var btnCloseInfoPanel = document.createElement("i");
        $(btnCloseInfoPanel).addClass("fa")
            .addClass("fa-close")
            .addClass("fa-lg")
            .addClass("btnCloseInfoPanel")
            .attr("align", "center")
            .appendTo($(infoPanel2));

        var htmlInfoBox = document.createElement("div");
        $(htmlInfoBox).addClass("infoBox").
            appendTo($(htmlInfoPanel));

        console.log(htmlInfoPanel.outerHTML);

        //binds events

        $(htmlInfoPanel).draggable();

        $(btnCloseInfoPanel).click(function () {
            $(htmlInfoPanel).hide();
        });

        this._renderNodeDescriptions = function (descriptions: string[]) {
            $(htmlInfoBox).empty();
            descriptions.forEach((description: string) => {
                $(htmlInfoBox).append(description);
            }
            );
            $(htmlInfoPanel).show();
        };
    }

    public setTheme(theme: Theme) {
        this._theme = theme;
        this._jqueryGraphArea.css('background', theme.canvasBackground);
        this._network.setOptions(theme.networkOptions);
    }

    public updateTheme(update: (theme: Theme) => void) {
        update(this._theme);
        this.setTheme(this._theme);
    }

    public getHighlightedNodeIds(): string[] {
        return Object.keys(this._highlightedNodeIds);
    }

    public highlightNode(nodeId: string, showOrNot) {
        if (showOrNot)
            this._highlightedNodeIds[nodeId] = 0;
        else
            delete this._highlightedNodeIds[nodeId];
    }

    public init(callback) {
        this._graphService.requestInit(callback);
    }

    private showMessage(msgCode: string) {
        var pos = this._jqueryGraphArea.position();
        var left = pos.left + (this._jqueryGraphArea.width() - this._jqueryMessageBar.width()) / 2;
        var top = pos.top + (this._jqueryGraphArea.height() - this._jqueryMessageBar.height()) / 2;

        this._jqueryMessageBar.css("left", left).
            css("top", top).
            html("<i class='fa fa-spinner fa-pulse'></i>" + i18n.getMessage(msgCode)).
            show();
    }

    private hideMessage() {
        this._jqueryMessageBar.hide();
    }

    public getNodeLabelMap(): object {
        return this._graphService.getNodeLabelMap();
    }

    public showNodesOfLabel(nodeLabel: string, showOrNot: boolean) {
        var browser = this;
        this._graphService.update4ShowNodesOfLabel(nodeLabel, showOrNot, function (updates) {
            browser._nodes.update(updates);
        });
    }

    private _updateEdges(fnDoUpdate: (node, update) => void) {
        var updates = [];
        this._edges.forEach(edge => {
            var update = { id: edge['id'] };
            fnDoUpdate(edge, update);
            if (Object.keys(update).length > 1)
                updates.push(update);
        }
        );
        if (updates.length > 0)
            this._edges.update(updates);
    }

    public showEdges(showOrNot) {
        showOrNot = !(false === showOrNot);
        this._updateEdges(function (edge, update) {
            update.hidden = !showOrNot;
        });
    }

    public scaleTo(scale) {
        this._network.moveTo({ scale: scale });
    }

    public fits(nodeIds, animation = false) {
        this._network.fit({ nodes: nodeIds, animation: animation });
    }

    public chained(tasksWithCallback) {
        series(tasksWithCallback);
    }

    public showDegrees(showOrNot) {
        this.showGraph({ showDegrees: showOrNot });
    }

    public showFaces(showOrNot) {
        this.showGraph({ showFaces: showOrNot });
    }

    public search(keyword: string, callback: (nodes: any[]) => void) {
        this._graphService.requestSearch(keyword, this._autoCompletionItemLimit, callback);
    }

    public showGraph(showGraphOptions: ShowGraphOptions) {
        showGraphOptions = showGraphOptions || {};
        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);

        if (showGraphOptions.showEdges !== undefined)
            this.showEdges(showGraphOptions.showEdges);

        var updates = this._graphService.update4ShowNodes(showGraphOptions);
        if (updates.length > 0)
            this._nodes.update(updates);
    }

    public loadGraph(options, callback) {
        var browser = this;
        browser.showMessage("LOADING_GRAPH");
        this._graphService.requestLoadGraph(options, function (graphData: GraphData) {
            browser._nodes = new vis.DataSet<vis.Node>(graphData.nodes);
            browser._edges = new vis.DataSet<vis.Edge>(graphData.edges);
            browser._network.setData({ nodes: browser._nodes, edges: browser._edges });

            callback();
            browser.hideMessage();
        });
    }
}