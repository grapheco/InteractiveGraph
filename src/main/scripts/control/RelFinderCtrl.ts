import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../mainframe";
import { FrameEventName, QUERY_RESULTS, RELATION_PATH, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT, NETWORK_OPTIONS } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control } from "./Control";
import { Themes, Theme } from "../theme";

export class RelFinderCtrl extends Control {
    private _frame: MainFrame;
    private _queryId: string;
    private _stopped;
    private _queryStartNodeIds: string[];
    private _renderTimer: number;
    private _checkDataTimer: number;
    private _consumerPathBuffer: RELATION_PATH[];
    private _collectedPaths: RELATION_PATH[];
    private _pathColors = [
        '#fa0006', '#1cd8f8', '#1a6cfd',
        '#f800cf', '6500d5', '#9e00fd',
        '#fb8617', '#f6ff0a', '#96e508'];

    onCreate(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        this._frame = frame;

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

    private _collectFoundRelations(
        queryResults: QUERY_RESULTS) {
        var thisCtrl = this;
        this._queryId = queryResults.queryId;

        //collect paths
        queryResults.paths.forEach((path: RELATION_PATH) => {
            thisCtrl._consumerPathBuffer.push(path);
        })

        //has more?
        if (this._stopped)
            return;

        if (queryResults.hasMore) {
            this._frame.getGraphService().requestGetMoreRelations(queryResults.queryId,
                (queryResults: QUERY_RESULTS) => {
                    thisCtrl._collectFoundRelations(queryResults);
                });
        }
    }

    public startQuery(nodeIds: string[],
        refreshInterval: number = 1000,
        maxDepth: number = 6) {
        this._stopped = false;
        this._frame.placeNodes(nodeIds);
        this._frame.focusNodes(nodeIds);
        var thisCtrl = this;
        //create a render timer
        this._consumerPathBuffer = [];
        this._collectedPaths = [];
        this._queryStartNodeIds = nodeIds;

        this._renderTimer = window.setInterval(
            () => {
                if (thisCtrl._consumerPathBuffer.length > 0) {
                    var path = thisCtrl._consumerPathBuffer.shift();

                    thisCtrl._frame.insertNodes(path.nodes);
                    thisCtrl._frame.insertEdges(path.edges);
                    thisCtrl._collectedPaths.push(path);
                }
            },
            refreshInterval);

        //if no longer received new data, stop query
        this._checkDataTimer = window.setInterval(
            () => {
                if (thisCtrl._consumerPathBuffer.length == 0) {
                    thisCtrl.stopQuery();
                    return;
                }
            },
            30000);

        this._frame.getGraphService().requestFindRelations(nodeIds[0], nodeIds[1], maxDepth,
            (queryResults: QUERY_RESULTS) => {
                thisCtrl._collectFoundRelations(queryResults);
            });
    }

    public stopQuery() {
        this._stopped = true;
        window.clearInterval(this._renderTimer);
        window.clearInterval(this._checkDataTimer);
        this._frame.getGraphService().requestStopFindRelations(this._queryId);
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
    }
}