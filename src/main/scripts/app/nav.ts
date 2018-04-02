import { MainFrame } from '../framework';
import { BaseApp } from './app';
import { Themes, Theme } from "../theme";
import { MessageBoxCtrl } from '../control/MessageBoxCtrl';
import { SearchBarCtrl } from '../control/SearchBarCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import { ShowGraphOptions, NodeNEdgeSets, FrameEventName, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_INPUT } from "../types";
import { Connector } from '../connector/connector';
import { HighlightNodeCtrl } from '../control/HighlightNodeCtrl';

export class GraphNavigator extends BaseApp {
    public constructor(htmlFrame: HTMLElement) {
        super(htmlFrame, {
            showGraphOptions: {
                showLabels: true,
                showTitles: true,
                showFaces: true,
                showDegrees: true,
                showEdges: true,
                showGroups: true
            }
        });
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.frame;
        frame.addControl("search", new SearchBarCtrl());
        frame.addControl("info", new InfoBoxCtrl());
        frame.addControl("hilight", new HighlightNodeCtrl());

        var toolbar = <ToolbarCtrl>frame.addControl("toolbar", new ToolbarCtrl());
        var app = this;

        toolbar.addButton({
            icon: "fa fa-user-circle-o",
            checked: true,
            tooltip: "show faces",
            click: (checked: boolean) => { app.toggleFaces(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-gavel",
            checked: true,
            tooltip: "show degrees",
            click: (checked: boolean) => { app.toggleWeights(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-share-alt",
            checked: true,
            tooltip: "show edges",
            click: (checked: boolean) => { app.toggleEdges(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-strikethrough",
            checked: false,
            tooltip: "always show edge's label",
            click: (checked: boolean) => { app.toggleShowEdgeLabelAlways(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-circle-o",
            checked: false,
            tooltip: "show border",
            click: (checked: boolean) => { app.toggleNodeBorder(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-transgender-alt",
            checked: false,
            tooltip: "show edge color",
            click: (checked: boolean) => { app.toggleEdgeColor(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-clone",
            checked: false,
            tooltip: "show shadow",
            click: (checked: boolean) => { app.toggleShadow(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-arrows",
            checked: true,
            tooltip: "show navigation buttons",
            click: (checked: boolean) => { app.toggleNavigationButtons(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-search",
            checked: true,
            tooltip: "show search bar",
            click: (checked: boolean) => { app.toggleSearchBar(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-info-circle",
            checked: true,
            tooltip: "show info",
            click: (checked: boolean) => { app.toggleInfoBox(checked); }
        });

        this.addScaleSlider(toolbar, frame);
        this._addThemeSelect(toolbar);
        this._framework.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_FRAME) => {
            app._addCategoriesSelect(toolbar, args.connector);
        });

        this.toggleShowEdgeLabelAlways(false);
    }

    private addScaleSlider(toolbar: ToolbarCtrl, frame: MainFrame) {
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

    private toggleInfoBox(checked: boolean) {
        if (checked) {
            this._framework.addControl("info", new InfoBoxCtrl());
        }
        else {
            this._framework.removeControl("info");
        }
    }

    private toggleSearchBar(checked: boolean) {
        if (checked) {
            this._framework.addControl("search", new SearchBarCtrl());
        }
        else {
            this._framework.removeControl("search");
        }
    }

    private _addCategoriesSelect(toolbar: ToolbarCtrl, connector: Connector) {
        var app = this;
        var map = this._framework.getNodeCategories();
        var span = document.createElement("span");
        for (var key in map) {
            var check = document.createElement("input");
            var label = document.createElement("label");

            $(check).attr("id", "checkbox_" + key)
                .appendTo($(span))
                .attr("key", key)
                .attr("type", "checkbox")
                .attr("checked", "true")
                .click(function () {
                    app._framework.showNodesOfCategory($(this).attr("key"),
                        $(this).prop('checked'));
                });

            $(label)
                .appendTo($(span))
                .attr("for", "checkbox_" + key).text(map[key]);
        }

        toolbar.addTool(span);
    }

    private _addThemeSelect(toolbar: ToolbarCtrl) {
        var select = document.createElement("select");

        $("<option></option>").val('DEFAULT').text("THEME_DEFAULT").appendTo($(select));
        $("<option></option>").val('BLACK').text("THEME_BLACK").appendTo($(select));
        var app = this;
        $(select).change(function () {
            var value = <string>$(select).val();
            var func = Themes[value];
            app._framework.updateTheme(func());
        });

        toolbar.addTool(select);
    }
}