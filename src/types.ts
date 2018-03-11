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
    showLabels?: boolean;
    showTitles?: boolean;
}