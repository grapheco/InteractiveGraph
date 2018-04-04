import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, EVENT_ARGS_FRAME, GRAPH_NODE, RECT } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";

export class SearchBarCtrl extends UIControl {
    private _renderAutoCompletionItem = function (item: GRAPH_NODE) {
        return "<b>" + item.label + "</b>";
    }

    onCreate(args: EVENT_ARGS_FRAME) {
        var frame = args.frame;
        /*
        <div id="searchPanel" class="searchPanel">
            <div id="searchPanel1" class="searchPanel1">
                <input id="searchBox" class="searchBox" type="text" size="16" placeholder="input keyword">
            </div>
            <div id="searchPanel2" class="searchPanel2">
                <span align="center" class="fa fa-search fa-lg"></i>
            </div>
        </div>
        */
        var thisCtrl = this;
        var offset = $(args.htmlMainFrame).offset();
        var panel = document.createElement("div");
        this._htmlContainer = panel;
        $(panel).addClass("searchPanel").appendTo($(document.body));
        
        var searchPanel1 = document.createElement("div");
        $(searchPanel1).addClass("searchPanel1")
            .appendTo($(panel));

        $(this.createSearchBox(frame)).appendTo($(searchPanel1))

        var searchPanel2 = document.createElement("div");
        $(searchPanel2).addClass("searchPanel2")
            .appendTo($(panel));
        var i = document.createElement("span");
        $(i).addClass("fa")
            .addClass("fa-search")
            .addClass("fa-lg")
            .appendTo($(searchPanel2));

        super.setPosition((frameRect: RECT, ctrlRect: RECT) => {
            return {
                x: frameRect.left + 10,
                y: frameRect.top + 20
            };
        });

        this.onResize(args);
    }

    public createSearchBox(frame: MainFrame): HTMLElement {
        var thisCtrl = this;

        var htmlSearchBox = document.createElement("input");
        $(htmlSearchBox).addClass("searchBox")
            .attr("type", "text")
            .attr("placeholder", "input keyword");

        //binds events
        $(htmlSearchBox).autocomplete({
            source: function (request, response) {
                var term = request.term;
                frame.search(term, function (nodes: GRAPH_NODE[]) {
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
                console.log(ui.item);
                if (ui.item == null) {
                    $(htmlSearchBox).data("node", null);
                } else {
                    $(htmlSearchBox).data("node", ui.item.node);
                }

                return false;
            },

            select: function (event, ui) {
                console.log(ui.item);
                var node: GRAPH_NODE = ui.item.node;
                if (node !== undefined) {
                    $(htmlSearchBox).val(node.label);
                    $(htmlSearchBox).data("node", node);
                    frame.insertNodes([node]);
                    frame.focusNodes(["" + node.id]);
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(thisCtrl._renderAutoCompletionItem(item.node))
                .appendTo(ul);
        };

        return htmlSearchBox;
    }
}
