/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphBrowser } from './browser';
import { ShowGraphOptions } from './types';

export interface GraphService {
    asyncInit(callback: () => void);
    asyncGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void);
    asyncLoadGraph(showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[], edges: vis.Edge[]) => void);
    asyncSearch(expr: any, limit: number, showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[]) => void);
    asyncGetNeighbours(nodeId, showGraphOptions: ShowGraphOptions, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void);

    getMapName2Class(): object;
    asyncUpdate4ShowNodes(nodeIds: any[], showGraphOptions: ShowGraphOptions,
        callback: (updates: object[]) => void);
    asyncUpdateNodesOfClass(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void);
}