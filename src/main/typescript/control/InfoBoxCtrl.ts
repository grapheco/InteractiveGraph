import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../mainframe";
import { FrameEventName, EVENT_ARGS_FRAME_INPUT, EVENT_ARGS_FRAME, RECT } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";

export class InfoBoxCtrl extends UIControl {
    onCreateUI(htmlContainer: HTMLElement, args: EVENT_ARGS_FRAME) {
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
        frame.off(FrameEventName.NETWORK_CLICK);
        frame.on(FrameEventName.NETWORK_CLICK,
            function (args: EVENT_ARGS_FRAME_INPUT) {
                if (!ctrl._disabled) {
                    var nodeIds = args.nodes;
                    if (nodeIds.length > 0) {
                        frame.getGraphService().requestGetNodeInfos(nodeIds,
                            function (nodeInfos) {
                                $(htmlInfoBox).empty();
                                $(htmlInfoBox).append(nodeInfos[0]);
                                $(htmlContainer).show();
                            });
                    }
                }
            });

        super.setPosition((frameRect: RECT, ctrlRect: RECT) => {
            return {
                x: frameRect.left + 10,
                y: frameRect.top + 80
            };
        });
    }
}
