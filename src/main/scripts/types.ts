import { Theme } from './Theme';

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
    labels: object;
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
    FOCUS_NODES = "FOCUS_NODES",
    INSERT_NODES = "INSERT_NODES",
    NETWORK_SELECT_NODES = "NETWORK_SELECT_NODES",
    NETWORK_DESELECT_NODES = "NETWORK_DESELECT_NODES",
    NETWORK_SELECT_EDGES = "NETWORK_SELECT_EDGES",
    NETWORK_DESELECT_EDGES = "NETWORK_DESELECT_EDGES",
    NETWORK_BEFORE_DRAWING = "NETWORK_BEFORE_DRAWING",
    NETWORK_AFTER_DRAWING = "NETWORK_END_DRAWING",
    NETWORK_DBLCLICK = "NETWORK_DBLCLICK",
    NETWORK_CLICK = "NETWORK_CLICK",
    NETWORK_DRAGGING = "NETWORK_DRAGGING",
}

export interface BrowserOptions {
    theme?: Theme;
    enableSearchCtrl?: boolean;
    enableShowInfoCtrl?: boolean;
    enableHighlightCtrl?: boolean;
    enableExpansionCtrl?: boolean;
    enableRelFinderCtrl?: boolean;
    showGraphOptions?: ShowGraphOptions;

    hideUnselectedEdgeLabel?: boolean;
    edgeColorInherit?: string;
}

export interface RelationPath {
    nodes: object[];
    edges: object[];
}

export interface QueryResults {
    hasMore: boolean,
    paths: RelationPath[];
    queryId: string;
}

export interface Pair<K, V> {
    _1: K,
    _2: V;
}