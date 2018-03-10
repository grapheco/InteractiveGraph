/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphBrowser } from './browser';

export interface GraphService {
    asyncInit(callback: () => void);
    asyncGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void);
    asyncLoadGraph(options: object, callback: (graphData: object) => void);
    asyncSearch(expr: any, limit: number, callback: (nodes: any[]) => void);
    asyncGetNeighbours(nodeId, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void);

    getNodeLabelMap(): object;
    asyncUpdate4ShowNodes(nodeIds: any[], showOptions: ShowGraphOptions,
        callback: (updates: object[]) => void);
    asyncUpdateNodesOfClass(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void);
}