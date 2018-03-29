import { Theme } from './Theme';
import { Control } from './control/Control';
import { ToolbarCtrl } from './control/ToolbarCtrl';

export interface GraphData {
    nodes: object[];
    edges: object[];
}

export interface ScreenData {
    nodes: vis.DataSet<vis.Node>,
    edges: vis.DataSet<vis.Edge>
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

export interface ButtonOptions {
    disabled?: boolean,
    icon?: string,
    iconPosition?: string,
    caption?: string,
    tooltip?: string,
    click?: Function
}

export interface EVENT_ARGS_CREATE_BUTTONS {
    toolbar: ToolbarCtrl,
    htmlElement: HTMLElement;
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
    CREATE_BUTTONS = "CREATE_BUTTONS",
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