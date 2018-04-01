/**
 * Created by bluejoe on 2018/2/24.
 */

import * as vis from "vis";
import { Connector } from './connector/connector';
import { Utils, Rect, Point } from "./utils";
import { } from "jquery";
import { } from "jqueryui";
import * as events from "events";
import * as series from "async/series";
import { Themes, Theme } from "./theme";
import { ShowGraphOptions, NodeNEdgeSets, FrameEventName, BrowserOptions, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT } from "./types";
import { Control } from "./control/Control";
import { ToolbarCtrl } from "./control/ToolbarCtrl";

var CANVAS_PADDING: number = 80;
var MAX_EDGES_COUNT = 5000;
var MAX_NODES_COUNT = 5000;

export class MainFrame {
    private _htmlFrame: HTMLElement;
    private _minScale: number = 0.1;
    private _maxScale: number = 2;
    private _connector: Connector;
    private _network: vis.Network;
    private _emmiter = new events.EventEmitter();

    private _screenData: NodeNEdgeSets = {
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

    public fire(event: string, extra?: object) {
        var args: any = this._createEventArgs();

        if (extra !== undefined) {
            for (let key in extra) {
                if (extra.hasOwnProperty(key)) {
                    args[key] = extra[key];
                }
            }
        }

        this._emmiter.emit(event, args);
    }

    public on(event: string, listener: (args: EVENT_ARGS_FRAME) => void) {
        this._emmiter.on(event, listener);
    }

    public off(event: string, listener?: (args: EVENT_ARGS_FRAME) => void): Function[] {
        if (listener === undefined) {
            var listeners = this._emmiter.listeners(event);
            this._emmiter.removeAllListeners(event);
            return listeners;
        }
        else {
            this._emmiter.removeListener(event, listener);
            return [listener];
        }
    }

    public constructor(htmlFrame: HTMLElement, options: BrowserOptions,
        onCreateFrame: (args: EVENT_ARGS_FRAME) => void) {
        options = options || {};
        this._htmlFrame = htmlFrame;

        this.updateTheme(options.theme);
        var showGraphOptions = options.showGraphOptions || {};
        this._showGraphOptions = Utils.deepExtend(this._defaultShowGraphOptions, showGraphOptions);

        this._network = new vis.Network(htmlFrame, this._screenData,
            this._theme.networkOptions);

        this._bindNetworkEvents();

        if (onCreateFrame !== undefined) {
            onCreateFrame(this._createEventArgs());
        }
    }

    public getScreenData(): NodeNEdgeSets {
        return this._screenData;
    }

    public removeControl(name: string) {
        var ctrl: Control = this.ctrls[name];
        ctrl.emit(FrameEventName.DESTROY_CONTROL, this._createEventArgs());
        this.fire(FrameEventName.REMOVE_CONTROL, { ctrl: ctrl });
    }

    public addControl(name: string, ctrl: Control): Control {
        this.ctrls[name] = ctrl;
        ctrl.emit(FrameEventName.CREATE_CONTROL, this._createEventArgs());
        this.fire(FrameEventName.ADD_CONTROL, { ctrl: ctrl });
        return ctrl;
    }

    public connect(connector: Connector, callback) {
        this._connector = connector;
        this._connector.requestConnect(() => {
            this.fire(FrameEventName.GRAPH_CONNECTED);
            if (callback != undefined)
                callback();
        });
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

        $(this._htmlFrame).css('background', this._theme.canvasBackground);

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
        this._connector.requestUpdateNodesOfCategory(className,
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
        });

        eventsMap.forEach((v, k, map) => {
            this._bindNetworkEvent(k, v);
        });
    }

    private _createEventArgs(): EVENT_ARGS_FRAME {
        return {
            frame: this,
            network: this._network,
            connector: this._connector,
            theme: this._theme,
            htmlFrame: this._htmlFrame,
        }
    }

    private _formatEdge(gsonEdge: any, showGraphOptions?: ShowGraphOptions): vis.Edge {
        if (showGraphOptions === undefined)
            showGraphOptions = this._showGraphOptions;

        var visEdge: any = { id: gsonEdge.id };
        visEdge.from = gsonEdge.from;
        visEdge.to = gsonEdge.to;
        visEdge.hidden = (showGraphOptions.showEdges === false);

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