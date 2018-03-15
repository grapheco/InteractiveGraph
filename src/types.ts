export interface GraphData {
    nodes: object[];
    edges: object[];
}

/** 
 * graph json objects
*/
export interface Gson {
    data: GraphData;
    dbinfo: object;
    nodeLabelMap: object;
    defaultData: GraphData;
}

export interface ShowGraphOptions {
    showFaces?: boolean;
    showGroups?: boolean;
    showNodes?: boolean;
    showDegrees?: boolean;
    showEdges?: boolean;
    showLabels?: boolean;
    showTitles?: boolean;
}

export enum BrowserEventName {
    QUERY_SELECT = "QUERY_SELECT",
    NETWORK_BEFORE_DRAWING = "NETWORK_BEFORE_DRAWING",
    NETWORK_AFTER_DRAWING = "NETWORK_END_DRAWING",
    NETWORK_DBLCLICK = "NETWORK_DBLCLICK",
    NETWORK_CLICK = "NETWORK_CLICK",
    NODE_SELECTED = "NODE_SELECTED",
    NODE_SHOW_DESCRIPTION = "NODE_SHOW_DESCRIPTION",
}