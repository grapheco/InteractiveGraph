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
    private _stopped;

    init(browser: GraphBrowser, network: vis.Network, service: GraphService) {
        this._browser = browser;
        this._network = network;
        this._service = service;
    }

    private _onFoundRelations(queryResults: QueryResults) {
        var thisCtrl = this;
        //show paths
        queryResults.paths.forEach((path: RelationPath) => {
            thisCtrl._browser.insertNodes(path.nodes);
            thisCtrl._browser.insertEdges(path.edges);
        })

        //has more?
        if (queryResults.hasMore && !thisCtrl._stopped) {
            thisCtrl._service.requestGetMoreRelations(queryResults.queryId,
                thisCtrl._onFoundRelations.bind(thisCtrl));
        }
    }

    public startQuery(nodeIds: string[], maxDepth = 6) {
        this._stopped = false;
        this._service.requestFindRelations(nodeIds[0], nodeIds[1], maxDepth, this._onFoundRelations.bind(this));
    }

    public stopQuery(nodeIds: string[]) {
        this._stopped = true;
    }
}
