import { MainFrame } from "../framework";
import { FRAME_OPTIONS, QUERY_RESULTS, GRAPH_NODE, GRAPH_EDGE } from '../types';

export interface GraphService {
    requestConnect(callback: () => void);
    requestGetNodeDescriptions(nodeIds: string[], callback: (descriptions: string[]) => void);
    requestLoadGraph(callback: (nodes: GRAPH_NODE[], edges: GRAPH_EDGE[]) => void);
    requestSearch(expr: any, limit: number, callback: (nodes: GRAPH_NODE[]) => void);
    requestGetNeighbours(nodeId, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void);

    getNodeCategories(): object;
    requestUpdateNodesOfCategory(className: string, nodeIds: any[], showOrNot: boolean,
        callback: (updates: object[]) => void);

    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number, callback: (queryResults: QUERY_RESULTS) => void);
    requestGetMoreRelations(queryId: string, callback: (queryResults: QUERY_RESULTS) => void);
    requestStopFindRelations(queryId: string);
}