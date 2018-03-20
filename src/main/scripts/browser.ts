/**
 * Created by bluejoe on 2018/2/24.
 */

import * as vis from "vis";
import { GraphService } from './service/service';
import { Utils, Rect, Point } from "./utils";
import { } from "jquery";
import { } from "jqueryui";
import * as events from "events";
import * as series from "async/series";
import { Themes, Theme } from "./theme";
import { ShowGraphOptions, BrowserEventName, BrowserOptions } from "./types";
import { Control, Controls } from "./control/Control";
import { MessageBoxCtrl } from "./control/MessageBoxCtrl";

var PI: number = 3.1415926;
var CANVAS_PADDING: number = 80;

export class GraphBrowser extends events.EventEmitter {
    public _jqueryGraphArea: JQuery<HTMLElement>;
    private _minScale: number = 0.1;
    private _maxScale: number = 2;
    private _graphService: GraphService;
    private _network: vis.Network;
    private _nodes: vis.DataSet<vis.Node>;
    private _edges: vis.DataSet<vis.Edge>;
    private _autoCompletionItemLimit = 30;
    private _theme: Theme;

    private _defaultShowGraphOptions: ShowGraphOptions = {
        showNodes: true,
        showEdges: true,
        showLabels: true
    };

    public addControl(ctrlName: string, ctrl?: Control) {
        if (ctrl === undefined)
            ctrl = Controls.ALL[ctrlName];

        var control = ctrl;
        this[ctrlName] = control;
        return control;
    }

    private _showGraphOptions: ShowGraphOptions = {};

    public constructor(graphService: GraphService,
        htmlGraphArea: HTMLElement,
        options?: BrowserOptions) {
        super();

        this._graphService = graphService;

        this._nodes = new vis.DataSet<vis.Node>();
        this._edges = new vis.DataSet<vis.Edge>();

        options = options || {};
        this._jqueryGraphArea = $(htmlGraphArea);

        this.updateTheme(options.theme);
        var showGraphOptions = options.showGraphOptions || {};
        this._showGraphOptions = Utils.extend(this._defaultShowGraphOptions, showGraphOptions);

        this._network = new vis.Network(htmlGraphArea, {
            nodes: this._nodes,
            edges: this._edges
        }, this._theme.networkOptions);

        this._bindNetworkEvents();

        var controls = ["ctrlMessageBox"];
        if (options.enableShowInfoCtrl !== false)
            controls.push("ctrlShowInfo");
        if (options.enableSearchCtrl !== false)
            controls.push("ctrlSearch");
        if (options.enableHighlightCtrl !== false)
            controls.push("ctrlHighlight");
        if (options.enableExpansionCtrl == true)
            controls.push("ctrlExpansion");
        if (options.enableRelFinderCtrl == true)
            controls.push("ctrlRelFinder");

        controls.forEach((ctrlName) => {
            var ctrl = this.addControl(ctrlName);
            ctrl.init(this, this._network, this._graphService);
            console.log("initialized " + ctrlName);
        })
    }

    private _bindNetworkEvent(networkEventName, browserEventName) {
        var browser: GraphBrowser = this;
        this._network.on(networkEventName, function (args) {
            browser.emit(browserEventName, browser._network, args);
        });
    }

