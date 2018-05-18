"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const theme_1 = require("../theme");
const SearchBarCtrl_1 = require("../control/SearchBarCtrl");
const InfoBoxCtrl_1 = require("../control/InfoBoxCtrl");
const ToolbarCtrl_1 = require("../control/ToolbarCtrl");
const types_1 = require("../types");
const HighlightNodeCtrl_1 = require("../control/HighlightNodeCtrl");
const ConnectCtrl_1 = require("../control/ConnectCtrl");
class GraphNavigator extends app_1.BaseApp {
    constructor(htmlFrame) {
        super(htmlFrame, {
            showLabels: true,
            showTitles: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        });
    }
    onCreateFrame(args) {
        var frame = args.mainFrame;
        this._searchBar = frame.addControl("search", new SearchBarCtrl_1.SearchBarCtrl());
        this._infoBox = frame.addControl("info", new InfoBoxCtrl_1.InfoBoxCtrl());
        var connect = frame.addControl("connect", new ConnectCtrl_1.ConnectCtrl());
        var hilight = frame.addControl("hilight", new HighlightNodeCtrl_1.HighlightNodeCtrl());
        var toolbar = frame.addControl("toolbar", new ToolbarCtrl_1.ToolbarCtrl());
        var app = this;
        toolbar.addButton({
            icon: "fa fa-user-circle-o",
            checked: true,
            tooltip: "show faces",
            click: (checked) => { app.toggleFaces(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-gavel",
            checked: true,
            tooltip: "show degrees",
            click: (checked) => { app.toggleWeights(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-share-alt",
            checked: true,
            tooltip: "show edges",
            click: (checked) => { app.toggleEdges(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-strikethrough",
            checked: false,
            tooltip: "always show edge's label",
            click: (checked) => { app.toggleShowEdgeLabelAlways(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-circle-o",
            checked: false,
            tooltip: "show border",
            click: (checked) => { app.toggleNodeBorder(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-transgender-alt",
            checked: false,
            tooltip: "show edge color",
            click: (checked) => { app.toggleEdgeColor(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-clone",
            checked: false,
            tooltip: "show shadow",
            click: (checked) => { app.toggleShadow(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-anchor",
            checked: true,
            tooltip: "show navigation buttons",
            click: (checked) => { app.toggleNavigationButtons(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-search",
            checked: true,
            tooltip: "show search bar",
            click: (checked) => { app.toggleSearchBar(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-info-circle",
            checked: true,
            tooltip: "show info",
            click: (checked) => { app.toggleInfoBox(checked); }
        });
        toolbar.addButton({
            icon: "fa fa-file-code-o",
            tooltip: "load GSON string",
            click: (checked) => { connect.loadGsonString(); }
        });
        toolbar.addButton({
            icon: "fa fa-folder-open-o",
            tooltip: "load GSON url",
            click: (checked) => { connect.loadGsonUrl(); }
        });
        this.addScaleSlider(toolbar, frame);
        this._addThemeSelect(toolbar);
        this._frame.on(types_1.FrameEventName.GRAPH_CONNECTED, (args) => {
            app._addCategoriesSelect(toolbar, frame.getGraphService());
            hilight.clear();
            app.showGraph({}, () => { });
        });
        this.toggleShowEdgeLabelAlways(false);
    }
    addScaleSlider(toolbar, frame) {
        var slider = document.createElement("div");
        $(slider).addClass("scaleSlider");
        $(slider).slider({
            value: 80,
            min: 5,
            max: 100,
            step: 5,
            slide: function (event, ui) {
                frame.scaleTo(ui.value / 100);
            }
        });
        toolbar.addTool(slider);
    }
    toggleInfoBox(checked) {
        if (checked) {
            this._infoBox.enable();
        }
        else {
            this._infoBox.disable();
        }
    }
    toggleSearchBar(checked) {
        if (checked) {
            this._searchBar.show();
        }
        else {
            this._searchBar.hide();
        }
    }
    _addCategoriesSelect(toolbar, connector) {
        var app = this;
        var map = this._frame.getNodeCategories();
        var span = document.getElementById("categories-select");
        if (span != null)
            span.remove();
        span = document.createElement("span");
        $(span).attr("id", "categories-select");
        for (var key in map) {
            var check = document.createElement("input");
            var label = document.createElement("label");
            $(check).attr("id", "checkbox_" + key)
                .appendTo($(span))
                .attr("key", key)
                .attr("type", "checkbox")
                .attr("checked", "true")
                .click(function () {
                app._frame.showNodesOfCategory($(this).attr("key"), $(this).prop('checked'));
            });
            $(label)
                .appendTo($(span))
                .attr("for", "checkbox_" + key).text(map[key]);
        }
        toolbar.addTool(span);
    }
    _addThemeSelect(toolbar) {
        var select = document.createElement("select");
        $("<option></option>").val('DEFAULT').text("THEME_DEFAULT").appendTo($(select));
        $("<option></option>").val('BLACK').text("THEME_BLACK").appendTo($(select));
        var app = this;
        $(select).change(function () {
            var value = $(select).val();
            var func = theme_1.Themes[value];
            app._frame.updateTheme(func());
        });
        toolbar.addTool(select);
    }
}
exports.GraphNavigator = GraphNavigator;
