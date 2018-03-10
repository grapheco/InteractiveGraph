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
    private _showGraphOptions: ShowGraphOptions = {};
    public _renderNodeDescriptions: (descriptions: string[]) => void;
    public _renderAutoCompletionItem: (item: SearchResult) => string;
    private _mapNodeId2HighlightStatus: Map<string, number> = new Map<string, number>();
    private _mapNodeId2ExpandStatus: Map<string, number> = new Map<string, number>();

    public constructor(graphService: GraphService,
        htmlGraphArea: HTMLElement,
        theme: Theme) {
        super();

        this._renderNodeDescriptions = (descriptions: string[]) => {
            console.log(descriptions);
        };

        this._renderAutoCompletionItem = (item: SearchResult) => {
            return "<b>" + item.value + "</b>"
                + (item.title === undefined ? "" : "<br>" + item.title);
        }
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
                browser._graphService.asyncGetNodeDescriptions(nodeIds, function (nodeInfos) {
                    browser._renderNodeDescriptions(nodeInfos);
                });
            }
        });

        this._network.on("doubleClick", function (args) {
            //double click on backgroud (no nodes selected)
            if (args.nodes.length == 0 && args.edges.length == 0) {
                browser._mapNodeId2HighlightStatus.clear();
                return;
            }

            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                //if expanded?
                if (browser._mapNodeId2ExpandStatus.get(nodeId) == -1) {
                    browser.expandNode(nodeId);

                    return;
                }

                //hightlight?
                if (!browser._mapNodeId2HighlightStatus.has(nodeId)) {
                    browser._mapNodeId2HighlightStatus.set(nodeId, 0);
                }
                else {
                    browser._mapNodeId2HighlightStatus.delete(nodeId);
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
            //draw highlighted nodes
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

        this._network.on("afterDrawing", function (ctx) {
            //draw unexpanded nodes
            ctx.save();
            ctx.lineWidth = 1;
            var colors = browser._theme.nodeUnexpanedColor;
            ctx.strokeStyle = colors[2];

            browser._mapNodeId2ExpandStatus.forEach((v, k, map) => {
                var nodeId = k;
                var node: any = browser._nodes.get(nodeId);
                if (!node.hidden) {
                    var nodePositions: any = browser._network.getPositions([nodeId]);
                    var pos = nodePositions[nodeId];
                    /*
                    ctx.font = "20px FontAwesome";
                    ctx.strokeText(v == -1 ? "\uf0e0" : "\uf0e9", pos.x - 15, pos.y - 8);
                    ctx.font = "10px Arail";
                    ctx.strokeText(v == -1 ? "?" : "" + v, pos.x + 5, pos.y);
                    */
                    var box = browser._network.getBoundingBox(nodeId);
                    var r = pos.y - box.top;
                    var r2 = r / 1.414;
                    var x2 = pos.x + r2;
                    var y2 = pos.y + r2;
                    ctx.circle(x2, y2, 10);

                    ctx.fillStyle = v == -1 ? colors[0] : colors[1];
                    ctx.fill();

                    ctx.font = "10px Arail";
                    var text: string = v == -1 ? "?" : "" + v;
                    ctx.strokeText(text, x2 - 2.5 * text.length, y2 - 5);
                }
            }
            );

            ctx.restore();
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

        //binds events
        var browser = this;
        $(htmlSearchBox).change(function () {
            $(htmlSearchBox).data("boundSearchResult", {});
        });

        $(htmlSearchBox).autocomplete({
            source: function (request, response) {
                var term = request.term;
                browser.search(term, function (nodes: SearchResult[]) {
                    response(nodes);
                });
            },
            change: function (event, ui) {
                if (ui.item !== undefined) {
                    $(htmlSearchBox).data("boundSearchResult", ui.item);
                }
                else {
                    $(htmlSearchBox).data("boundSearchResult", {});
                }
                return false;
            },
            select: function (event, ui) {
                var result: SearchResult = ui.item;
                if (result !== undefined) {
                    $(htmlSearchBox).val(result.value);
                    browser._network.fit({ nodes: [result.nodeId], animation: true });
                    browser.highlightNode(result.nodeId, true);
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(browser._renderAutoCompletionItem(item))
                .appendTo(ul);
        };
    }

    public expandNode(nodeId: string) {
        var browser = this;
        this._graphService.asyncGetNeighbours(nodeId,
            function (neighbourNodes: object[], neighbourEdges: object[]) {
                browser.addUnexpandedNodes(neighbourNodes.map((node: any) => {
                    return node.id;
                }));
                browser._edges.update(neighbourEdges);
                browser._mapNodeId2ExpandStatus.set(nodeId, neighbourEdges.length);
            });
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
        return Utils.toArray(this._mapNodeId2HighlightStatus.keys());
    }

    public highlightNode(nodeId: string, showOrNot) {
        if (showOrNot)
            this._mapNodeId2HighlightStatus.set(nodeId, 0);
        else
            this._mapNodeId2HighlightStatus.delete(nodeId);
    }

    public init(callback) {
        this._graphService.asyncInit(callback);
    }

    private _showMessage(msgCode: string) {
        var pos = this._jqueryGraphArea.position();
        var left = pos.left + (this._jqueryGraphArea.width() - this._jqueryMessageBar.width()) / 2;
        var top = pos.top + (this._jqueryGraphArea.height() - this._jqueryMessageBar.height()) / 2;

        this._jqueryMessageBar.css("left", left)
            .css("top", top)
            .css("text-align", "center")
            .html("<i class='fa fa-spinner fa-spin'></i> " + i18n.getMessage(msgCode)).
            show();
    }

    private _hideMessage() {
        this._jqueryMessageBar.hide();
    }

    public getNodeLabelMap(): object {
        return this._graphService.getNodeLabelMap();
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
        this.updateGraph({ showDegrees: showOrNot });
    }

    public showFaces(showOrNot) {
        this.updateGraph({ showFaces: showOrNot });
    }

    public search(keyword: any, callback: (nodes: SearchResult[]) => void) {
        this._graphService.asyncSearch(keyword, this._autoCompletionItemLimit, callback);
    }

    public updateGraph(showGraphOptions: ShowGraphOptions, callback?: () => void) {
        showGraphOptions = showGraphOptions || {};
        this._showGraphOptions = showGraphOptions;

        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);

        if (showGraphOptions.showEdges !== undefined)
            this.showEdges(showGraphOptions.showEdges);

        this._updateNodes(this._nodes.getIds(), showGraphOptions, callback);
    }

    private _updateNodes(nodeIds: any[], showGraphOptions: ShowGraphOptions, callback?: () => void) {
        this._graphService.asyncUpdate4ShowNodes(
            nodeIds,
            showGraphOptions,
            (updates) => {
                if (updates.length > 0)
                    this._nodes.update(updates);

                if (callback !== undefined)
                    callback();
            });
    }

    public showNodesOfClass(className: string, showOrNot: boolean, callback?: () => void) {
        var browser = this;
        this._graphService.asyncUpdateNodesOfClass(className,
            this._nodes.getIds(),
            showOrNot,
            (updates) => {
                if (updates.length > 0)
                    this._nodes.update(updates);

                if (callback !== undefined)
                    callback();
            });
    }

    private _filterGraphNodes(src: any): any {
        return Utils.partOf(
            ["id", "label", "title", "value", "image", "group", "shape"],
            src);
    }

    private _filterGraphEdges(src: any): any {
        return Utils.partOf(
            ["id", "from", "to", "label", "title", "value"],
            src);
    }

    public loadGraph(options, callback) {
        var browser = this;
        browser._showMessage("LOADING_GRAPH");
        this._graphService.asyncLoadGraph(options, function (graphData: GraphData) {
            browser._nodes = new vis.DataSet<vis.Node>(graphData.nodes.map((item) => {
                return browser._filterGraphNodes(item);
            }));
            browser._edges = new vis.DataSet<vis.Edge>(graphData.edges.map((item) => {
                return browser._filterGraphEdges(item);
            }));
            browser._network.setData({ nodes: browser._nodes, edges: browser._edges });

            callback();
            browser._hideMessage();
        });
    }

    public addUnexpandedNodes(nodeIds: string[]) {
        var browser = this;
        nodeIds.forEach((nodeId: string) => {
            if (!this._mapNodeId2ExpandStatus.has(nodeId))
                this._mapNodeId2ExpandStatus.set(nodeId, -1);
        });

        //NOTE: must show label for new node!!!
        var opts = { showLabel: true };
        Utils.extend(opts, this._showGraphOptions);
        this._updateNodes(nodeIds, opts);
    }
}