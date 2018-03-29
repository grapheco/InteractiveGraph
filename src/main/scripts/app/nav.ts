import { MainFrame } from '../framework';
import { BaseApp } from './base';

export class GraphNavigator extends BaseApp {
    public constructor(htmlGraphArea: HTMLElement) {
        super(htmlGraphArea);
    }

    createFramework(htmlGraphArea: HTMLElement): MainFrame {
        var frame = new MainFrame(
            htmlGraphArea, {
                hideUnselectedEdgeLabel: true,
                showGraphOptions: {
                    showLabels: true,
                    showTitles: true,
                    showFaces: true,
                    showDegrees: true,
                    showEdges: true,
                    showGroups: true
                }
            });

        return frame;
    }
}