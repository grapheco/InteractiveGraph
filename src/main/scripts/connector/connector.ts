/**
 * Created by bluejoe on 2018/2/24.
 */

import { MainFrame } from "../framework";
import { ShowGraphOptions, QueryResults } from '../types';

export interface Connector {
    requestConnect(callback: () => void);
    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void);
    requestLoadGraph(callback: (nodes: vis.Node[], edges: vis.Edge[]) => void);
    requestSearch(expr: any, limit: number, callback: (nodes: vis.Node[]) => void);
    requestGetNeighbours(nodeId, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void);

    getNodeCategories(): object;
    requestUpdateNodesOfCategory(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void);

    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number, callback: (queryResults: QueryResults) => void);
    requestGetMoreRelations(queryId: string, callback: (queryResults: QueryResults) => void);
    requestStopFindRelations(queryId: string);
}