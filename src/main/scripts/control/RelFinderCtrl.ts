import { Utils, Rect, Point } from "../utils";
import { GraphBrowser } from "../browser";
import { BrowserEventName, QueryResults, RelationPath } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control } from "./Control";
import { Themes, Theme } from "../theme";

export class RelFinderCtrl implements Control {

    private _browser: GraphBrowser;
    private _network: vis.Network;
    private _service: GraphService;
    private _queryId: string;
    private _stopped;
    private _queryStartNodeIds: string[];
    private _renderTimer: number;
    private _checkDataTimer: number;
    private _consumerPathBuffer: RelationPath[];
    private _collectedPaths: RelationPath[];
    private _pathColors = [
        '#fa0006', '#1cd8f8', '#1a6cfd',
        '#f800cf', '6500d5', '#9e00fd',
        '#fb8617', '#f6ff0a', '#96e508'];

    init(browser: GraphBrowser, network: vis.Network, service: GraphService) {
        this._browser = browser;
        this._network = network;
        this._service = service;

        var onselect = function (network, args) {
            if (this._queryStartNodeIds !== undefined) {
                var inPathNodeIds: string[] = [];
                var inPathEdgeIds: string[] = [];

                var selectedNodeIds: string[] = args.nodes;
                var selectedEdgeIds: string[] = args.edges;
                var colorIndex = 0;

                if (selectedNodeIds.length == 1 && this._queryStartNodeIds.indexOf(selectedNodeIds[0]) < 0) {
                    this._collectedPaths.forEach((path: RelationPath) => {
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
                                this._browser._edges.update({
                                    id: x.id, color: {
                                        highlight: this._pathColors[colorIndex % this._pathColors.length]
                                    }
                                });
                            });

                            colorIndex++;
                        }
                    });

                    network.selectNodes(Utils.distinct(inPathNodeIds));
                    network.selectEdges(Utils.distinct(inPathEdgeIds));
                }
            }
        }

        browser.updateTheme((theme: Theme) => {
            theme.networkOptions.edges.font['size'] = 11;
        });

        browser.removeAllListeners(BrowserEventName.NETWORK_SELECT_EDGES);
        browser.removeAllListeners(BrowserEventName.NETWORK_DESELECT_EDGES);
        browser.on(BrowserEventName.NETWORK_CLICK, onselect.bind(this));
    }

    private _collectFoundRelations(queryResults: QueryResults) {
        var thisCtrl = this;
        this._queryId = queryResults.queryId;

        //collect paths
        queryResults.paths.forEach((path: RelationPath) => {
            thisCtrl._consumerPathBuffer.push(path);
            thisCtrl._collectedPaths.push(path);
        })

        //has more?
        if (this._stopped)
            return;

        if (queryResults.hasMore) {
            thisCtrl._service.requestGetMoreRelations(queryResults.queryId,
                thisCtrl._browser.getShowGraphOptions(),
                thisCtrl._collectFoundRelations.bind(thisCtrl));
        }
    }

    public startQuery(nodeIds: string[], refreshInterval: number = 1000, maxDepth: number = 6) {
        this._stopped = false;
        this._browser.focusNodes(nodeIds);
        var thisCtrl = this;
        //create a render timer
        this._consumerPathBuffer = [];
        this._collectedPaths = [];
        this._queryStartNodeIds = nodeIds;

        this._renderTimer = window.setInterval(
            () => {
                if (thisCtrl._consumerPathBuffer.length > 0) {
                    var path = thisCtrl._consumerPathBuffer.shift();
                    thisCtrl._browser.insertNodes(path.nodes);
                    thisCtrl._browser.insertEdges(path.edges);
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

        this._service.requestFindRelations(nodeIds[0], nodeIds[1], maxDepth,
            thisCtrl._browser.getShowGraphOptions(),
            this._collectFoundRelations.bind(this));
    }

    public stopQuery() {
        this._stopped = true;
        window.clearInterval(this._renderTimer);
        window.clearInterval(this._checkDataTimer);
        this._service.requestStopFindRelations(this._queryId);
    }
}