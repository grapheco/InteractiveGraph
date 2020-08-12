import {UIControl} from "./control";
import {MainFrame} from "../mainframe";
import {EVENT_ARGS_FRAME, EVENT_ARGS_RELLIST, FrameEventName} from "../types";
import {Utils} from "../utils";
export class RelListCtrl extends UIControl{

    private _path: object[];

    private _ctrl: JQuery;

    private _list: JQuery;

    private _listNum: JQuery;

    private _frame: MainFrame;

    protected _classname = 'ResultListPanel';
    protected _dockable = true;
    protected _draggable = true;
    protected _positionStr = "A:10,70";

    //colors of selected paths
    private _pathColors = [
        '#fd9f83', '#fedb67', '#63b706',
        '#17b7fe', '#f97394', '#ed00ff'];

    private _colorIndex = 0;

    public getTypeName(): string {
        return "RelListCtrl";
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        this._frame = frame;
        this._ctrl = $(htmlContainer);
        this._list = $(".rellist", htmlContainer);
        this._listNum = $(".relnum",htmlContainer);
        this._ctrl.hide();

        this._path = [];

        this.on(FrameEventName.RELLIST_PUT, (args: EVENT_ARGS_RELLIST) => {
            this.splitEdge(args.path.edges, args.path.nodes)
                .forEach( p => {
                    let edges = p["edges"];
                    let nodes = p["nodes"];
                    let path = [];
                    path.push(nodes[0]);
                    for (let i = 0; i < edges.length; i++){
                        path.push(edges[i]);
                        path.push(nodes[i+1]);
                    }
                    this.pushPath(path, this._colorIndex)
                    this._colorIndex++;
                });
        });
        this.on(FrameEventName.RELFINDER_START, (args => this.clear()))
    }

    private splitEdge(edges: object[], nodes: object[]): object[]{
        for (let i = 0; i<edges.length - 1 ;i++){
            let e1 = edges[i];
            let e2 = edges[i+1];
            if (e1['from']==e2['to']&&e1['to']==e2['from']){
                let part1 = edges.slice();
                part1.splice(i,1);
                let part2 = edges.slice();
                part2.splice(i+1,1);
                return (this.splitEdge(part1,nodes))
                    .concat(this.splitEdge(part2,nodes));
            }
        }
        return new Array({edges:edges,nodes:nodes});
    }

    private pushPath(path: Object[], colorIndex){
        this._path.push(path);
        let item = document.createElement("li");
        let cur_node :number;
        path.forEach(pathele => {
            if(pathele.hasOwnProperty("from")){
                //edge
                let span = document.createElement("span");
                if(pathele['from']==cur_node){
                    //right arrow
                    $(span)
                        .addClass("reledge")
                        .addClass("right")
                        .append('—'+pathele['label']+'→')
                        .appendTo($(item))
                }else {
                    //left arrow
                    $(span)
                        .addClass("reledge")
                        .addClass("left")
                        .append('←'+pathele['label']+'—')
                        .appendTo($(item))
                }
            }else {
                //node
                cur_node = pathele['id'];
                let span = document.createElement("span");
                $(span)
                    .addClass("relnode")
                    .append(pathele['label'])
                    .appendTo($(item))
            }
        });
        $(item)
            .addClass("relitem")
            .attr("style","border-left-color:"+this._pathColors[colorIndex % this._pathColors.length])
            .appendTo(this._list)
            .click((e)=>{
                let updates = [];
                let selectEdgeIds = [];
                path.forEach((x: any) => {
                    //x is edge
                    if(x.hasOwnProperty("from")) {
                        let selectedColor = this._pathColors[colorIndex % this._pathColors.length];
                        selectEdgeIds.push(x['id']);
                        updates.push({
                            id: x.id,
                            chosen: {
                                edge: function (values, id, selected, hovering) {
                                    if (selected) {
                                        values.color = selectedColor;
                                        values.width = 2;
                                        values.opacity = 0.9;
                                    }
                                }
                            }
                        });
                    }
                });
                this._frame.updateEdges(updates);
                this._frame.focusEdges(Utils.distinct(selectEdgeIds));
            });
        this._listNum.text(this._path.length);
        if(this._path.length>0) this._ctrl.show()
    }

    private clear(){
        this._path = []
        this._colorIndex = 0;
        this._list.html("");
        this._listNum.text(this._path.length);
        this._ctrl.hide()
    }
}
