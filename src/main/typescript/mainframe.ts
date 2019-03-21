/**
 * Created by bluejoe on 2018/2/24.
 */

import * as events from "events";
import "jquery";
import "jqueryui";
import { Control, UIControl } from "./control/Control";
import { GraphService } from './service/service';
import { Theme, Themes } from "./theme";
import { EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_RESIZE, EVENT_ARGS_FRAME_SHOW_INFO, FrameEventName, FRAME_OPTIONS, GraphEdge, GraphEdgeSet, GraphNetwork, GraphNode, GraphNodeSet, LoadGraphOption, NETWORK_OPTIONS, NodeEdgeSet } from "./types";
import { Utils } from "./utils";
import { ToolbarCtrl } from "./control/ToolbarCtrl";
import { InfoBoxCtrl } from "./control/InfoBoxCtrl";
import { RelFinderDialogCtrl } from "./control/RelFinderDialogCtrl";
import { MessageBoxCtrl } from "./control/MessageBoxCtrl";
import { SearchBoxCtrl } from "./control/SearchBoxCtrl";

var CANVAS_PADDING: number = 80;
var MAX_EDGES_COUNT = 5000;
var MAX_NODES_COUNT = 5000;

export abstract class MainFrame {
    private _htmlFrame: HTMLElement;
    private _minScale: number = 0.1;
    private _maxScale: number = 2;
    private _graphService: GraphService;
    private _network: GraphNetwork;
    private _emiter = new events.EventEmitter();
    private _networkOptions: NETWORK_OPTIONS;

    private _screenData: NodeEdgeSet = {
        nodes: new GraphNodeSet(),
        edges: new GraphEdgeSet()
    };

    private _rawData = {
        nodes: [],
        edges: []
    };

    private _autoCompletionItemLimit = 30;
    private _ctrls: Map<string, Control> = new Map<string, Control>();
    private _showGraphOptions: FRAME_OPTIONS = {};
    private _theme: Theme;

    public constructor(htmlFrame: HTMLElement, showGraphOptions: FRAME_OPTIONS, theme?: Theme) {
        this._htmlFrame = htmlFrame;

        this.updateTheme(theme);
        var showGraphOptions = showGraphOptions || {};
        this._showGraphOptions = Utils.deepExtend(this._createDefaultShowGraphOptions(), showGraphOptions);
        this._networkOptions = this._createDefaultNetworkOptions();
        this._network = new GraphNetwork(htmlFrame, this._screenData, this._networkOptions);

        this._bindNetworkEvents();
        this._bindControlEvents(FrameEventName.FRAME_RESIZE);

        this.on(FrameEventName.SHOW_INFO, (args: EVENT_ARGS_FRAME_SHOW_INFO) => {
            this.getGraphService().requestGetNodeInfos(args.nodes,
                function (nodeInfos) {
                    var htmlInfoBox = args.htmlInfoBox;
                    $(htmlInfoBox).append(nodeInfos[0]);
                });
        }
        );
    }

    public emit(event: string, args: object) {
        this._emiter.emit(event, args);
    }

    public fire(event: string, extra?: object) {
        this._emiter.emit(event, this._composeEventArgs(extra));
    }

    public on(event: string, listener: (args: EVENT_ARGS_FRAME) => void) {
        this._emiter.on(event, listener);
    }

    public off(event: string, listener?: (args: EVENT_ARGS_FRAME) => void): Function[] {
        if (listener === undefined) {
            var listeners = this._emiter.listeners(event);
            this._emiter.removeAllListeners(event);
            return listeners;
        }
        else {
            this._emiter.removeListener(event, listener);
            return [listener];
        }
    }

    public getGraphService() {
        return this._graphService;
    }

    public getScreenData(): NodeEdgeSet {
        return this._screenData;
    }

    public removeControlLike<T extends Control>(control: T) {
        var name = control.constructor.name;
        var ctrl: Control = this._ctrls.get(name);
        ctrl.emit(FrameEventName.DESTROY_CONTROL, this._createEventArgs());
        this.fire(FrameEventName.REMOVE_CONTROL, { ctrl: ctrl });
        this._ctrls.delete(name);
    }

    public getRequiredControl(name: string): Control {
        if (!this._ctrls.has(name))
            throw new Error("required control not found: " + name);

        return this._ctrls.get(name);
    }

    public getRequiredControlLike<T extends Control>(control: T): T {
        return <T>this.getRequiredControl(control.constructor.name);
    }

    public addControl<T extends Control>(ctrl: T): T {
        this._ctrls.set(ctrl.constructor.name, ctrl);
        ctrl.emit(FrameEventName.CREATE_CONTROL, this._createEventArgs());
        this.fire(FrameEventName.ADD_CONTROL, { ctrl: ctrl });
        return ctrl;
    }

    protected addDocumentControls(elements: JQuery<HTMLElement>, extra: object) {
        var frame = this;
        //do not use ()=>{}, which makes 'this' wrong
        elements.each(function () {
            var role = $(this).attr("igraph-control-role");
            var ctrl = ControlFactory.createControl(role);
            ctrl.bindElement(this, frame, frame._composeEventArgs(extra));
            frame.addControl(ctrl);

            console.log("document control created: " + role);
        })
    }

