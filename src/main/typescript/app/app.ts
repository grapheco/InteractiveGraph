import { MessageBoxCtrl } from "../control/MessageBoxCtrl";
import { MainFrame } from '../mainframe';
import { LocalGraph } from '../service/local';
import { RemoteGraph } from '../service/remote';
import { Theme } from '../Theme';
import { EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT, FrameEventName, FRAME_OPTIONS, GraphNode, NETWORK_OPTIONS } from "../types";
import { SelectionCtrl } from "../control/SelectionCtrl";

export abstract class BaseApp extends MainFrame {
    protected _toggleEdgeLabelHandlers;
    protected _messageBox: MessageBoxCtrl; //singleton message box
    protected _selector: SelectionCtrl;

    protected constructor(htmlFrame: HTMLElement,
        initialOptions: FRAME_OPTIONS, extra?: object,theme?: Theme) {
        super(htmlFrame, initialOptions, theme);

        this._toggleEdgeLabelHandlers = {
            onselect: this._toggleEdgeLabelOnSelect.bind(this),
            ondeselect: this._toggleEdgeLabelOnDeselect.bind(this)
        };

        super.on(FrameEventName.FRAME_CREATED, this.onCreateFrame.bind(this));

        super.addDocumentControls($("[igraph-control-role]", document), extra);
        this._messageBox = super.addControl(new MessageBoxCtrl());
        this._selector = super.addControl(new SelectionCtrl());

        super.fire(FrameEventName.FRAME_CREATED, extra || {});
    }

    public flagNodes(nodeIds: string[], flagOrNot: boolean) {
        if (flagOrNot !== false)
            this._selector.flagNodes(nodeIds);
        else
            this._selector.unflagNodes(nodeIds);
    }

    protected abstract onCreateFrame(args: EVENT_ARGS_FRAME);

    public loadGson(url: string, eventHandlers: object, callback) {
        super.connectService(LocalGraph.fromGsonFile(url, eventHandlers), callback);
    }

    public connect(url: string, callback) {
        super.connectService(new RemoteGraph(url), callback);
    }

    public showGraph(options, callback: () => void) {
        var app = this;
        this._messageBox.showMessage("LOADING_GRAPH");
        super.loadGraph(options, function () {
            app._messageBox.hideMessage();
            if (callback !== undefined)
                callback();
        });
    }

    public pickup(keywords: object[], callback: (nodes: GraphNode[]) => void) {
        var app = this;
        super.search(keywords, (nodes: GraphNode[]) => {
            var nodeIds = super.insertNodes(nodes);
            super.placeNodes(nodeIds);
            super.updateNodes(nodeIds.map(function (nodeId: any) {
                return { id: nodeId, physics: false };
            }));

            if (callback !== undefined)
                callback(nodes);
        });
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
        super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.nodes.shadow = checked;
        });
    }

    public toggleNavigationButtons(checked: boolean) {
        super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.interaction.navigationButtons = checked;
        });
    }

    public toggleNodeBorder(checked: boolean) {
        super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.nodes.borderWidth = checked ? 1 : 0;
        });
    }

    public toggleShowEdgeLabelAlways(checked: boolean) {
        if (checked) {
            super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                options.edges.font['size'] = 11;
            });

            super.off(FrameEventName.NETWORK_SELECT_EDGES,
                this._toggleEdgeLabelHandlers.onselect
            );

            super.off(FrameEventName.NETWORK_DESELECT_EDGES,
                this._toggleEdgeLabelHandlers.ondeselect
            );
        }
        else {
            super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
                options.edges.font['size'] = 0;
            });

            super.on(FrameEventName.NETWORK_SELECT_EDGES,
                this._toggleEdgeLabelHandlers.onselect
            );

            //hide deselected edges
            super.on(FrameEventName.NETWORK_DESELECT_EDGES,
                this._toggleEdgeLabelHandlers.ondeselect
            );
        }
    }

    public toggleEdgeColor(checked: boolean) {
        super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
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
        super.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.interaction.dragNodes = checked;
        });
    }

    private _toggleEdgeLabelOnSelect(args: EVENT_ARGS_FRAME_INPUT) {
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

            super.updateEdges(updates);
        }
    }

    public updateTheme(theme: Theme | Function) {
        super.updateTheme(theme);
    }

    private _toggleEdgeLabelOnDeselect(args: EVENT_ARGS_FRAME_INPUT) {
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

            super.updateEdges(updates);
        }
    }
}