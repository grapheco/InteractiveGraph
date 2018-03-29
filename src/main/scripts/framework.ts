/**
 * Created by bluejoe on 2018/2/24.
 */

import * as vis from "vis";
import { Connector } from './connector/base';
import { Utils, Rect, Point } from "./utils";
import { } from "jquery";
import { } from "jqueryui";
import * as events from "events";
import * as series from "async/series";
import { Themes, Theme } from "./theme";
import { ShowGraphOptions, ScreenData, BrowserEventName, BrowserOptions, EVENT_ARGS_CREATE_BUTTONS } from "./types";
import { Control } from "./control/Control";
import { MessageBoxCtrl } from "./control/MessageBoxCtrl";
import { ToolbarCtrl } from "./control/ToolbarCtrl";

var PI: number = 3.1415926;
var CANVAS_PADDING: number = 80;
var MAX_EDGES_COUNT = 5000;
var MAX_NODES_COUNT = 5000;

export class MainFrame extends events.EventEmitter {
    private _htmlGraphArea: HTMLElement;
    private _minScale: number = 0.1;
    private _maxScale: number = 2;
    private _connector: Connector;
    private _network: vis.Network;

    private _screenData: ScreenData = {
        nodes: new vis.DataSet<vis.Node>(),
        edges: new vis.DataSet<vis.Edge>()
    };

    private _rawData = {
        nodes: [],
        edges: []
    };

    private _autoCompletionItemLimit = 30;
    private _theme: Theme;
    public ctrls = {};

    private _defaultShowGraphOptions: ShowGraphOptions = {
        showNodes: true,
        showEdges: true,
        showLabels: true
    };

    private _showGraphOptions: ShowGraphOptions = {};

    public getConnector() {
        return this._connector;
    }

    public constructor(htmlGraphArea: HTMLElement, options?: BrowserOptions) {
        super();

        options = options || {};
        this._htmlGraphArea = htmlGraphArea;

        this.updateTheme(options.theme);
        var showGraphOptions = options.showGraphOptions || {};
        this._showGraphOptions = Utils.extend(this._defaultShowGraphOptions, showGraphOptions);

        if (options.edgeColorInherit !== undefined) {
            this._theme.networkOptions.edges.color = {
                'inherit': options.edgeColorInherit
            }
        }

        if (options.hideUnselectedEdgeLabel === true) {
            this._theme.networkOptions.edges.font['size'] = 0;
            this._enableHideUnselectedEdgeLabel();
        }

        this._network = new vis.Network(htmlGraphArea, this._screenData,
            this._theme.networkOptions);

        this._bindNetworkEvents();

        this.on(BrowserEventName.CREATE_BUTTONS, (args: EVENT_ARGS_CREATE_BUTTONS) => {
            args.toolbar.addButton({
                icon: "fa fa-search fa-1x",
                tooltip: "help"
            });
        });
    }

    public getScreenData(): ScreenData {
        return this._screenData;
    }

    public addControl(name: string, ctrl: Control): Control {
        this.ctrls[name] = ctrl;
        ctrl.init(this);
        console.log("initialized " + name);

        return ctrl;
    }

    public getContainerElement(): HTMLElement {
        return this._htmlGraphArea;
    }

    public connect(connector: Connector, callback) {
        this._connector = connector;
        this._connector.requestConnect(callback);
    }

    public getNodeCategories() {
        return this._connector.getNodeCategories();
    }

    public updateTheme(theme: Theme | Function) {
        if (theme instanceof Function) {
            theme(this._theme);
        }
        else {
            this._theme = theme || Themes.DEFAULT();
        }

        $(this._htmlGraphArea).css('background', this._theme.canvasBackground);

        if (this._network !== undefined) {
            this._network.setOptions(this._theme.networkOptions);
        }
    }

    public scaleTo(scale: number) {
        this._network.moveTo({ scale: scale });
    }

    public fits(nodeIds: string[], animation = false) {
        this._network.fit({ nodes: nodeIds, animation: animation });
    }

    public pipe(tasksWithCallback) {
        series(tasksWithCallback);
    }

    public search(keyword: any, callback: (nodes: vis.Node[]) => void) {
        this._connector.requestSearch(keyword, this._autoCompletionItemLimit, callback);
    }

