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
    private _graphService: GraphService;
    private _network: vis.Network;
    private _nodes: vis.DataSet<vis.Node>;
    private _edges: vis.DataSet<vis.Edge>;
    private _autoCompletionItemLimit = 30;
    private _theme: Theme;
    private _jqueryGraphArea: JQuery<HTMLElement>;
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
        this._jqueryMessageBar = $(document.createElement("div"));
        this._jqueryMessageBar.addClass("messageBar");
        this._jqueryMessageBar.hide();

        this._graphService = graphService;

        this._nodes = new vis.DataSet<vis.Node>();
        this._edges = new vis.DataSet<vis.Edge>();
        this._theme = theme || Themes.DEFAULT();
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

            var nodePositions: any = browser._network.getPositions(nodeIds);
            for (let key in nodePositions) {
                var pos = nodePositions[key];
                var box = browser._network.getBoundingBox(key);
                ctx.circle(pos.x, pos.y, pos.y - box.top + 5);
                //ctx.fill();
                ctx.stroke();
            }
        });
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

    public bindInfoBox(htmlInfoBox: HTMLElement) {
        this._renderNodeDescriptions = function (descriptions: string[]) {
            $(htmlInfoBox).empty();
            descriptions.forEach((description: string) => {
                $(htmlInfoBox).append(description);
            }
            )
        };
    }

    public bindSearchBox(htmlSearchBox: HTMLElement) {
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

    public init(callback) {
        this._graphService.requestInit(callback);
    }

    private showMessage(msgCode: string) {
        this._jqueryMessageBar.html(i18n.getMessage(msgCode));
        this._jqueryMessageBar.show();
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

    public highlight(nodeIds) {
        this._network.fit({ nodes: nodeIds, animation: true });
        this._network.selectNodes(nodeIds, false);
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
        this._graphService.requestLoadGraph(options, function (graphData: GraphData) {
            browser._nodes = new vis.DataSet<vis.Node>(graphData.nodes);
            browser._edges = new vis.DataSet<vis.Edge>(graphData.edges);
            browser._network.setData({ nodes: browser._nodes, edges: browser._edges });

            callback();
        });
    }
}