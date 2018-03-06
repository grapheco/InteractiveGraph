/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphBrowser } from './browser';

export interface GraphService {
    requestInit(callback: () => void);
    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void);
    requestLoadGraph(options: object, callback: (graphData: object) => void);
    requestSearch(keyword: string, limit: number, callback: (nodes: any[]) => void);

    getNodeLabelMap(): object;
    update4ShowNodes(showOptions): object[];
    update4ShowNodesOfLabel(nodeLabel: string, showOrNot: boolean, callback: (updates: object[]) => void);
}