    public updateGraph(showGraphOptions: ShowGraphOptions | Function, callback?: () => void) {
        if (showGraphOptions instanceof Function) {
            showGraphOptions(this._showGraphOptions);
        }
        else {
            this._showGraphOptions = showGraphOptions;
        }

        var browser = this;
        browser._screenData.nodes.update(browser._rawData.nodes.map((x) => {
            return browser._formatNode(x, browser._showGraphOptions);
        })
        );
        browser._screenData.edges.update(browser._rawData.edges.map((x) => {
            return browser._formatEdge(x, browser._showGraphOptions);
        })
        );
    }

    public updateNodes(updates: any[]) {
        this._screenData.nodes.update(updates);
    }

    public updateEdges(updates: any[]) {
        this._screenData.edges.update(updates);
    }

    public placeNodes(nodeIds: string[]) {
        if (nodeIds.length == 0)
            return;

        var updates = [];

        var ratio = 1 - 1 / (nodeIds.length * nodeIds.length);
        var jq = $(this._htmlGraphArea);
        var canvasWidth = jq.width();
        var canvasHeight = jq.height();

        var angle = PI, scopeX = ratio * canvasWidth / 3, scopeY = ratio * canvasHeight / 3;
        var delta = 2 * PI / nodeIds.length;

        nodeIds.forEach((nodeId) => {
            var x = scopeX * Math.cos(angle);
            var y = scopeY * Math.sin(angle);
            angle += delta;
            updates.push({ id: nodeId, x: x, y: y, physics: false });
        });

        this._screenData.nodes.update(updates);
    }

    public showNodesOfCategory(className: string, showOrNot: boolean, callback?: () => void) {
        var browser = this;
        this._connector.requestUpdateNodesOfClass(className,
            this._screenData.nodes.getIds(),
            showOrNot,
            (updates) => {
                if (updates.length > 0)
                    this._screenData.nodes.update(updates);

                if (callback !== undefined)
                    callback();
            });
    }

    public clear() {
        this._screenData.nodes.clear();
        this._screenData.edges.clear();
    }

    /**
     * load graph data and show network in current format
     * @param callback
     */
    public load(options, callback: () => void) {
        var browser = this;
        var ctrl: MessageBoxCtrl = browser.ctrls['messageBox'];
        ctrl.showMessage("LOADING_GRAPH");

        this._connector.requestLoadGraph(
            function (nodes: vis.Node[], edges: vis.Edge[]) {
                browser._rawData = { nodes: nodes, edges: edges };

                browser._screenData.nodes = new vis.DataSet<vis.Node>(browser._rawData.nodes.map((x) => {
                    return browser._formatNode(x);
                })
                );
                browser._screenData.edges = new vis.DataSet<vis.Edge>(browser._rawData.edges.map((x) => {
                    return browser._formatEdge(x);
                })
                );

                //too large!!
                if (browser._rawData.nodes.length > MAX_NODES_COUNT ||
                    browser._rawData.edges.length > MAX_EDGES_COUNT)
                    browser.updateTheme((theme: Theme) => {
                        theme.networkOptions.physics = false;
                    });

                browser._network.setData(browser._screenData);

                if (options.scale !== undefined) {
                    browser.scaleTo(options.scale);
                }

                ctrl.hideMessage();
                callback();
            });
    }

    public lockScale(minScale: number, maxScale?: number) {

    }

    /**
     * insert a set of nodes, if some nodes exists, ignore the errors
     * @param nodes nodes to be inserted
     * @returns new node ids (without which exist already)
     */
    public insertNodes(nodes: any[]): string[] {
        var browser = this;

        var newNodeIds = nodes.filter((node) => {
            return this._screenData.nodes.get(node.id) === null;
        }).map((node) => {
            return node.id;
        });

        this._screenData.nodes.update(nodes.map((node) => {
            return browser._formatNode(node);
        }));

        if (newNodeIds.length > 0) {
            this.emit(BrowserEventName.INSERT_NODES, this._network, newNodeIds);
        }

        return newNodeIds;
    }

    /**
     * delete matched nodes
     * @param filter a function tells id the node should be deleted, set undefined if want to delete all
     */
    public deleteNodes(filter: (node) => boolean) {
        if (filter === undefined) {
            this._screenData.nodes.clear();
            return;
        }

        var nodeIds = [];
        this._screenData.nodes.forEach((node) => {
            if (filter(node))
                nodeIds.push(node.id);
        })

        this._screenData.nodes.remove(nodeIds);
    }

    public focusNodes(nodeIds: string[]): void {
        this._network.fit({ nodes: nodeIds, animation: true });
        if (nodeIds.length > 0) {
            this.emit(BrowserEventName.FOCUS_NODES, this._network, nodeIds);
        }
    }

