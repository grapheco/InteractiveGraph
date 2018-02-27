/**
 * Created by bluejoe on 2018/2/24.
 */

import { GraphBrowser } from './browser';

export interface GraphService {
    init(callback);
    getNodesInfo(nodeIds: string[], callback: (nodeInfos: object[]) => void);
    loadGraph(options: object, callback: (graphData: object) => void);
    updateNodes(showOptions):object[];
}