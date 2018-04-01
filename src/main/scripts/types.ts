import { Theme } from './Theme';
import { MainFrame } from './framework';
import { Control } from './control/Control';
import { ToolbarCtrl } from './control/ToolbarCtrl';
import { Connector } from './connector/connector';

export interface NodeNEdges {
    nodes: object[];
    edges: object[];
}

export interface NodeNEdgeIds {
    nodes: string[];
    edges: string[];
}

export interface NodeNEdgeSets {
    nodes: vis.DataSet<vis.Node>,
    edges: vis.DataSet<vis.Edge>
}

/** 
 * graph json objects
*/
export interface Gson {
    data: NodeNEdges;
    dbinfo: object;
    categories: object;
    defaultData: NodeNEdges;
}

export interface ButtonOptions {
    disabled?: boolean,
    icon?: string,
    iconPosition?: string,
    caption?: string,
    tooltip?: string,
    checked?: boolean,
    click?: Function
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

export interface EVENT_ARGS_FRAME {
    frame: MainFrame;
    network: vis.Network;
    theme: Theme;
    connector: Connector;
    htmlFrame: HTMLElement;
}

export interface EVENT_ARGS_FRAME_DRAWING extends EVENT_ARGS_FRAME {
    context2d: CanvasRenderingContext2D;
}

export interface EVENT_ARGS_FRAME_INPUT extends EVENT_ARGS_FRAME, NodeNEdgeIds {
    previousSelection?: NodeNEdgeIds;
}

export enum FrameEventName {
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
}

export interface BrowserOptions {
    theme?: Theme;
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

export interface Pair<K, V> {
    _1: K,
    _2: V;
}