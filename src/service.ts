/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphBrowser } from './browser';

export interface GraphService {
    init(callback);
    getNodesInfo(nodeIds: string[], callback: (nodeInfos: string[]) => void);
    loadGraph(options: object, callback: (graphData: object) => void);
    updateNodes(showOptions): object[];
    search(keyword: string, limit: number, callback: (nodes: any[]) => void);
}