    public connectService(service: GraphService, callback) {
        this._graphService = service;
        this._graphService.requestConnect(() => {
            this.fire(FrameEventName.GRAPH_CONNECTED);
            if (callback != undefined)
                callback();
        });
    }

    public updateTheme(theme: Theme | Function) {
        if (theme instanceof Function) {
            theme(this._theme);
        }
        else {
            this._theme = theme || Themes.DEFAULT();
        }

        $(this._htmlFrame).css('background', this._theme.canvasBackground);
        this._notifyControls(FrameEventName.THEME_CHANGED, { theme: this._theme });
    }

    public updateNetworkOptions(options: NETWORK_OPTIONS | Function) {
        if (options instanceof Function) {
            options(this._networkOptions);
        }
        else {
            this._networkOptions = options;
        }

        this._network.setOptions(this._networkOptions);
    }

    public scaleTo(scale: number) {
        this._network.moveTo({ scale: scale });
    }

    public fits(nodeIds: string[], animation = false) {
        this._network.fit({ nodes: nodeIds, animation: animation });
    }

    public redraw() {
        this._network.redraw();
    }

    public search(keyword: any, callback: (nodes: GraphNode[]) => void) {
        this._graphService.requestSearch(keyword, this._autoCompletionItemLimit, callback);
    }

    public updateGraph(showGraphOptions: FRAME_OPTIONS | Function, callback?: () => void) {
        if (showGraphOptions instanceof Function) {
            showGraphOptions(this._showGraphOptions);
        }
        else {
            this._showGraphOptions = showGraphOptions;
        }

        var frame = this;
        frame._screenData.nodes.update(frame._rawData.nodes.map((x) => {
            return frame._formatNode(x, frame._showGraphOptions);
        })
        );
        frame._screenData.edges.update(frame._rawData.edges.map((x) => {
            return frame._formatEdge(x, frame._showGraphOptions);
        })
        );
    }

    public updateNodes(updates: any[]) {
        this._screenData.nodes.update(updates);
    }

    public updateEdges(updates: any[]) {
        this._screenData.edges.update(updates);
    }

    public showNodesOfCategory(className: string, showOrNot: boolean, callback?: () => void) {
        var browser = this;
        var ids = this._screenData.nodes.getIds();
        this._graphService.requestFilterNodesByCategory(className,
            ids,
            (filteredNodeIds) => {
                if (filteredNodeIds.length > 0)
                    this._screenData.nodes.update(ids
                        .filter((nodeId: string) => {
                            return filteredNodeIds.indexOf(nodeId) >= 0;
                        })
                        .map((nodeId: string) => {
                            return { id: nodeId, hidden: !showOrNot };
                        }));

                if (callback !== undefined)
                    callback();
            });
    }

    public clearScreen() {
        this._screenData.nodes.clear();
        this._screenData.edges.clear();
    }

