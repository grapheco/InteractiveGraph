import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, EVENT_ARGS_FRAME } from '../types';
import { Connector } from '../connector/connector';
import { i18n } from "../messages";
import { Control } from "./Control";

export class SearchBarCtrl extends Control {
    private _htmlSearchBar: HTMLElement;
    
    private _renderAutoCompletionItem = function (item: vis.Node) {
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
        var offset = $(args.htmlFrame).offset();
        var panel = document.createElement("div");
        this._htmlSearchBar = panel;
        $(panel).addClass("searchPanel")
            .offset({ left: offset.left + 10, top: offset.top + 20 })
            .appendTo($(document.body));
        var searchPanel1 = document.createElement("div");
        $(searchPanel1).addClass("searchPanel1")
            .appendTo($(panel));
        var htmlSearchBox = document.createElement("input");
        $(htmlSearchBox).addClass("searchBox")
            .attr("type", "text")
            .attr("placeholder", "input keyword")
            .appendTo($(searchPanel1));
        var searchPanel2 = document.createElement("div");
        $(searchPanel2).addClass("searchPanel2")
            .appendTo($(panel));
        var i = document.createElement("span");
        $(i).addClass("fa")
            .addClass("fa-search")
            .addClass("fa-lg")
            .appendTo($(searchPanel2));

        //binds events
        $(htmlSearchBox).autocomplete({
            source: function (request, response) {
                var term = request.term;
                frame.search(term, function (nodes: vis.Node[]) {
                    response(nodes.map((node) => {
                        return {
                            value: node.label,
                            label: node.label,
                            node: node
                        };
                    }));
                });
            },

            select: function (event, ui) {
                var node: vis.Node = ui.item.node;
                if (node !== undefined) {
                    $(htmlSearchBox).val(node.label);
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
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
        $(this._htmlSearchBar).remove();
    }
}
