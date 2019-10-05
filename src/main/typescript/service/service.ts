import { GraphEdge, GraphNode, QUERY_RESULTS, LoadGraphOption, CommunityData } from '../types';

export interface GraphService {
    /**
     * establishs a new connection
     * @param callback 
     */
    requestConnect(callback: () => void);
    /**
     * get data of communities
     */
    requestGetCommunityData(callback: (data: CommunityData) => void);
    /**
     * retrieves description info in HTML format of given nodes
     * @param nodeIds 
     * @param callback 
     */
    requestGetNodeInfos(nodeIds: string[], callback: (descriptions: string[]) => void);
    /**
     * loads graph data to render
     * @param callback 
     */
    requestLoadGraph(callback: (nodes: GraphNode[], edges: GraphEdge[], option: LoadGraphOption) => void);
    /**
     * performs a search on the graph, by giving a keyword
     * @param expr 
     * @param limit 
     * @param callback 
     */
    requestSearch(expr: any, limit: number, callback: (nodes: GraphNode[]) => void);
    /**
     * performs a search on the graph, by giving a image
     * @param img
     * @param limit
     * @param callback
     */
    requestImageSearch(img: any, limit: number, callback: (nodes: GraphNode[]) => void);
    /**
     * gets neighbour nodes and edges of given nodes
     * @param nodeId 
     * @param callback 
     */
    requestGetNeighbours(nodeId, callback: (neighbourNodes: object[], neighbourEdges: object[]) => void);
    /**
     * gets categories and labels of all nodes
     */
    requestGetNodeCategories(callback: (catagoryMap: object) => void);
    /**
     * get nodes be kind of given catagory
     * @param catagory 
     * @param nodeIds 
     * @param showOrNot 
     * @param callback 
     */
    requestFilterNodesByCategory(catagory: string, nodeIds: any[],
        callback: (filteredNodeIds: any[]) => void);
    /**
     * starts a query to find relations of two nodes
     * @param startNodeId 
     * @param endNodeId 
     * @param maxDepth 
     * @param callback 
     */
    requestFindRelations(startNodeId: string, endNodeId: string, maxDepth: number, callback: (queryId: string) => void);
    /**
     * get next relations as results in a relation path query
     * @param queryId
     * @param callback 
     */
    requestGetMoreRelations(queryId: string, callback: (queryResults: QUERY_RESULTS) => void);
    /**
     * stops a relation path query
     * @param queryId 
     */
    requestStopFindRelations(queryId: string);
}