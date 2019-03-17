import { MessageBoxCtrl } from "../control/MessageBoxCtrl";
import { MainFrame } from '../mainframe';
import { LocalGraph } from '../service/local';
import { RemoteGraph } from '../service/remote';
import { Theme } from '../Theme';
import { EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT, FrameEventName, FRAME_OPTIONS, GraphNode, NETWORK_OPTIONS } from "../types";

export abstract class BaseApp {
    protected _toggleEdgeLabelHandlers;
    protected _frame: MainFrame;
    protected _htmlFrame: HTMLElement;
    protected _messageBox: MessageBoxCtrl; //signleton message box

    protected constructor(htmlFrame: HTMLElement,
        initialOptions: FRAME_OPTIONS, extra?: object) {
        this._toggleEdgeLabelHandlers = {
            onselect: this._toggleEdgeLabelOnSelect.bind(this),
            ondeselect: this._toggleEdgeLabelOnDeselect.bind(this)
        };

        this._htmlFrame = htmlFrame;
        var frame = new MainFrame(htmlFrame, initialOptions);
        frame.on(FrameEventName.FRAME_CREATED, this.onCreateFrame.bind(this));

        this._frame = frame;
        frame.fire(FrameEventName.FRAME_CREATED, extra || {});
        this._messageBox = <any>this._frame.addControl("messagebox", new MessageBoxCtrl());
    }

    protected abstract onCreateFrame(args: EVENT_ARGS_FRAME);

    public loadGson(url: string, eventHandlers: object, callback) {
        this._frame.connect(LocalGraph.fromGsonFile(url, eventHandlers), callback);
    }

    public connect(url: string, callback) {
        this._frame.connect(new RemoteGraph(url), callback);
    }

    public showGraph(options, callback: () => void) {
        var app = this;
        this._messageBox.showMessage("LOADING_GRAPH");
        this._frame.loadGraph(options, function () {
            app._messageBox.hideMessage();
            if (callback !== undefined)
                callback();
        });
    }

    public pickup(keywords: object[], callback: (nodes: GraphNode[]) => void) {
        var frame = this._frame;
        var app = this;
        frame.search(keywords, (nodes: GraphNode[]) => {
            var nodeIds = frame.insertNodes(nodes);
            frame.placeNodes(nodeIds);
            frame.updateNodes(nodeIds.map(function (nodeId: any) {
                return { id: nodeId, physics: false };
            }));

            if (callback !== undefined)
                callback(nodes);
        });
    }

    public clearScreen() {
        this._frame.clearScreen();
    }

    public updateGraph(showGraphOptions: FRAME_OPTIONS | Function, callback?: () => void) {
        this._frame.updateGraph(showGraphOptions);
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
        this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.nodes.shadow = checked;
        });
    }

    public toggleNavigationButtons(checked: boolean) {
        this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.interaction.navigationButtons = checked;
        });
    }

    public toggleNodeBorder(checked: boolean) {
        this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.nodes.borderWidth = checked ? 1 : 0;
        });
    }

    public toggleShowEdgeLabelAlways(checked: boolean) {
        if (checked) {
            this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                options.edges.font['size'] = 11;
            });

            this._frame.off(FrameEventName.NETWORK_SELECT_EDGES,
                this._toggleEdgeLabelHandlers.onselect
            );

            this._frame.off(FrameEventName.NETWORK_DESELECT_EDGES,
                this._toggleEdgeLabelHandlers.ondeselect
            );
        }
        else {
            this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                options.edges.font['size'] = 0;
            });

            this._frame.on(FrameEventName.NETWORK_SELECT_EDGES,
                this._toggleEdgeLabelHandlers.onselect
            );

            //hide deselected edges
            this._frame.on(FrameEventName.NETWORK_DESELECT_EDGES,
                this._toggleEdgeLabelHandlers.ondeselect
            );
        }
    }

    public toggleEdgeColor(checked: boolean) {
        this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            if (checked) {
                options.edges.color = {
                    'inherit': 'to'
                };
            }
            else {
                options.edges.color = {
                    opacity: 0.4,
                    highlight: '#ff0000',
                    hover: '#ff0000'
                };
            }
        });
    }

    public toggleDraggable(checked: boolean) {
        this._frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.interaction.dragNodes = checked;
        });
    }

    private _toggleEdgeLabelOnSelect(args: EVENT_ARGS_FRAME_INPUT) {
        var frame = this._frame;
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
        this._frame.updateTheme(theme);
    }

    private _toggleEdgeLabelOnDeselect(args: EVENT_ARGS_FRAME_INPUT) {
        var frame = this._frame;
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