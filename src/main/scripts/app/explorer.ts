import { BaseApp } from './base';
import { MainFrame } from '../framework';
import { SearchBoxCtrl } from '../control/SearchBoxCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';

export class GraphExplorer extends BaseApp {
    protected _pickedNodeIds: string[];
    
    public constructor(htmlGraphArea: HTMLElement) {
        super(htmlGraphArea);
    }

    createFramework(htmlGraphArea: HTMLElement): MainFrame {
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
        frame.addControl("expansion", new ExpansionCtrl());

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
}