import { MainFrame } from '../framework';
import { LocalGraph } from '../connector/local';
import { ShowGraphOptions, NodeNEdgeSets, FrameEventName, EVENT_ARGS_FRAME } from "../types";
import { MessageBoxCtrl } from "../control/MessageBoxCtrl";
import { Connector } from '../connector/connector';

export abstract class BaseApp {
    protected _framework: MainFrame;
    protected _htmlFrame: HTMLElement;
    protected _pickedNodeIds: string[];
    protected _messageBox: MessageBoxCtrl;

    protected constructor(htmlFrame: HTMLElement) {
        this._framework = this.createFramework(htmlFrame, this.onCreateFrame.bind(this));
        this._messageBox = <any>this._framework.addControl("messagebox", new MessageBoxCtrl());
    }

    protected abstract createFramework(htmlFrame: HTMLElement, callback: (args: EVENT_ARGS_FRAME) => void): MainFrame;
    protected abstract onCreateFrame(args: EVENT_ARGS_FRAME);

    public loadGson(url: string, callback) {
        this._framework.connect(LocalGraph.fromGsonFile(url), callback);
    }

    public connect(url: string, callback) {
        //remote
    }

    public showGraph(options, callback: () => void) {
        var app = this;
        this._messageBox.showMessage("LOADING_GRAPH");
        this._framework.load(options, function () {
            app._messageBox.hideMessage();
            if (callback !== undefined)
                callback();
        });
    }

    public pickup(keywords: object[], callback) {
        var framework = this._framework;
        var app = this;
        framework.search(keywords, function (nodes) {
            var nodeIds = framework.insertNodes(nodes);
            app._pickedNodeIds = nodeIds;
            app.placeNodes(nodeIds);
            framework.updateNodes(nodeIds.map(function (nodeId: any) {
                return { id: nodeId, physics: false };
            }));

            if (callback !== undefined)
                callback();
        });
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

        this._framework.updateNodes(updates);
    }

    public updateGraph(showGraphOptions: ShowGraphOptions | Function, callback?: () => void) {
        this._framework.updateGraph(showGraphOptions);
    }

    public toggleDegrees(checked: boolean) {
        this.updateGraph(function (options) {
            options.showDegrees = checked;
        });
    }

    public toggleEdges(checked: boolean) {
        this.updateGraph(function (options) {
            options.showEdges = checked;
        });
    }

    public toggleFaces(checked: boolean) {
        this.updateGraph(function (options) {
            options.showFaces = checked;
        });
    }

    public toggleShadow(checked: boolean) {
        this._framework.updateTheme(function (theme) {
            theme.networkOptions.nodes.shadow = checked;
        });
    }
}