    private _bindNetworkEvents() {
        var browser: GraphBrowser = this;
        var eventsMap = Utils.toMap({
            "click": BrowserEventName.NETWORK_CLICK,
            "doubleClick": BrowserEventName.NETWORK_DBLCLICK,
            "beforeDrawing": BrowserEventName.NETWORK_BEFORE_DRAWING,
            "afterDrawing": BrowserEventName.NETWORK_AFTER_DRAWING,
        });

        eventsMap.forEach((v, k, map) => {
            this._bindNetworkEvent(k, v);
        });

        //hide deselected edges
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

        //hide deselected edges
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

    public updateTheme(theme: Theme | Function) {
        if (theme instanceof Function) {
            theme(this._theme);
        }
        else {
            this._theme = theme || Themes.DEFAULT();
        }

        this._jqueryGraphArea.css('background', this._theme.canvasBackground);
        if (this._network !== undefined)
            this._network.setOptions(this._theme.networkOptions);
    }

    public init(callback) {
        this._graphService.requestInit(callback);
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

    public pipe(tasksWithCallback) {
        series(tasksWithCallback);
    }

    public showDegrees(showOrNot) {
        this.redrawGraph((options: ShowGraphOptions) => {
            options.showDegrees = showOrNot;
        });
    }

    public showFaces(showOrNot) {
        this.redrawGraph((options: ShowGraphOptions) => {
            options.showFaces = showOrNot;
        });
    }

    public search(keyword: any, callback: (nodes: vis.Node[]) => void) {
        this._graphService.requestSearch(keyword, this._autoCompletionItemLimit, this._showGraphOptions, callback);
    }

    public redrawGraph(showGraphOptions: ShowGraphOptions | Function, callback?: () => void) {
        if (showGraphOptions instanceof Function) {
            showGraphOptions(this._showGraphOptions);
        }
        else {
            this._showGraphOptions = showGraphOptions;
        }

        if (this._showGraphOptions.showEdges !== undefined)
            this.showEdges(this._showGraphOptions.showEdges);

        if (this._showGraphOptions.showDegrees !== undefined
            || this._showGraphOptions.showFaces !== undefined
            || this._showGraphOptions.showGroups !== undefined
            || this._showGraphOptions.showLabels !== undefined
            || this._showGraphOptions.showTitles !== undefined) {
            this._updateNodes(this._nodes.getIds(), this._showGraphOptions, callback);
        }
    }

    public placeNodes(nodeIds: string[]) {
        if (nodeIds.length == 0)
            return;

        var updates = [];

        var ratio = 1 - 1 / nodeIds.length;
        var canvasWidth = this._jqueryGraphArea.width();
        var canvasHeight = this._jqueryGraphArea.height();

        var angle = PI, scopeX = ratio * canvasWidth / 3, scopeY = ratio * canvasHeight / 3;
        var delta = 2 * PI / nodeIds.length;

        nodeIds.forEach((nodeId) => {
            var x = scopeX * Math.cos(angle);
            var y = scopeY * Math.sin(angle);
            angle += delta;
            updates.push({ id: nodeId, x: x, y: y });
        });

        this._nodes.update(updates);
    }

    private _updateNodes(nodeIds: any[], showGraphOptions: ShowGraphOptions, callback?: () => void) {
        this._graphService.requestUpdate4ShowNodes(
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
        this._graphService.requestUpdateNodesOfClass(className,
            this._nodes.getIds(),
            showOrNot,
            (updates) => {
                if (updates.length > 0)
                    this._nodes.update(updates);

                if (callback !== undefined)
                    callback();
            });
    }

    public loadGraph(callback: () => void) {
        var browser = this;
        var ctrl: MessageBoxCtrl = browser['ctrlMessageBox'];
        ctrl.showMessage("LOADING_GRAPH");

        this._graphService.requestLoadGraph(this._showGraphOptions,
            function (nodes: vis.Node[], edges: vis.Edge[]) {
                browser._nodes = new vis.DataSet<vis.Node>(nodes);
                browser._edges = new vis.DataSet<vis.Edge>(edges);
                browser._network.setData({ nodes: browser._nodes, edges: browser._edges });

                callback();
                ctrl.hideMessage();
            });
    }

    public lockScale(minScale: number, maxScale?: number) {

    }

    public getShowGraphOptions(): ShowGraphOptions {
        return this._showGraphOptions;
    }

    /**
     * insert a set of nodes, if some nodes exists, ignore the errors
     * @param nodes nodes to be inserted
     * @returns new nodes (without which exist already)
     */
    public insertNodes(nodes: any[]): string[] {
        var newNodes = nodes.filter((node) => {
            return this._nodes.get(node.id) === null;
        });

        this._nodes.update(nodes);
        var newNodeIds = newNodes.map((node) => {
            return node.id;
        });

        if (newNodes.length > 0) {
            this.emit(BrowserEventName.INSERT_NODE, this._network, newNodeIds);
        }

        return newNodeIds;
    }

    public focusNodes(nodeIds: string[]): void {
        this._network.fit({ nodes: nodeIds, animation: true });
        if (nodeIds.length > 0) {
            this.emit(BrowserEventName.FOCUS_NODE, this._network, nodeIds);
        }
    }

    public insertEdges(edges: any[]): void {
        this._edges.update(edges);
    }

    public getTheme(): Theme {
        return this._theme;
    }

    public getNodeById(nodeId: string) {
        return this._nodes.get(nodeId);
    }
}