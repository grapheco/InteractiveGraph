interface GraphData {
    nodes: object[];
    edges: object[];
}

/** 
 * graph json objects
*/
interface Gson {
    data: GraphData;
    dbinfo: object;
    nodeLabelMap: object;
    defaultData: GraphData;
}

interface ShowGraphOptions {
    showFaces?: boolean;
    showGroups?: boolean;
    showNodes?: boolean;
    showDegrees?: boolean;
    showEdges?: boolean;
    scale?: number;
    showLabel?:boolean;
    showTitle?:boolean;
}

interface SearchResult{
    nodeId: any; 
    value: string;
    title?:string;
}