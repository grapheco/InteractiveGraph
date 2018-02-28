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

    private _messageBar: JQuery<HTMLElement>;
    private _graphService: GraphService;
    private _network: vis.Network;
    private _nodes: vis.DataSet<vis.Node>;
    private _edges: vis.DataSet<vis.Edge>;

    private _nodesInfoPrinter: (nodeInfos: string[]) => void = function (nodeInfos) {
        console.log(nodeInfos);
    }

    public constructor(graphService: GraphService,
        htmlGraphArea: HTMLElement) {
        super();

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
            var nodeIds = args.nodes;
            if (nodeIds.length > 0) {
                browser._graphService.getNodesInfo(nodeIds, function (nodeInfos) {
                    browser._nodesInfoPrinter(nodeInfos);
                });
            }
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
    }

    public setInfoBox(htmlInfoBox: HTMLElement) {
        this.setInfoPrinter((nodesInfo: string[]) => {
            $(htmlInfoBox).empty();
            nodesInfo.forEach((nodeInfo: string) => {
                var div = document.createElement("div");
                $(div).html(nodeInfo);
                $(htmlInfoBox).append($(div));
            }
            )
        }
        );
    }

    public setInfoPrinter(nodesInfoPrinter: (nodeInfos: string[]) => void) {
        this._nodesInfoPrinter = nodesInfoPrinter;
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

    public focus(nodeIds) {
        this._network.selectNodes(nodeIds, false);
        this._network.fit({ nodes: nodeIds, animation: false });
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

    public run(tasks) {
        series(tasks);
    }

    public showDegrees(showOrNot) {
        this.showGraph({ showDegrees: showOrNot });
    }

    public showFaces(showOrNot) {
        this.showGraph({ showFaces: showOrNot });
    }

    public showGraph(showGraphOptions: ShowGraphOptions) {
        showGraphOptions = showGraphOptions || {};
        if (showGraphOptions.scale !== undefined)
            this.scaleTo(showGraphOptions.scale);

        if (showGraphOptions.showEdges !== undefined)
            this.showEdges(showGraphOptions.showEdges);

        var updates = this._graphService.updateNodes(showGraphOptions);
        if (updates.length > 0)
            this._nodes.update(updates);
    }

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