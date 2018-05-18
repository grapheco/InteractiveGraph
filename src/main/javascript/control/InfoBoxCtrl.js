"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const Control_1 = require("./Control");
class InfoBoxCtrl extends Control_1.UIControl {
    onCreateUI(htmlContainer, args) {
        var frame = args.mainFrame;
        var ctrl = this;
        /*
         <div id="infoPanel" class="infoPanel">
             <div>
                 <div id="infoPanel1" class="infoPanel1">node description</div>
                 <div id="infoPanel2" class="infoPanel2">
                     <span id="btnCloseInfoPanel" align="center" class="fa fa-close fa-lg btnCloseInfoPanel"></span>
                 </div>
             </div>
             <div id="infoBox" class="infoBox"></div>
         </div>
         */
        var offset = $(args.htmlMainFrame).offset();
        $(htmlContainer).addClass("infoPanel");
        var div = document.createElement("div");
        $(div).appendTo($(htmlContainer));
        $('<div class="infoPanel1"></div>')
            .appendTo($(div));
        var infoPanel2 = $(' <div class="infoPanel2"></div>')
            .appendTo($(div));
        var btnCloseInfoPanel = $('<span align="center" class="fa fa-close fa-lg btnCloseInfoPanel"></span>').click(function () {
            $(htmlContainer).hide();
        }).appendTo($(infoPanel2));
        var htmlInfoBox = $('<div class="infoBox"></div>').appendTo($(htmlContainer));
        //binds events
        $(htmlContainer).draggable();
        //show details of selected node
        //DANGER!!!
        frame.off(types_1.FrameEventName.NETWORK_CLICK);
        frame.on(types_1.FrameEventName.NETWORK_CLICK, function (args) {
            if (!ctrl._disabled) {
                var nodeIds = args.nodes;
                if (nodeIds.length > 0) {
                    frame.getGraphService().requestGetNodeDescriptions(nodeIds, function (nodeInfos) {
                        $(htmlInfoBox).empty();
                        $(htmlInfoBox).append(nodeInfos[0]);
                        $(htmlContainer).show();
                    });
                }
            }
        });
        super.setPosition((frameRect, ctrlRect) => {
            return {
                x: frameRect.left + 10,
                y: frameRect.top + 80
            };
        });
    }
}
exports.InfoBoxCtrl = InfoBoxCtrl;