    public insertEdges(edges: any[]): void {
        var browser = this;
        this._screenData.edges.update(edges.map((edge) => {
            return browser._formatEdge(edge);
        }));
    }

    public getTheme(): Theme {
        return this._theme;
    }

    public getNodeById(nodeId: string) {
        return this._screenData.nodes.get(nodeId);
    }

    private _enableHideUnselectedEdgeLabel() {
        var browser = this;

        //hide deselected edges
        this.on(BrowserEventName.NETWORK_SELECT_EDGES, function (network, args) {
            //set font size normal
            if (args.edges.length > 0) {
                var updates = [];
                var edgeIds: string[] = args.edges;
                edgeIds.forEach(edgeId => {
                    updates.push({
                        id: edgeId, font: {
                            size: 11,
                        }
                    });
                }
                );

                browser._screenData.edges.update(updates);
            }
        });

        //hide deselected edges
        this.on(BrowserEventName.NETWORK_DESELECT_EDGES, function (network, args) {
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

                browser._screenData.edges.update(updates);
            }
        });
    }

    private _bindNetworkEvent(networkEventName, browserEventName) {
        var browser: MainFrame = this;
        this._network.on(networkEventName, function (args) {
            //console.debug(browserEventName, args);
            browser.emit(browserEventName, browser._network, args);
        });
    }

    private _bindNetworkEvents() {
        var browser: MainFrame = this;
        var eventsMap = Utils.toMap({
            "click": BrowserEventName.NETWORK_CLICK,
            "doubleClick": BrowserEventName.NETWORK_DBLCLICK,
            "beforeDrawing": BrowserEventName.NETWORK_BEFORE_DRAWING,
            "afterDrawing": BrowserEventName.NETWORK_AFTER_DRAWING,
            "selectEdge": BrowserEventName.NETWORK_SELECT_EDGES,
            "deselectEdge": BrowserEventName.NETWORK_DESELECT_EDGES,
            "dragging": BrowserEventName.NETWORK_DRAGGING,
        });

        eventsMap.forEach((v, k, map) => {
            this._bindNetworkEvent(k, v);
        });
    }

    private _formatEdge(gsonEdge: any, showGraphOptions?: ShowGraphOptions): vis.Edge {
        if (showGraphOptions === undefined)
            showGraphOptions = this._showGraphOptions;

        var visEdge: any = { id: gsonEdge.id };
        visEdge.from = gsonEdge.from;
        visEdge.to = gsonEdge.to;

        if (showGraphOptions.showEdges === false) {
            visEdge.hidden = true;
        }

        return visEdge;
    }

    private _formatNode(gsonNode: any, showGraphOptions?: ShowGraphOptions): vis.Node {
        if (showGraphOptions === undefined)
            showGraphOptions = this._showGraphOptions;

        var visNode: any = { id: gsonNode.id };

        if (gsonNode.x !== undefined) {
            visNode.x = gsonNode.x;
        }

        if (gsonNode.y !== undefined) {
            visNode.y = gsonNode.y;
        }

        ///////show label
        if (showGraphOptions.showLabels === true) {
            visNode.label = gsonNode.label;
        }
        if (showGraphOptions.showLabels === false) {
            visNode.label = null;
        }

        ///////show label
        if (showGraphOptions.showTitles === true) {
            visNode.title = gsonNode.title;
        }
        if (showGraphOptions.showTitles === false) {
            visNode.title = null;
        }

        ///////show node?
        if (showGraphOptions.showNodes === true) {
            visNode.hidden = false;
        }
        if (showGraphOptions.showNodes === false) {
            visNode.hidden = true;
        }

        ///////show face?
        if (showGraphOptions.showFaces === true && gsonNode.image !== undefined && gsonNode.image != "") {
            visNode.shape = 'circularImage';
            visNode.image = gsonNode.image;
        }
        if (showGraphOptions.showFaces === false) {
            visNode.shape = 'dot';
        }

        ///////show group?
        if (showGraphOptions.showGroups === true && gsonNode.group !== undefined) {
            visNode.group = gsonNode.group;
        }
        if (showGraphOptions.showGroups === false) {
            visNode.group = null;
        }

        ///////show degree?
        if (showGraphOptions.showDegrees === true && gsonNode.value !== undefined) {
            visNode.value = gsonNode.value;
        }
        if (showGraphOptions.showDegrees === false) {
            visNode.value = 1;
        }

        return visNode;
    }
}