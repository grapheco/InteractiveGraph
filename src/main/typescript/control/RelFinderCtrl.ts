import { MainFrame } from "../mainframe";
import { EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT, FrameEventName, NETWORK_OPTIONS, QUERY_RESULTS, RELATION_PATH } from '../types';
import { Utils } from "../utils";
import { BGControl } from "./Control";

export class RelFinderCtrl extends BGControl {
    private _frame: MainFrame;
    private _queryId: string;
    private _stopped;
    private _queryCompleted;
    private _queryStartNodeIds: string[];
    private _consumeTimer: number;
    private _checkDataTimer: number;
    private _collectedPaths: RELATION_PATH[];
    private _consumedPaths: RELATION_PATH[];

    public getTypeName(): string {
        return "RelFinderCtrl";
    }

   //colors of selected paths
    private _pathColors = [
        '#fd740b', '#ed00ff', '#63b706',
        '#17b7fe', '#fb3a71', '#d66dfe'];

    onCreate(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        this._frame = frame;

        //when a node/edge is clicked
        var onselect = function (args: EVENT_ARGS_FRAME_INPUT) {
            var thisCtrl= this;
            if (this._queryStartNodeIds !== undefined) {
                var inPathNodeIds: string[] = [];
                var inPathEdgeIds: string[] = [];

                var selectedNodeIds: string[] = args.nodes;
                var selectedEdgeIds: string[] = args.edges;
                var colorIndex = 0;
                var updates = [];

                //when a non-start node is selected
                if (selectedNodeIds.length == 1 && this._queryStartNodeIds.indexOf(selectedNodeIds[0]) < 0) {
                    this._consumedPaths.forEach((path: RELATION_PATH) => {
                        var inPath = false;
                        for (var x of path.nodes) {
                            if (selectedNodeIds.indexOf(x['id']) >= 0) {
                                inPath = true;
                                break;
                            }
                        }

                        if (!inPath) {
                            for (var x of path.edges) {
                                if (selectedEdgeIds.indexOf(x['id']) >= 0) {
                                    inPath = true;
                                    break;
                                }
                            }
                        }

                        //hilight paths which contain selected node/edge
                        if (inPath) {
                            path.nodes.forEach((x: any) => { inPathNodeIds.push(x.id); });
                            path.edges.forEach((x: any) => {
                                inPathEdgeIds.push(x.id);
                                const selectedColor = thisCtrl._pathColors[colorIndex % thisCtrl._pathColors.length];
                                updates.push({
                                    id: x.id,
                                    /*
                                    color: {
                                        highlight: this._pathColors[colorIndex % this._pathColors.length]
                                    },
                                    selectionWidth: 2
                                    */
                                    chosen:{
                                        edge: function(values, id, selected, hovering) {
                                            if(selected) {
                                                values.color = selectedColor;
                                                values.width = 2;
                                                values.opacity = 0.9;
                                            }
                                        }
                                    }
                                });
                            });
                        }
                        colorIndex++;
                    });

                    frame.updateEdges(updates);
                    console.log(updates);
                    args.network.selectNodes(Utils.distinct(inPathNodeIds));
                    args.network.selectEdges(Utils.distinct(inPathEdgeIds));
                }
            }
        }

        frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
            options.edges.width = 1;
            options.edges.font['size'] = 11;
        });

        frame.off(FrameEventName.NETWORK_SELECT_EDGES);
        frame.off(FrameEventName.NETWORK_DESELECT_EDGES);
        frame.on(FrameEventName.NETWORK_CLICK, onselect.bind(this));
    }

    private _retrieveMoreRelations(
        queryId: string) {
        var thisCtrl = this;
        const RETRIEVE_INTERVAL = 1000;

        window.setTimeout(
            () => {
                thisCtrl._frame.getGraphService().requestGetMoreRelations(queryId,
                    (queryResults: QUERY_RESULTS) => {

                        //collect paths
                        queryResults.paths.forEach((path: RELATION_PATH) => {
                            thisCtrl._collectedPaths.push(path);
                        })

                        //stopped?
                        if (thisCtrl._stopped)
                            return;

                        //has more?
                        if (queryResults.completed) {
                            thisCtrl._queryCompleted = true;
                            return;
                        }

                        thisCtrl._retrieveMoreRelations(queryId);
                    });
            },
            RETRIEVE_INTERVAL);
    }

    public startQuery(nodeIds: string[],
        refreshInterval: number = 1000,
        maxDepth: number = 6) {
        this._stopped = false;
        this._queryCompleted = false;
        this._frame.placeNodes(nodeIds);
        this._frame.focusNodes(nodeIds);
        var thisCtrl = this;

        this._collectedPaths = [];
        this._consumedPaths = [];
        this._queryStartNodeIds = nodeIds;

        //consume data and visualize
        this._consumeTimer = window.setInterval(
            () => {
                if (thisCtrl._collectedPaths.length > 0) {
                    //consume retrieved paths
                    var path = thisCtrl._collectedPaths.shift();

                    thisCtrl._frame.insertNodes(path.nodes);
                    thisCtrl._frame.insertEdges(path.edges);
                    thisCtrl._consumedPaths.push(path);
                }
                else {
                    if (thisCtrl._queryCompleted)
                        thisCtrl.stopQuery();
                }
            },
            refreshInterval);

        //start!
        this._frame.getGraphService().requestFindRelations(nodeIds[0], nodeIds[1], maxDepth,
            (queryId: string) => {
                thisCtrl._queryId = queryId;
                thisCtrl._retrieveMoreRelations(queryId);
            });

        this._frame.emit(FrameEventName.RELFINDER_STARTED, { ctrl: this });
    }

    public stopQuery() {
        if (!this._stopped) {
            this._stopped = true;
            window.clearInterval(this._consumeTimer);
            this._frame.getGraphService().requestStopFindRelations(this._queryId);

            this._frame.emit(FrameEventName.RELFINDER_STOPPED, { ctrl: this });
        }
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}