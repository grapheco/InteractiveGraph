import { Utils, Rect, Point } from "../utils";
import { GraphBrowser } from "../browser";
import { BrowserEventName, QueryResults, RelationPath } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control } from "./Control";

export class RelFinderCtrl implements Control {

    private _browser: GraphBrowser;
    private _network: vis.Network;
    private _service: GraphService;
    private _queryId: string;
    private _stopped;

    private _renderTimer: number;
    private _checkDataTimer: number;
    private _relationPaths: RelationPath[];

    init(browser: GraphBrowser, network: vis.Network, service: GraphService) {
        this._browser = browser;
        this._network = network;
        this._service = service;
    }

    private _collectFoundRelations(queryResults: QueryResults) {
        var thisCtrl = this;
        this._queryId = queryResults.queryId;

        //collect paths
        queryResults.paths.forEach((path: RelationPath) => {
            thisCtrl._relationPaths.push(path);
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

    public startQuery(nodeIds: string[], refreshInterval: number = 50, maxDepth: number = 6) {
        this._stopped = false;
        this._browser.focusNodes(nodeIds);
        var thisCtrl = this;
        //create a render timer
        this._relationPaths = [];

        this._renderTimer = window.setInterval(
            () => {
                if (thisCtrl._relationPaths.length > 0) {
                    var path = thisCtrl._relationPaths.shift();
                    thisCtrl._browser.insertNodes(path.nodes);
                    thisCtrl._browser.insertEdges(path.edges);
                }
            },
            refreshInterval);

        //if no longer received new data, stop query
        this._checkDataTimer = window.setInterval(
            () => {
                if (thisCtrl._relationPaths.length == 0) {
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