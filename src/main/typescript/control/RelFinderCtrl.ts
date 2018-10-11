import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../mainframe";
import { FrameEventName, QUERY_RESULTS, RELATION_PATH, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT, NETWORK_OPTIONS } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, BGControl } from "./Control";
import { Themes, Theme } from "../theme";
import { RelFinderDialogCtrl } from "./RelFinderDialogCtrl";

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
    private _pathColors = [
        '#fa0006', '#1cd8f8', '#1a6cfd',
        '#f800cf', '6500d5', '#9e00fd',
        '#fb8617', '#f6ff0a', '#96e508'];

    onCreate(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        this._frame = frame;

        //when a node/edge is clicked
        var onselect = function (args: EVENT_ARGS_FRAME_INPUT) {
            if (this._queryStartNodeIds !== undefined) {
                var inPathNodeIds: string[] = [];
                var inPathEdgeIds: string[] = [];

                var selectedNodeIds: string[] = args.nodes;
                var selectedEdgeIds: string[] = args.edges;
                var colorIndex = 0;
                var updates = [];

                if (selectedNodeIds.length == 1 && this._queryStartNodeIds.indexOf(selectedNodeIds[0]) < 0) {
                    this._collectedPaths.forEach((path: RELATION_PATH) => {
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
                                updates.push({
                                    id: x.id, color: {
                                        highlight: this._pathColors[colorIndex % this._pathColors.length]
                                    }
                                });
                            });

                            colorIndex++;
                        }
                    });

                    frame.updateEdges(updates);
                    args.network.selectNodes(Utils.distinct(inPathNodeIds));
                    args.network.selectEdges(Utils.distinct(inPathEdgeIds));
                }
            }
        }

        frame.updateNetworkOptions((options: NETWORK_OPTIONS) => {
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