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
    FOCUS_NODE = "FOCUS_EXISTING_NODE",
    INSERT_NODE = "ADD_NEW_NODE",
    NETWORK_BEFORE_DRAWING = "NETWORK_BEFORE_DRAWING",
    NETWORK_AFTER_DRAWING = "NETWORK_END_DRAWING",
    NETWORK_DBLCLICK = "NETWORK_DBLCLICK",
    NETWORK_CLICK = "NETWORK_CLICK",
}

export interface BrowserOptions {
    theme?: Theme;
    enableSearchCtrl?: boolean;
    enableShowInfoCtrl?: boolean;
    enableHighlightCtrl?: boolean;
    enableExpansionCtrl?: boolean;
    enableRelFinderCtrl?: boolean;
    showGraphOptions?: ShowGraphOptions;
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

export interface Pair<K,V> {
    _1: K,
    _2: V;
}