import {UIControl} from "./control";
import {MainFrame} from "../mainframe";
import {EVENT_ARGS_FRAME, FrameEventName, GraphNode} from "../types";
import {IdType} from "vis";

export class ResultListCtrl extends UIControl {

    protected _content = ``;
    protected _classname = 'ResultListPanel';
    protected _dockable = true;
    protected _positionStr = "A:10,70";

    private _frame:MainFrame = null;
    private _nodeSet:GraphNode[] = [];
    private _html:JQuery<HTMLElement>;
    private _resultList:JQuery<HTMLElement>;
    private _idList:IdType[] = [];
    private _clearBtn:JQuery<HTMLElement>;
    private _delBtn:JQuery<HTMLElement>;
    private _closeBtn:JQuery<HTMLElement>;
    private _delMode:boolean = false;
    private _isHide:boolean = false;


    getTypeName(): string {
        return "ResultListCtrl";
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        this._frame = frame;
        this.insertDOM(htmlContainer);
        this._resultList = $('.result-list', htmlContainer);
        this._clearBtn = $('.result-list-clear', htmlContainer);
        this._delBtn = $('.result-list-del', htmlContainer);
        this._closeBtn = $('.result-list-close', htmlContainer);
        //add
        this.on(FrameEventName.RESULTLISTPUT, (args) => {
            if(args instanceof Array){
                let nodes:GraphNode[] = [];
                args.forEach(arg =>{
                    console.log(typeof arg);
                    if(typeof arg == 'number'){
                        console.log('trams');
                        nodes.push(frame.getNodeById(arg.toString()))
                    }else {
                        nodes.push(arg)
                    }
                })
                this.addNodes(nodes);
            }
        });
        //del
        this._delBtn.on('click',()=>{
            this._delMode = !this._delMode;
            if(this._delMode){
                $('.node-info img').hide()
                $('.node-info .del-mask').show()
            }else {
                $('.node-info img').show()
                $('.node-info .del-mask').hide()
            }
        })
        //clear
        this._clearBtn.on('click',()=>{
            this.clearList()
        });

        //close
        this._closeBtn.on('click',()=>{
            this.hide()
        })
        this.hide();
        return this;
    }

    hide() {
        super.hide();
        this._isHide = true;
    }

    show() {
        super.show();
        this._isHide = false;
    }

    /*
    * add Node to resultSet
    * */
    public addNodes(nodes:GraphNode[]){
        if(this._isHide) this.show();
        nodes.forEach((node)=>{
            if(this._idList.indexOf(node.id)==-1) {
                this._idList.push(node.id);
                this._nodeSet.push(node);
                let img = '';
                if (node.image) {
                    img = `<img src="${node.image}" alt="">`
                }
                let nodeInfo = $(document.createElement("li"));
                nodeInfo.addClass('node-info');
                nodeInfo.append(`
                    <span class="photo">
                    ${img}
                    <span class="del-mask">
                        <i class="fa fa-minus-circle fa-lg btnCloseInfoPanel"></i>
                    </span>
                    </span>
                    <span class="title">${node.label}</span>
                `);
                nodeInfo.click(()=>{
                    if(this._delMode){
                        this._nodeSet = this._nodeSet.slice(
                            this._idList.indexOf(node.id),1);
                        this._idList = this._idList.slice(
                            this._idList.indexOf(node.id),1);
                        nodeInfo.remove()
                        console.log(this._idList);
                    }else {
                        this.clickHandler(node)
                    }
                });
                nodeInfo.dblclick(()=>{
                    if(!this._delMode) {
                        this.dbClickHandler(node)
                    }
                });
                nodeInfo.appendTo(this._resultList);
                //close del mode
                this._delMode = false;
                $('.node-info img').show()
                $('.node-info .del-mask').hide()
            }
        })

    }

    /*
    * delete Node
    * */
    public delNodes(){

    }

    /*
    * clear resultList
    * */
    public clearList(){
        this._idList = [];
        this._nodeSet = [];
        this._resultList.html('')
    }

    private clickHandler(node:GraphNode){
        this._frame.highlightNodes(["" + node.id]);
    }

    private dbClickHandler(node:GraphNode){
        this._frame.focusNodes(["" + node.id]);
    }

    private insertDOM(htmlContainer:HTMLElement){
        htmlContainer.innerHTML = `
            <div class="result-list-wrapper">
                <div class="result-list-title">Search Result</div>
                <div class="result-control">
                    <div class="result-list-close igraph-button-sq">
                        <i class="fa fa-close fa-lg btnCloseInfoPanel"></i>
                    </div>
                    <div class="result-list-clear igraph-button-sq is-danger">
                        <i class="fa fa-trash fa-lg btnCloseInfoPanel"></i>
                    </div>
                    <div class="result-list-del igraph-button-sq is-warning">
                        <i class="fa fa-minus-circle fa-lg btnCloseInfoPanel"></i>
                    </div>
                </div>
                <ul class="result-list">
                </ul>
            </div>
        `
    }
}
