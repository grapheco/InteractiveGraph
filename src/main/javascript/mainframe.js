"use strict";
/**
 * Created by bluejoe on 2018/2/24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const events = require("events");
const series = require("async/series");
const theme_1 = require("./theme");
const types_1 = require("./types");
var CANVAS_PADDING = 80;
var MAX_EDGES_COUNT = 5000;
var MAX_NODES_COUNT = 5000;
class MainFrame {
    constructor(htmlFrame, showGraphOptions, theme) {
        this._minScale = 0.1;
        this._maxScale = 2;
        this._emiter = new events.EventEmitter();
        this._screenData = {
            nodes: new types_1.GraphNodeSet(),
            edges: new types_1.GraphEdgeSet()
        };
        this._rawData = {
            nodes: [],
            edges: []
        };
        this._autoCompletionItemLimit = 30;
        this._ctrls = new Map();
        this._showGraphOptions = {};
        this._htmlFrame = htmlFrame;
        this.updateTheme(theme);
        var showGraphOptions = showGraphOptions || {};
        this._showGraphOptions = utils_1.Utils.deepExtend(this._createDefaultShowGraphOptions(), showGraphOptions);
        this._networkOptions = this._createDefaultNetworkOptions();
        this._network = new types_1.GraphNetwork(htmlFrame, this._screenData, this._networkOptions);
        this._bindNetworkEvents();
        this._bindControlEvents(types_1.FrameEventName.FRAME_RESIZE);
    }
    emit(event, args) {
        this._emiter.emit(event, args);
    }
    fire(event, extra) {
        this._emiter.emit(event, this._composeEventArgs(extra));
    }
    on(event, listener) {
        this._emiter.on(event, listener);
    }
    off(event, listener) {
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
    getGraphService() {
        return this._graphService;
    }
    getScreenData() {
        return this._screenData;
    }
    removeControl(name) {
        var ctrl = this._ctrls.get(name);
        ctrl.emit(types_1.FrameEventName.DESTROY_CONTROL, this._createEventArgs());
        this.fire(types_1.FrameEventName.REMOVE_CONTROL, { ctrl: ctrl });
        this._ctrls.delete(name);
    }
    addControl(name, ctrl) {
        this._ctrls.set(name, ctrl);
        ctrl.emit(types_1.FrameEventName.CREATE_CONTROL, this._createEventArgs());
        this.fire(types_1.FrameEventName.ADD_CONTROL, { ctrl: ctrl });
        return ctrl;
    }
    connect(service, callback) {
        this._graphService = service;
        this._graphService.requestConnect(() => {
            this.fire(types_1.FrameEventName.GRAPH_CONNECTED);
            if (callback != undefined)
                callback();
        });
    }
    getNodeCategories() {
        return this._graphService.getNodeCategories();
    }
    updateTheme(theme) {
        if (theme instanceof Function) {
            theme(this._theme);
        }
        else {
            this._theme = theme || theme_1.Themes.DEFAULT();
        }
        $(this._htmlFrame).css('background', this._theme.canvasBackground);
        this._notifyControls(types_1.FrameEventName.THEME_CHANGED, { theme: this._theme });
    }
    updateNetworkOptions(options) {
        if (options instanceof Function) {
            options(this._networkOptions);
        }
        else {
            this._networkOptions = options;
        }
        this._network.setOptions(this._networkOptions);
    }
    scaleTo(scale) {
        this._network.moveTo({ scale: scale });
    }
    fits(nodeIds, animation = false) {
        this._network.fit({ nodes: nodeIds, animation: animation });
    }
    pipe(tasksWithCallback) {
        series(tasksWithCallback);
    }
    search(keyword, callback) {
        this._graphService.requestSearch(keyword, this._autoCompletionItemLimit, callback);
    }
    updateGraph(showGraphOptions, callback) {
        if (showGraphOptions instanceof Function) {
            showGraphOptions(this._showGraphOptions);
        }
        else {
            this._showGraphOptions = showGraphOptions;
        }
        var frame = this;
        frame._screenData.nodes.update(frame._rawData.nodes.map((x) => {
            return frame._formatNode(x, frame._showGraphOptions);
        }));
        frame._screenData.edges.update(frame._rawData.edges.map((x) => {
            return frame._formatEdge(x, frame._showGraphOptions);
        }));
    }
    updateNodes(updates) {
        this._screenData.nodes.update(updates);
    }
    updateEdges(updates) {
        this._screenData.edges.update(updates);
    }
    showNodesOfCategory(className, showOrNot, callback) {
        var browser = this;
        var ids = this._screenData.nodes.getIds();
        this._graphService.requestFilterNodesByCategory(className, ids, showOrNot, (filteredNodeIds) => {
            if (filteredNodeIds.length > 0)
                this._screenData.nodes.update(ids.map((nodeId) => {
                    return { id: nodeId, hidden: filteredNodeIds.indexOf(nodeId) < 0 };
                }));
            if (callback !== undefined)
                callback();
        });
    }
    clearScreen() {
        this._screenData.nodes.clear();
        this._screenData.edges.clear();
    }
    /**
     * load graph data and show network in current format
     * @param callback
     */
    load(options, callback) {
        var browser = this;
        this._graphService.requestLoadGraph(function (nodes, edges) {
            browser._rawData = { nodes: nodes, edges: edges };
            browser._screenData.nodes = new types_1.GraphNodeSet(browser._rawData.nodes.map((x) => {
                return browser._formatNode(x);
            }));
            browser._screenData.edges = new types_1.GraphEdgeSet(browser._rawData.edges.map((x) => {
                return browser._formatEdge(x);
            }));
            //too large!!
            if (browser._rawData.nodes.length > MAX_NODES_COUNT ||
                browser._rawData.edges.length > MAX_EDGES_COUNT)
                browser.updateNetworkOptions((options) => {
                    options.physics = false;
                });
            browser._network.setData(browser._screenData);
            if (options.scale !== undefined) {
                browser.scaleTo(options.scale);
            }
            if (callback !== undefined)
                callback();
        });
    }
    lockScale(minScale, maxScale) {
    }
    /**
     * insert a set of nodes, if some nodes exists, ignore the errors
     * @param nodes nodes to be inserted
     * @returns new node ids (without which exist already)
     */
    insertNodes(nodes) {
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
            this.fire(types_1.FrameEventName.INSERT_NODES, { nodes: newNodeIds });
        }
        return newNodeIds;
    }
    /**
     * delete matched nodes
     * @param filter a function tells id the node should be deleted, set undefined if want to delete all
     */
    deleteNodes(filter) {
        if (filter === undefined) {
            this._screenData.nodes.clear();
            return;
        }
        var nodeIds = [];
        this._screenData.nodes.forEach((node) => {
            if (filter(node))
                nodeIds.push(node.id);
        });
        this._screenData.nodes.remove(nodeIds);
    }
    focusNodes(nodeIds) {
        this._network.fit({ nodes: nodeIds, animation: true });
        if (nodeIds.length > 0) {
            this.fire(types_1.FrameEventName.FOCUS_NODES, { nodes: nodeIds });
        }
    }
    insertEdges(edges) {
        var browser = this;
        this._screenData.edges.update(edges.map((edge) => {
            return browser._formatEdge(edge);
        }));
    }
    getNodeById(nodeId) {
        return this._screenData.nodes.get(nodeId);
    }
    placeNodes(nodeIds) {
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
    _bindNetworkEvent(networkEventName, frameEventName) {
        var browser = this;
        this._network.on(networkEventName, function (args) {
            browser.fire(frameEventName, args instanceof CanvasRenderingContext2D ? { context2d: args } : args);
        });
    }
    _bindNetworkEvents() {
        var browser = this;
        var eventsMap = utils_1.Utils.toMap({
            "click": types_1.FrameEventName.NETWORK_CLICK,
            "doubleClick": types_1.FrameEventName.NETWORK_DBLCLICK,
            "beforeDrawing": types_1.FrameEventName.NETWORK_BEFORE_DRAWING,
            "afterDrawing": types_1.FrameEventName.NETWORK_AFTER_DRAWING,
            "selectEdge": types_1.FrameEventName.NETWORK_SELECT_EDGES,
            "deselectEdge": types_1.FrameEventName.NETWORK_DESELECT_EDGES,
            "dragging": types_1.FrameEventName.NETWORK_DRAGGING,
            "resize": types_1.FrameEventName.FRAME_RESIZE,
        });
        eventsMap.forEach((v, k, map) => {
            this._bindNetworkEvent(k, v);
        });
    }
    _createEventArgs() {
        return {
            mainFrame: this,
            network: this._network,
            theme: this._theme,
            htmlMainFrame: this._htmlFrame,
        };
    }
    _formatEdge(gsonEdge, showGraphOptions) {
        if (showGraphOptions === undefined)
            showGraphOptions = this._showGraphOptions;
        var visEdge = { id: gsonEdge.id };
        visEdge.from = gsonEdge.from;
        visEdge.to = gsonEdge.to;
        visEdge.hidden = (showGraphOptions.showEdges === false);
        visEdge.label = gsonEdge.label;
        return visEdge;
    }
    _formatNode(gsonNode, showGraphOptions) {
        if (showGraphOptions === undefined)
            showGraphOptions = this._showGraphOptions;
        var visNode = { id: gsonNode.id };
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
    _bindControlEvents(event, event2) {
        var frame = this;
        if (event2 === undefined)
            event2 = event;
        this.on(event, (args) => {
            frame._ctrls.forEach((ctrl, name, map) => {
                ctrl.emit(event2, args);
            });
        });
    }
    _notifyControls(event, extra) {
        var args = this._composeEventArgs(extra);
        this._ctrls.forEach((ctrl, name, map) => {
            ctrl.emit(event, args);
        });
    }
    _createDefaultShowGraphOptions() {
        return {
            showNodes: true,
            showEdges: true,
            showLabels: true
        };
    }
    _composeEventArgs(extra) {
        var args = this._createEventArgs();
        if (extra !== undefined) {
            for (let key in extra) {
                if (extra.hasOwnProperty(key)) {
                    args[key] = extra[key];
                }
            }
        }
        return args;
    }
    _createDefaultNetworkOptions() {
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
            }
        };
    }
}
exports.MainFrame = MainFrame;
