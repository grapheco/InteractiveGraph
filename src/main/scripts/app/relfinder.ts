import { BaseApp } from './base';
import { MainFrame } from '../framework';
import { SearchBoxCtrl } from '../control/SearchBoxCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { RelFinderCtrl } from '../control/RelFinderCtrl';

export class RelationFinder extends BaseApp {
    private _relfinder: RelFinderCtrl;
    protected _pickedNodeIds: string[];

    public constructor(htmlGraphArea: HTMLElement) {
        super(htmlGraphArea);
    }

    public createFramework(htmlGraphArea: HTMLElement): MainFrame {
        var frame = new MainFrame(
            htmlGraphArea, {
                showGraphOptions: {
                    showLabels: true,
                    showFaces: true,
                    showDegrees: true,
                    showEdges: true,
                    showGroups: true
                }
            });

        frame.addControl("search", new SearchBoxCtrl());
        frame.addControl("info", new InfoBoxCtrl());

        this._relfinder = <any>frame.addControl("relfinder", new RelFinderCtrl());
        frame.updateTheme(function (theme) {
            theme.networkOptions.edges.physics = false;
            theme.networkOptions.edges.length = 0.5;
            theme.networkOptions.physics.timestep = 0.1;
        });

        return frame;
    }

    public pickup(keywords: object[], callback) {
        var framework = this._framework;
        var app = this;
        framework.search(keywords, function (nodes) {
            var nodeIds = framework.insertNodes(nodes);
            app._pickedNodeIds = nodeIds;
            framework.placeNodes(nodeIds);
            framework.updateNodes(nodeIds.map(function (nodeId: any) {
                return { id: nodeId, physics: false };
            }));

            if (callback !== undefined)
                callback();
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