import { MainFrame } from '../framework';
import { LocalGraph } from '../connector/local';
import { ShowGraphOptions, NodeNEdgeSets, FrameEventName, EVENT_ARGS_FRAME, BrowserOptions, EVENT_ARGS_FRAME_INPUT } from "../types";
import { MessageBoxCtrl } from "../control/MessageBoxCtrl";
import { Connector } from '../connector/connector';
import { Theme } from '../Theme';

export abstract class BaseApp {
    protected _toggleEdgeLabelHandlers;
    protected _framework: MainFrame;
    protected _htmlFrame: HTMLElement;
    protected _pickedNodeIds: string[];
    protected _messageBox: MessageBoxCtrl;

    protected constructor(htmlFrame: HTMLElement, initialOptions: BrowserOptions) {
        this._toggleEdgeLabelHandlers = {
            onselect: this._toggleEdgeLabelOnSelect.bind(this),
            ondeselect: this._toggleEdgeLabelOnDeselect.bind(this)
        };

        this._htmlFrame = htmlFrame;
        this._framework = new MainFrame(htmlFrame, initialOptions);
        this._framework.on(FrameEventName.FRAME_CREATED, this.onCreateFrame.bind(this));
        this._framework.fire(FrameEventName.FRAME_CREATED, {});
        this._messageBox = <any>this._framework.addControl("messagebox", new MessageBoxCtrl());
    }

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

    public toggleWeights(checked: boolean) {
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

    public toggleNavigationButtons(checked: boolean) {
        this._framework.updateTheme(function (theme) {
            theme.networkOptions.interaction.navigationButtons = checked;
        });
    }

    public toggleNodeBorder(checked: boolean) {
        this._framework.updateTheme((theme: Theme) => {
            theme.networkOptions.nodes.borderWidth = checked ? 1 : 0;
        });
    }

    public toggleShowEdgeLabelAlways(checked: boolean) {
        if (checked) {
            this._framework.updateTheme((theme: Theme) => {
                theme.networkOptions.edges.font['size'] = 11;
            });

            this._framework.off(FrameEventName.NETWORK_SELECT_EDGES,
                this._toggleEdgeLabelHandlers.onselect
            );

            this._framework.off(FrameEventName.NETWORK_DESELECT_EDGES,
                this._toggleEdgeLabelHandlers.ondeselect
            );
        }
        else {
            this._framework.updateTheme((theme: Theme) => {
                theme.networkOptions.edges.font['size'] = 0;
            });

            this._framework.on(FrameEventName.NETWORK_SELECT_EDGES,
                this._toggleEdgeLabelHandlers.onselect
            );

            //hide deselected edges
            this._framework.on(FrameEventName.NETWORK_DESELECT_EDGES,
                this._toggleEdgeLabelHandlers.ondeselect
            );
        }
    }

    public toggleEdgeColor(checked: boolean) {
        this._framework.updateTheme((theme: Theme) => {
            if (checked) {
                theme.networkOptions.edges.color = {
                    'inherit': 'to'
                };
            }
            else {
                theme.networkOptions.edges.color = {
                    opacity: 0.4,
                    highlight: '#ff0000',
                    hover: '#ff0000'
                };
            }
        });
    }

    private _toggleEdgeLabelOnSelect(args: EVENT_ARGS_FRAME_INPUT) {
        var frame = this._framework;
        var app = this;

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

            frame.updateEdges(updates);
        }
    }

    public updateTheme(theme: Theme | Function) {
        this._framework.updateTheme(theme);
    }

    private _toggleEdgeLabelOnDeselect(args: EVENT_ARGS_FRAME_INPUT) {
        var frame = this._framework;
        var app = this;
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

            frame.updateEdges(updates);
        }
    }
}