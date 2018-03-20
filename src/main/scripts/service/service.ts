/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphBrowser } from '../browser';
import { ShowGraphOptions, QueryResults } from '../types';

export interface GraphService {
    requestInit(callback: () => void);
    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void);
    requestLoadGraph(showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[], edges: vis.Edge[]) => void);
    requestSearch(expr: any, limit: number, showGraphOptions: ShowGraphOptions, callback: (nodes: vis.Node[]) => void);
    requestGetNeighbours(nodeId, showGraphOptions: ShowGraphOptions, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void);

    getMapName2Class(): object;
    requestUpdate4ShowNodes(nodeIds: any[], showGraphOptions: ShowGraphOptions,
        callback: (updates: object[]) => void);
    requestUpdateNodesOfClass(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void);

    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number, callback: (queryResults: QueryResults) => void);
    requestGetMoreRelations(queryId: string, callback: (queryResults: QueryResults) => void);
}