import { MainFrame } from "../mainframe";
import { GraphNode, EVENT_ARGS_FRAME } from '../types';
import { UIControl } from "./Control";

export class SearchBoxCtrl extends UIControl {
    public _input: JQuery<HTMLElement> = null;

    public getTypeName(): string {
        return "SearchBoxCtrl";
    }

    public onBindElement(htmlContainer: HTMLElement, frame: MainFrame, args: EVENT_ARGS_FRAME) {
        var input = $('.igraph-searchbox', htmlContainer);
        if (input.length == 0) {
            throw new Error("no input for search box: .igraph-searchbox");
        }

        this._input = input;

        var callback = args['renderAutoCompletionItem'];
        if (callback === undefined)
            callback = (item: GraphNode) => {
                return "<b>" + item.label + "</b>";
            };

        //binds events
        input.autocomplete({
            source: function (request, response) {
                var term = request.term;
                frame.search(term, function (nodes: GraphNode[]) {
                    response(nodes.map((node) => {
                        return {
                            value: node.label,
                            label: node.label,
                            node: node
                        };
                    }));
                });
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
                var node: GraphNode = ui.item.node;
                if (node !== undefined) {
                    input.val(node.label);
                    input.data("node", node);
                    frame.insertNodes([node]);
                    frame.focusNodes(["" + node.id]);
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(callback(item.node))
                .appendTo(ul);
        };

        return this;
    }
}
