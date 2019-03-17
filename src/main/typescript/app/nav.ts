import { CommunityCtrl } from '../control/CommunityCtrl';
import { ConnectCtrl } from '../control/ConnectCtrl';
import { HighlightCtrl } from '../control/HighlightNodeCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { SearchBarCtrl } from '../control/SearchBarCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import { MainFrame } from '../mainframe';
import { Themes } from "../theme";
import { CommunityData, EVENT_ARGS_FRAME, FrameEventName } from "../types";
import { BaseApp } from './app';
import { nextTick } from 'async';

export class GraphNavigator extends BaseApp {
    private _searchBar: SearchBarCtrl;
    private _infoBox: InfoBoxCtrl;

    public constructor(htmlFrame: HTMLElement) {
        super(htmlFrame, {
            showLabels: true,
            showTitles: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        });
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        this._searchBar = frame.addControl("search", new SearchBarCtrl());
        this._infoBox = frame.addControl("info", new InfoBoxCtrl());
        var connect = frame.addControl("connect", new ConnectCtrl());
        var hilight = frame.addControl("hilight", new HighlightCtrl());
        var showCommunitiesCtrl = frame.addControl("hilight", new CommunityCtrl());
        var toolbar = frame.addControl("toolbar", new ToolbarCtrl());
        var app = this;

        toolbar.addButton({
            icon: "fa fa-user-circle-o",
            checked: true,
            tooltip: "show faces",
            click: (checked: boolean) => { app.toggleFaces(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-sliders",
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
            icon: "fa fa-anchor",
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

        toolbar.addButton({
            icon: "fa fa-expand",
            checked: true,
            tooltip: "undraggable/draggable",
            click: (checked: boolean) => { app.toggleDraggable(checked); }
        });

        toolbar.addButton({
            icon: "fa fa-cloud",
            checked: true,
            tooltip: "show communities/hide communities",
            click: (checked: boolean) => { 
                showCommunitiesCtrl.toggle(checked);
                frame.redraw();
            }
        });

        toolbar.addButton({
            icon: "fa fa-file-code-o",
            tooltip: "load GSON string",
            click: (checked: boolean) => { connect.loadGsonString(); }
        });

        toolbar.addButton({
            icon: "fa fa-folder-open-o",
            tooltip: "load remote GSON",
            click: (checked: boolean) => { connect.loadGsonUrl(); }
        });

        toolbar.addButton({
            icon: "fa fa-universal-access",
            tooltip: "connect remote IGP server",
            click: (checked: boolean) => { connect.loadRemoteServer(); }
        });

        this.addScaleSlider(toolbar, frame);
        this._addThemeSelect(toolbar);

        //show graph while new graph loaded
        this._frame.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_FRAME) => {
            this._frame.getGraphService().requestGetNodeCategories((map: object) => {
                app._addCategoriesSelect(toolbar, map);
                hilight.clear();
                args.mainFrame.getGraphService().requestGetCommunityData((data: CommunityData) => {
                    showCommunitiesCtrl.bind(data);
                    app.showGraph({}, () => {
                    });
                })
            })
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
            this._infoBox.enable();
        }
        else {
            this._infoBox.disable();
        }
    }

    private toggleSearchBar(checked: boolean) {
        if (checked) {
            this._searchBar.show();
        }
        else {
            this._searchBar.hide();
        }
    }

    private _addCategoriesSelect(toolbar: ToolbarCtrl, map: object) {
        var app = this;
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
                    app._frame.showNodesOfCategory($(this).attr("key"),
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
            app._frame.updateTheme(func());
        });

        toolbar.addTool(select);
    }
}