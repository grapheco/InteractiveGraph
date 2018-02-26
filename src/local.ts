/**
 * Created by bluejoe on 2018/2/24.
 */
import { GraphService } from './service';

export class LocalGraph implements GraphService {
    private _jsonGraphData: object;
    private _nodeIdMap: Map<string, object> = new Map<string, object>();

    constructor(jsonGraphData: object) {
        this._jsonGraphData = jsonGraphData;
        var self = this;
        jsonGraphData['nodes'].forEach(node => {
            self._nodeIdMap.set(node['id'], node);
        });
    }

    init() {

    }

    getNodesInfo(nodeIds: string[]): object[] {
        var self = this;
        return nodeIds.map(nodeId => {
            return self._nodeIdMap.get(nodeId);
        });
    }

    loadGraph(options: object, callback: (graphData: object) => void) {
        callback(this._jsonGraphData);
    }
}