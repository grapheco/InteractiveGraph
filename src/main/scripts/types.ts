import { Theme } from './Theme';
import { MainFrame } from './framework';
import { Control } from './control/Control';
import { ToolbarCtrl } from './control/ToolbarCtrl';
import { GraphService } from './service/service';
import { RelFinderCtrl } from './control/RelFinderCtrl';

export interface NODES_EDGES {
    nodes: object[];
    edges: object[];
}

export interface NODE_EDGE_IDS {
    nodes: string[];
    edges: string[];
}

export interface NODE_EDGE_SET {
    nodes: vis.DataSet<vis.Node>,
    edges: vis.DataSet<vis.Edge>
}

/** 
 * graph json objects
*/
export interface GSON {
    data: NODES_EDGES;
    dbinfo: object;
    categories: object;
    defaultData: NODES_EDGES;
}

export interface BUTTON_OPTIONS {
    disabled?: boolean,
    icon?: string,
    iconPosition?: string,
    caption?: string,
    tooltip?: string,
    checked?: boolean,
    click?: Function
}

export interface GRAPH_NODE extends vis.Node {

}

export interface GRAPH_EDGE extends vis.Edge {

}

export interface NETWORK extends vis.Network {

}

export interface NETWORK_OPTIONS extends vis.Options {

}

export interface FRAME_OPTIONS {
    showFaces?: boolean;
    showGroups?: boolean;
    showNodes?: boolean;
    showDegrees?: boolean;
    showEdges?: boolean;
    showLabels?: boolean;
    showTitles?: boolean;
}

export interface EVENT_ARGS_FRAME {
    frame: MainFrame;
    network: vis.Network;
    theme: Theme;
    connector: GraphService;
    htmlMainFrame: HTMLElement;
}

export interface EVENT_ARGS_FRAME_DRAWING extends EVENT_ARGS_FRAME {
    context2d: CanvasRenderingContext2D;
}

export interface EVENT_ARGS_FRAME_INPUT extends EVENT_ARGS_FRAME, NODE_EDGE_IDS {
    previousSelection?: NODE_EDGE_IDS;
}

export interface EVENT_ARGS_FRAME_RESIZE extends EVENT_ARGS_FRAME {
    width?: number;
    height?: number;
    oldWidth?: number;
    oldHeight?: number;
}

export interface EVENT_ARGS_RELFINDER extends EVENT_ARGS_FRAME {
    maxDepth: number;
}

export enum FrameEventName {
    THEME_CHANGED = "THEME_CHANGED",
    DESTROY_CONTROL = "DESTROY_CONTROL",
    REMOVE_CONTROL = "REMOVE_CONTROL",
    CREATE_CONTROL = "CREATE_CONTROL",
    ADD_CONTROL = "ADD_CONTROL",
    GRAPH_CONNECTED = "GRAPH_CONNECTED",
    FRAME_CREATED = "FRAME_CREATED",
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
    FRAME_RESIZE = "FRAME_RESIZE",
    RELFINDER_START = "RELFINDER_START",
    RELFINDER_STOP = "RELFINDER_STOP"
}

export interface RELATION_PATH {
    nodes: object[];
    edges: object[];
}

export interface QUERY_RESULTS {
    hasMore: boolean,
    paths: RELATION_PATH[];
    queryId: string;
}

export interface PAIR<K, V> {
    _1: K,
    _2: V;
}

export interface RECT {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface POINT {
    x: number;
    y: number;
}