import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, EVENT_ARGS_FRAME_INPUT, EVENT_ARGS_FRAME } from '../types';
import { Connector } from '../connector/connector';
import { i18n } from "../messages";
import { Control } from "./Control";
import { MainFrameWatcher } from "./watcher";

export class InfoBoxCtrl extends Control {
    private _frameWatcher: MainFrameWatcher;
    private _htmlInfoPanel: HTMLElement;

    onCreate(args: EVENT_ARGS_FRAME) {
        var frame = args.frame;
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
        var offset = $(args.htmlFrame).offset();

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
        this._htmlInfoPanel = htmlInfoPanel;

        $(btnCloseInfoPanel).click(function () {
            $(htmlInfoPanel).hide();
        });

        var watcher = new MainFrameWatcher(frame);
        this._frameWatcher = watcher;
        //show details of selected node
        //DANGER!!!
        watcher.off(FrameEventName.NETWORK_CLICK);
        watcher.on(FrameEventName.NETWORK_CLICK,
            function (args: EVENT_ARGS_FRAME_INPUT) {
                var nodeIds = args.nodes;
                if (nodeIds.length > 0) {
                    frame.getConnector().requestGetNodeDescriptions(nodeIds,
                        function (nodeInfos) {
                            $(htmlInfoBox).empty();
                            $(htmlInfoBox).append(nodeInfos[0]);
                            $(htmlInfoPanel).show();
                        });
                }
            });
    }

    public onDestroy(args: EVENT_ARGS_FRAME) {
        $(this._htmlInfoPanel).hide();
        $(this._htmlInfoPanel).remove();
        this._frameWatcher.undo();
    }
}
