interface GraphData {
    nodes: object[];
    edges: object[];
}

interface JsonGraphData {
    data: GraphData;
    dbinfo: object;
}

interface ShowGraphOptions {
    showFaces?: boolean;
    showGroups?: boolean;
    showDegrees?: boolean;
    showEdges?: boolean;
    scale?: number;
}

interface LocalGraphSource {
    json?: JsonGraphData;
    jsonScriptURL?: string;
    getJsonFromScript?: () => JsonGraphData;
}