    /**
     * load graph data and show network in current format
     * @param callback
     */
    public loadGraph(options, callback: () => void) {
        var browser = this;
        this._graphService.requestLoadGraph(
            function (nodes: GraphNode[], edges: GraphEdge[], option: LoadGraphOption) {
                browser._rawData = { nodes: nodes, edges: edges };

                browser._screenData.nodes = new GraphNodeSet(browser._rawData.nodes.map((x) => {
                    return browser._formatNode(x);
                })
                );
                browser._screenData.edges = new GraphEdgeSet(browser._rawData.edges.map((x) => {
                    return browser._formatEdge(x);
                })
                );

                //too large!!
                if (
                    ((option || {}).autoLayout === false) ||
                    browser._rawData.nodes.length > MAX_NODES_COUNT ||
                    browser._rawData.edges.length > MAX_EDGES_COUNT) {
                    browser.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                        options.physics = false;
                    });
                }
                browser._network.setData(browser._screenData);

                if (options.scale !== undefined) {
                    browser.scaleTo(options.scale);
                }

                if (callback !== undefined)
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
            this.fire(FrameEventName.INSERT_NODES, { nodes: newNodeIds });
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
            this.fire(FrameEventName.FOCUS_NODES, { nodes: nodeIds });
        }
    }

    public insertEdges(edges: any[]): void {
        var browser = this;
        this._screenData.edges.update(edges.map((edge) => {
            return browser._formatEdge(edge);
        }));
    }

    public getNodeById(nodeId: string) {
        return this._screenData.nodes.get(nodeId);
    }

    public placeNodes(nodeIds: string[]) {
        if (nodeIds.length == 0)
            return;

        var updates = [];

        var ratio = 1 - 1 / (nodeIds.length * nodeIds.length);
        var jq = $(this._htmlFrame);
        var canvasWidth = jq.width();
        var canvasHeight = jq.height();

        var angle = Math.PI, scopeX = ratio * canvasWidth / 3, scopeY = ratio * canvasHeight / 3;
        var delta = 2 * Math.PI / nodeIds.length;

        nodeIds.forEach((nodeId) => {
            var x = scopeX * Math.cos(angle);
            var y = scopeY * Math.sin(angle);
            angle += delta;
            updates.push({ id: nodeId, x: x, y: y, physics: false });
        });

        this.updateNodes(updates);
    }

    private _bindNetworkEvent(networkEventName, frameEventName) {
        var browser: MainFrame = this;
        this._network.on(networkEventName, function (args) {
            browser.fire(frameEventName,
                args instanceof CanvasRenderingContext2D ? { context2d: args } : args);
        });
    }

    private _bindNetworkEvents() {
        var browser: MainFrame = this;
        var eventsMap = Utils.toMap({
            "click": FrameEventName.NETWORK_CLICK,
            "doubleClick": FrameEventName.NETWORK_DBLCLICK,
            "beforeDrawing": FrameEventName.NETWORK_BEFORE_DRAWING,
            "afterDrawing": FrameEventName.NETWORK_AFTER_DRAWING,
            "selectEdge": FrameEventName.NETWORK_SELECT_EDGES,
            "deselectEdge": FrameEventName.NETWORK_DESELECT_EDGES,
            "dragging": FrameEventName.NETWORK_DRAGGING,
            "resize": FrameEventName.FRAME_RESIZE,
        });

        eventsMap.forEach((v, k, map) => {
            this._bindNetworkEvent(k, v);
        });
    }

    private _createEventArgs(): EVENT_ARGS_FRAME {
        return {
            mainFrame: this,
            network: this._network,
            theme: this._theme,
            htmlMainFrame: this._htmlFrame,
        }
    }

    private _formatEdge(gsonEdge: any, showGraphOptions?: FRAME_OPTIONS): GraphEdge {
        if (showGraphOptions === undefined)
            showGraphOptions = this._showGraphOptions;

        var visEdge: any = { id: gsonEdge.id };
        visEdge.from = gsonEdge.from;
        visEdge.to = gsonEdge.to;
        visEdge.hidden = (showGraphOptions.showEdges === false);
        visEdge.label = gsonEdge.label;

        return visEdge;
    }

    private _formatNode(gsonNode: any, showGraphOptions?: FRAME_OPTIONS): GraphNode {
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

    private _bindControlEvents(event: string, event2?: string) {
        var frame = this;
        if (event2 === undefined)
            event2 = event;

        this.on(event, (args: EVENT_ARGS_FRAME_RESIZE) => {
            frame._ctrls.forEach((ctrl: Control, name: string, map) => {
                ctrl.emit(event2, args);
            });
        });
    }

    private _notifyControls(event: string, extra?: object) {
        var args = this._composeEventArgs(extra);
        this._ctrls.forEach((ctrl: Control, name: string, map) => {
            ctrl.emit(event, args);
        });
    }

    private _createDefaultShowGraphOptions(): FRAME_OPTIONS {
        return {
            showNodes: true,
            showEdges: true,
            showLabels: true
        };
    }

    private _composeEventArgs(extra?: object): EVENT_ARGS_FRAME {
        var args: any = this._createEventArgs();

        if (extra !== undefined) {
            for (let key in extra) {
                if (extra.hasOwnProperty(key)) {
                    args[key] = extra[key];
                }
            }
        }

        return args;
    }

    private _createDefaultNetworkOptions(): NETWORK_OPTIONS {
        return {
            layout: {
                improvedLayout: false
            },
            nodes: {
                borderWidth: 0,
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
                width: 0.01,
                font: {
                    size: 11,
                    color: 'green',
                },
                color: {
                    //inherit: 'to',
                    opacity: 0.4,
                    //color: '#cccccc',
                    highlight: '#ff0000',
                    hover: '#ff0000',
                },
                selectionWidth: 0.05,
                hoverWidth: 0.05,
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
                //selectConnectedEdges: false,
            }
        };
    }
}

export class ControlFactory {
    private CONTROL_MAP = {};
    private static _instance = new ControlFactory();

    constructor() {
        this.CONTROL_MAP[new ToolbarCtrl().getTypeName()] = () => new ToolbarCtrl();
        this.CONTROL_MAP[new InfoBoxCtrl().getTypeName()] = () => new InfoBoxCtrl();
        this.CONTROL_MAP[new RelFinderDialogCtrl().getTypeName()] = () => new RelFinderDialogCtrl();
        this.CONTROL_MAP[new MessageBoxCtrl().getTypeName()] = () => new MessageBoxCtrl();
        this.CONTROL_MAP[new SearchBoxCtrl().getTypeName()] = () => new SearchBoxCtrl();
    }

    private _createControl(ctrlTypeName: string): UIControl {
        var factory = this.CONTROL_MAP[ctrlTypeName];
        if (factory === undefined)
            throw new Error("unknown control type: " + ctrlTypeName);

        return factory();
    }

    public static createControl(ctrlTypeName: string): UIControl {
        return ControlFactory._instance._createControl(ctrlTypeName);
    }
}