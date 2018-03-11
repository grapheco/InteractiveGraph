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
import { NodeFlag, NodeHighlightFlag, NodeExpansionFlag } from "./flags";

export class GraphBrowser extends events.EventEmitter {
    static CANVAS_PADDING: number = 80;
    _jqueryMessageBox: JQuery<HTMLElement>;
    _jqueryGraphArea: JQuery<HTMLElement>;
    _minScale: number = 0.1;
    _maxScale: number = 2;
    _graphService: GraphService;
    _network: vis.Network;
    _nodes: vis.DataSet<vis.Node>;
    _edges: vis.DataSet<vis.Edge>;
    _autoCompletionItemLimit = 30;
    _theme: Theme;
    _defaultShowGraphOptions: ShowGraphOptions = {
        showNodes: true,
        showEdges: true,
        showLabels: true
    };
    _showGraphOptions: ShowGraphOptions = {};
    _renderNodeDescriptions: (descriptions: string[]) => void;
    _renderAutoCompletionItem: (item: vis.Node) => string;
    _mapName2Flag: Map<string, NodeFlag<any>> = new Map<string, NodeFlag<any>>();

    public constructor(graphService: GraphService,
        htmlGraphArea: HTMLElement,
        theme: Theme) {
        super();

        //flags
        this._mapName2Flag.set("HIGHLIGHT", new NodeHighlightFlag());
        this._mapName2Flag.set("EXPANSION", new NodeExpansionFlag());

        this._renderNodeDescriptions = (descriptions: string[]) => {
            console.log(descriptions);
        };

        this._renderAutoCompletionItem = (item: vis.Node) => {
            return "<b>" + item.label + "</b>";
        };

        //message bar
        this._jqueryMessageBox = $(document.createElement("div"))
            .addClass("messageBox")
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
                //browser._mapNodeId2HighlightStatus.clear();
                browser._getSafeFlag("HIGHLIGHT").clear();
                return;
            }

            var nodeIds = args.nodes;
            nodeIds.forEach(nodeId => {
                //if expanded?
                //if (browser._mapNodeId2ExpandStatus.get(nodeId) == -1) {
                if (browser._getSafeFlag("EXPANSION").get(nodeId) == -1) {
                    browser.expandNode(nodeId);

                    return;
                }

                //hightlight?
                var flagHighlight = browser._getSafeFlag("HIGHLIGHT");
                if (!flagHighlight.has(nodeId)) {
                    flagHighlight.set(nodeId, 0);
                }
                else {
                    flagHighlight.unset(nodeId);
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
            browser._mapName2Flag.forEach((v, k, map) => {
                v.beforeDrawing(browser, ctx);
            })
        });

        this._network.on("afterDrawing", function (ctx) {
            browser._mapName2Flag.forEach((v, k, map) => {
                v.afterDrawing(browser, ctx);
            })
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

        $(htmlSearchBox).autocomplete({
            source: function (request, response) {
                var term = request.term;
                browser.search(term, function (nodes: vis.Node[]) {
                    response(nodes.map((node) => {
                        return {
                            value: node.label,
                            label: node.label,
                            node: node
                        };
                    }));
                });
            },

            select: function (event, ui) {
                var node: vis.Node = ui.item.node;
                if (node !== undefined) {
                    $(htmlSearchBox).val(node.label);
                    browser.addOrUpdateNodes([node]);
                    browser.markNode("" + node.id, "HIGHLIGHT", true);
                    browser._network.fit({ nodes: ["" + node.id], animation: true });
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(browser._renderAutoCompletionItem(item.node))
                .appendTo(ul);
        };
    }

    public expandNode(nodeId: string) {
        var browser = this;
        this._graphService.asyncGetNeighbours(
            nodeId,
            browser._showGraphOptions,
            function (neighbourNodes: object[], neighbourEdges: object[]) {
                browser.addOrUpdateNodes(neighbourNodes);

                neighbourNodes.forEach((node: any) => {
                    browser.markNode(node.id, "EXPANSION");
                });

                browser._edges.update(neighbourEdges);
                browser.markNode(nodeId, "EXPANSION", neighbourEdges.length);
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

    public getMarkedNodeIds(flagName: string): string[] {
        return this._getSafeFlag(flagName).getMarkedNodeIds();
    }

    public init(callback) {
        this._graphService.asyncInit(callback);
    }

    private _showMessage(msgCode: string) {
        var pos = this._jqueryGraphArea.position();
        var left = pos.left + (this._jqueryGraphArea.width() - this._jqueryMessageBox.width()) / 2;
        var top = pos.top + (this._jqueryGraphArea.height() - this._jqueryMessageBox.height()) / 2;

        this._jqueryMessageBox.css("left", left)
            .css("top", top)
            .css("text-align", "center")
            .html("<i class='fa fa-spinner fa-spin'></i> " + i18n.getMessage(msgCode)).
            show();
    }

    private _hideMessage() {
        this._jqueryMessageBox.hide();
    }

    public getMapName2Class(): object {
        return this._graphService.getMapName2Class();
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

    public search(keyword: any, callback: (nodes: vis.Node[]) => void) {
        this._graphService.asyncSearch(keyword, this._autoCompletionItemLimit, this._showGraphOptions, callback);
    }

    public updateGraph(showGraphOptions: ShowGraphOptions, callback?: () => void) {
        showGraphOptions = showGraphOptions || {};
        this._showGraphOptions = Utils.extend(this._showGraphOptions, showGraphOptions);

        if (showGraphOptions.showEdges !== undefined)
            this.showEdges(showGraphOptions.showEdges);

        if (showGraphOptions.showDegrees !== undefined
            || showGraphOptions.showFaces !== undefined
            || showGraphOptions.showGroups !== undefined
            || showGraphOptions.showLabels !== undefined
            || showGraphOptions.showTitles !== undefined)

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

    public loadGraph(showGraphOptions: ShowGraphOptions, callback: () => void) {
        var browser = this;
        browser._showMessage("LOADING_GRAPH");
        this._showGraphOptions = Utils.extend(this._defaultShowGraphOptions, showGraphOptions);

        this._graphService.asyncLoadGraph(this._showGraphOptions,
            function (nodes: vis.Node[], edges: vis.Edge[]) {
                browser._nodes = new vis.DataSet<vis.Node>(nodes);
                browser._edges = new vis.DataSet<vis.Edge>(edges);
                browser._network.setData({ nodes: browser._nodes, edges: browser._edges });

                callback();
                browser._hideMessage();
            });
    }

    public lockScale(minScale: number, maxScale?: number) {

    }

    public markNodes(nodeIds: string[], flagName: string, value?: any) {
        nodeIds.forEach((nodeId) => {
            this.markNode(nodeId, flagName, value);
        }
        );
    }

    public markNode(nodeId: string, flagName: string, value?: any) {
        this._getSafeFlag(flagName).set(nodeId, value);
    }

    public unmarkNode(nodeId: string, flagName: string) {
        this._getSafeFlag(flagName).unset(nodeId);
    }

    public unmarkNodes(nodeIds: string[], flagName: string) {
        nodeIds.forEach((nodeId) => {
            this.unmarkNode(nodeId, flagName);
        }
        );
    }

    private _getSafeFlag(flagName: string) {
        if (!this._mapName2Flag.has(flagName))
            throw new ReferenceError("unrecognized tag name: " + flagName);

        return this._mapName2Flag.get(flagName);
    }

    public addOrUpdateNodes(nodes: any[]) {
        this._nodes.update(nodes);
    }
}