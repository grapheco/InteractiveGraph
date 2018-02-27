/**
 * Created by bluejoe on 2018/2/24.
 */
//require("./shape.js");
//import {utils} from "./utils";
//import {i18n} from "./messages";
var $ = require("jquery");
class GraphBrowser {
    GraphBrowser(serviceProvider, htmlGraphArea, htmlInfoBox) {
        this.infoBox = $(htmlInfoBox);
        //message bar
        this.messageBar = $(htmlGraphArea).jQuery(document.createElement("div"));
        this.messageBar.addClass("messageBar");
        this.messageBar.hide();
    }
}
GraphBrowser.CANVAS_PADDING = 80;
