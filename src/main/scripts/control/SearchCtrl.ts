import { Utils, Rect, Point } from "../utils";
import { GraphBrowser } from "../browser";
import { BrowserEventName } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control } from "./Control";

export class SearchCtrl implements Control {
    private _renderAutoCompletionItem = function (item: vis.Node) {
        return "<b>" + item.label + "</b>";
    }

    init(browser: GraphBrowser, network: vis.Network, service: GraphService) {
        /*
        <div id="searchPanel" class="searchPanel">
            <div id="searchPanel1" class="searchPanel1">
                <input id="searchBox" class="searchBox" type="text" size="16" placeholder="input keyword">
            </div>
            <div id="searchPanel2" class="searchPanel2">
                <i align="center" class="fa fa-search fa-lg"></i>
            </div>
        </div>
        */
        var thisCtrl = this;
        var offset = browser._jqueryGraphArea.offset();
        var panel = document.createElement("div");
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
        var i = document.createElement("i");
        $(i).addClass("fa")
            .addClass("fa-search")
            .addClass("fa-lg")
            .appendTo($(searchPanel2));

        //binds events
        $(htmlSearchBox).autocomplete({
            source: function (request, response) {
                var term = request.term;
                browser.search(term, function (nodes: vis.Node[]) {
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
                    browser.insertNodes([node]);
                    browser.focusNodes(["" + node.id]);
                }

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                .append(thisCtrl._renderAutoCompletionItem(item.node))
                .appendTo(ul);
        };
    }
}
