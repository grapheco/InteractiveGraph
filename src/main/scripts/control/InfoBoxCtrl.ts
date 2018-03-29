import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { BrowserEventName } from '../types';
import { Connector } from '../connector/base';
import { i18n } from "../messages";
import { Control } from "./Control";

export class InfoBoxCtrl extends Control {
    
    init(browser: MainFrame) {
        /*
         <div id="infoPanel" class="infoPanel">
             <div>
                 <div id="infoPanel1" class="infoPanel1">node description</div>
                 <div id="infoPanel2" class="infoPanel2">
                     <span id="btnCloseInfoPanel" align="center" class="fa fa-close fa-lg btnCloseInfoPanel"></i>
                 </div>
             </div>
             <div id="infoBox" class="infoBox"></div>
         </div>
         */
        var offset = $(browser.getContainerElement()).offset();

        var htmlInfoPanel = document.createElement("div");
        $(htmlInfoPanel).addClass("infoPanel")
            .offset({ left: offset.left + 10, top: offset.top + 80 })
            .appendTo($(document.body));
        var div = document.createElement("div");
        $(div).appendTo($(htmlInfoPanel));
        var infoPanel1 = document.createElement("div");
        $(infoPanel1).addClass("infoPanel1")
            .appendTo($(div));
        var infoPanel2 = document.createElement("div");
        $(infoPanel2).addClass("infoPanel2")
            .appendTo($(div));
        var btnCloseInfoPanel = document.createElement("span");
        $(btnCloseInfoPanel).addClass("fa")
            .addClass("fa-close")
            .addClass("fa-lg")
            .addClass("btnCloseInfoPanel")
            .attr("align", "center")
            .appendTo($(infoPanel2));

        var htmlInfoBox = document.createElement("div");
        $(htmlInfoBox).addClass("infoBox").
            appendTo($(htmlInfoPanel));

        //binds events

        $(htmlInfoPanel).draggable();

        $(btnCloseInfoPanel).click(function () {
            $(htmlInfoPanel).hide();
        });

        //show details of selected node
        //DANGER!!!
        browser.removeAllListeners(BrowserEventName.NETWORK_CLICK);
        browser.on(BrowserEventName.NETWORK_CLICK,
            function (network, args) {
                var nodeIds = args.nodes;
                if (nodeIds.length > 0) {
                    browser.getConnector().requestGetNodeDescriptions(nodeIds,
                        function (nodeInfos) {
                            $(htmlInfoBox).empty();
                            $(htmlInfoBox).append(nodeInfos[0]);
                            $(htmlInfoPanel).show();
                        });
                }
            });
    }
}
