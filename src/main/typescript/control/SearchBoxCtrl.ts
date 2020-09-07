import { MainFrame } from "../mainframe";
import {GraphNode, EVENT_ARGS_FRAME, FrameEventName, EVENT_ARGS_GRAPH_CONNECTED} from '../types';
import { UIControl } from "./Control";

export class SearchBoxCtrl extends UIControl {
    public _input: JQuery<HTMLElement> = null;
    public _image: JQuery<HTMLElement> = null;

    protected _content = `
    <div class="searchPanel1">
        <select name="label" class="label-select">
            
        </select>
        <input class="igraph-searchbox" type="text" size="16" placeholder="input keyword">
    </div>
    <div class="searchPanel2 igraph-searchbox-image">
        <span align="center" class="fa fa-photo fa-lg" />
    </div>`
    protected _classname = "searchPanel"
    protected _dockable = true
    protected _positionStr = "A:10,20"

    public getTypeName(): string {
        return "SearchBoxCtrl";
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        var input = $('.igraph-searchbox', htmlContainer);
        var image = $('.igraph-searchbox-image', htmlContainer);
        let label_select = $('.label-select', htmlContainer);
        if (input.length == 0) {
            throw new Error("no input for search box: .igraph-searchbox");
        }

        frame.on(FrameEventName.GRAPH_CONNECTED, (args:EVENT_ARGS_GRAPH_CONNECTED) => {
            let categories = args.categories
            for (let categoriesKey in categories) {
                label_select.append(`<option value="${categoriesKey}">${categories[categoriesKey]}</option>`)
            }
        })

        this._input = input;
        this._image = image;

        var callback = args['renderAutoCompletionItem'];
        if (callback === undefined)
            callback = (item: GraphNode) => {
                return "<b>" + item.label + "</b>";
            };

        let timeout = null;

        //binds events
        input.autocomplete({
            source: function (request, response) {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    // console.log("search");
                    var term = request.term;
                    let l = label_select.val();
                    if (l)
                        term  = l+":"+term;
                    console.log(l,term);
                    frame.search(term, function (nodes: GraphNode[]) {
                        response(nodes.map((node) => {
                            return {
                                value: node.label,
                                label: node.label,
                                node: node
                            };
                        }));
                    });
                }, 1000);
            },

            change: function (event, ui) {
                if (ui.item == null) {
                    input.data("node", null);
                } else {
                    input.data("node", ui.item.node);
                }

                return false;
            },

            select: function (event, ui) {
                let node: GraphNode = ui.item.node;
                if (node !== undefined) {
                    input.val(node.label);
                    input.data("node", node);
                    node['x'] = 0;
                    node['y'] = 0;
                    frame.insertNodes([node]);
                    // frame.focusNodes(["" + node.id]);
                    frame.emit(FrameEventName.RESULTLISTPUT,[node]);
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(callback(item.node))
                .appendTo(ul);
        };

        this._image.on('click', ()=>{
            console.log('boxOpenEmit');
            frame.emit(FrameEventName.IMAGEBOXOPEN,null);
        });

        return this;
    }
}
