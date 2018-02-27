/**
 * Created by bluejoe on 2018/2/24.
 */


import * as vis from "vis";

import { GraphService } from './service';
import { Utils, Rect, Point } from "./utils";
import { i18n } from "./messages";
import * as $ from "jquery";
import * as events from "events";
import * as series from "async/series";

export class GraphBrowser extends events.EventEmitter {
    static CANVAS_PADDING: number = 80;

    private _infoBox: JQuery<HTMLElement>;
    private _messageBar: JQuery<HTMLElement>;
    private _graphService: GraphService;
    private _network: vis.Network;
    private _nodes: vis.DataSet<vis.Node>;
    private _edges: vis.DataSet<vis.Edge>;
    private _fnFormatNodesInfo;

    public constructor(graphService: GraphService,
        htmlGraphArea: HTMLElement,
        htmlInfoBox: HTMLElement,
        fnFormatNodesInfo: (object) => string) {
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
        this._nodes = new vis.DataSet<vis.Node>();
        this._edges = new vis.DataSet<vis.Edge>();

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

    public init(callback) {
        this._graphService.init(callback);
    }

    private showMessage(msgCode: string) {
        this._messageBar.html(i18n.getMessage(msgCode));
        this._messageBar.show();
    }

    private hideMessage() {
        this._messageBar.hide();
    }

    private getDefaultOptions(): vis.Options {
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

    public focus(nodeIds) {
        this._network.selectNodes(nodeIds, false);
        this._network.fit({ nodes: nodeIds, animation: false });
    }

    private _updateEdges(functionDoUpdate: (node, update) => void) {
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

    private _showEdges(showOrNot) {
        showOrNot = !(false === showOrNot);
        this._updateEdges(function (edge, update) {
            update.hidden = !showOrNot;
        });
    }

    public scaleTo(scale) {
        this._network.moveTo({ scale: scale });
    }

    public run(tasks) {
        series(tasks);
    }

    public showGraph(showGraphOptions: ShowGraphOptions) {
        showGraphOptions = showGraphOptions || {};
        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);

        if (showGraphOptions.showEdges !== undefined)
            this._showEdges(showGraphOptions.showEdges);

        var updates = this._graphService.updateNodes(showGraphOptions);
        if (updates.length > 0)
            this._nodes.update(updates);
    }

    public showNodesInfo(nodeIds: string[]) {
        var browser = this;
        if (nodeIds.length > 0 && this._infoBox !== undefined) {
            this._graphService.getNodesInfo(nodeIds, function (nodeInfos) {
                console.log(nodeInfos);
                browser._infoBox.html(browser._fnFormatNodesInfo(nodeInfos));
            });
        }
    };

    public loadGraph(options, callback) {
        var browser = this;
        this._graphService.loadGraph(options, function (graphData: GraphData) {
            browser._nodes = new vis.DataSet<vis.Node>(graphData.nodes);
            browser._edges = new vis.DataSet<vis.Edge>(graphData.edges);
            browser._network.setData({ nodes: browser._nodes, edges: browser._edges });

            callback();
        });
    }
}