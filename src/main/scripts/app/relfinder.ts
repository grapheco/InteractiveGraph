import { BaseApp } from './app';
import { MainFrame } from '../framework';
import { SearchBarCtrl } from '../control/SearchBarCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { RelFinderCtrl } from '../control/RelFinderCtrl';
import { EVENT_ARGS_FRAME } from '../types';

export class RelationFinder extends BaseApp {
    private _relfinder: RelFinderCtrl;

    public constructor(htmlFrame: HTMLElement) {
        super(htmlFrame, {
            showGraphOptions: {
                showLabels: true,
                showFaces: true,
                showDegrees: true,
                showEdges: true,
                showGroups: true
            }
        });
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.frame;
        frame.addControl("search", new SearchBarCtrl());
        frame.addControl("info", new InfoBoxCtrl());

        this._relfinder = <any>frame.addControl("relfinder", new RelFinderCtrl());
        frame.updateTheme(function (theme) {
            theme.networkOptions.edges.physics = false;
            theme.networkOptions.edges.length = 0.5;
            theme.networkOptions.physics.timestep = 0.1;
        });
    }

    public startQuery(refreshInterval: number = 1000, maxDepth: number = 6) {
        var app = this;
        this._framework.deleteNodes(function (node) {
            return app._pickedNodeIds.indexOf(node.id) < 0;
        });

        this._relfinder.startQuery(app._pickedNodeIds, refreshInterval, maxDepth);
    }

    public stopQuery() {
        this._relfinder.stopQuery();
    }
}