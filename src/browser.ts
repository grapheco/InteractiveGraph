/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphService } from './service';
import * as vis from "vis";
import { Utils, Rect, Point } from "./utils";
import { i18n } from "./messages";
import * as $ from "jquery";
import * as events from "events";

export class GraphBrowser extends events.EventEmitter {
    static CANVAS_PADDING: number = 80;

    private _infoBox: JQuery<HTMLElement>;
    private _messageBar: JQuery<HTMLElement>;
    private _graphService: GraphService;
    public network: vis.Network;

    public constructor(graphService: GraphService, htmlGraphArea: HTMLElement, htmlInfoBox: HTMLElement) {
        super();
        this._infoBox = $(htmlInfoBox);
        //message bar
        this._messageBar = $(document.createElement("div"));
        this._messageBar.addClass("messageBar");
        this._messageBar.hide();

        this._graphService = graphService;

        var options = this.getDefaultOptions();
        this.network = new vis.Network(htmlGraphArea, {
            nodes: [],
            edges: []
        }, options);

        var browser = this;

        this.network.on("click", function (args) {
            if (args.nodes.length > 0) {
                browser.showNodesInfo(args.nodes);
            }
        });

        this._graphService.init();
    }

    private showMessage(msgCode) {
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

    public showNodesInfo(nodeIds: string[]) {
        var browser = this;
        if (nodeIds.length > 0 && this._infoBox !== undefined) {
            this._graphService.getNodesInfo(nodeIds, function (nodeInfos) {
                console.log(nodeInfos);
                browser._infoBox.text(nodeInfos.toString());
            });
        }
    };

    public loadGraph(options) {
        var browser = this;
        this._graphService.loadGraph(options, function (graphData) {
            browser.network.setData(graphData);
        });
    }
}