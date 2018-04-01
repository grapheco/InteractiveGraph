import { BaseApp } from './app';
import { MainFrame } from '../framework';
import { SearchBarCtrl } from '../control/SearchBarCtrl';
import { ExpansionCtrl } from '../control/ExpansionCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { EVENT_ARGS_FRAME } from '../types';

export class GraphExplorer extends BaseApp {

    public constructor(htmlFrame: HTMLElement) {
        super(htmlFrame);
    }

    createFramework(htmlFrame: HTMLElement, callback: (args: EVENT_ARGS_FRAME) => void): MainFrame {
        return new MainFrame(
            htmlFrame, {
                showGraphOptions: {
                    showLabels: true,
                    showFaces: true,
                    showDegrees: true,
                    showEdges: true,
                    showGroups: true
                }
            },callback);
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.frame;

        frame.addControl("search", new SearchBarCtrl());
        frame.addControl("info", new InfoBoxCtrl());
        frame.addControl("expansion", new ExpansionCtrl());
    }
}