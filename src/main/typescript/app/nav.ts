import { CommunityCtrl } from '../control/CommunityCtrl';
import { ConnectCtrl } from '../control/ConnectCtrl';
import { HighlightCtrl } from '../control/HighlightCtrl';
import { InfoBoxCtrl } from '../control/InfoBoxCtrl';
import { SearchBoxCtrl } from '../control/SearchBoxCtrl';
import { ToolbarCtrl } from '../control/ToolbarCtrl';
import { MainFrame } from '../mainframe';
import {Theme, Themes} from "../theme";
import {
    CommunityData,
    EVENT_ARGS_FRAME,
    FrameEventName,
    EVENT_ARGS_GRAPH_LOADED,
    NETWORK_OPTIONS,
    EVENT_ARGS_RELFINDER, EVENT_ARGS_GRAPH_CONNECTED
} from "../types";
import { BaseApp } from './app';
import { StatusBarCtrl } from '../control/StatusBarCtrl';
import {Utils} from "../utils";
import {ResultListCtrl} from "../control/ResultListCtrl";
import {ImageUploadCtrl} from "../control/ImageUploadCtrl";


export class GraphNavigator extends BaseApp {
    private _searchBar: SearchBoxCtrl;
    private _infoBox: InfoBoxCtrl;
    private _statusBar: StatusBarCtrl;
    private _resultListCtrl: ResultListCtrl;
    private _imageBox: ImageUploadCtrl;

    public constructor(htmlFrame: HTMLElement, theme?: Theme) {
        super(htmlFrame, {
            showLabels: true,
            showTitles: true,
            showFaces: true,
            showDegrees: true,
            showEdges: true,
            showGroups: true
        },null,theme);
    }

    protected onCreateFrame(args: EVENT_ARGS_FRAME) {
        var frame = args.mainFrame;
        this._searchBar = frame.getRequiredControlLike(new SearchBoxCtrl());
        this._infoBox = frame.getRequiredControlLike(new InfoBoxCtrl());
        this._statusBar = frame.getRequiredControlLike(new StatusBarCtrl());
        this._resultListCtrl = frame.getRequiredControlLike(new ResultListCtrl());
        this._imageBox = frame.getRequiredControlLike(new ImageUploadCtrl());
        var connect = frame.addControl(new ConnectCtrl());
        var hilight = frame.addControl(new HighlightCtrl());
        var showCommunitiesCtrl = frame.addControl(new CommunityCtrl());
        var toolbar = frame.getRequiredControlLike(new ToolbarCtrl());
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
            icon: "fa fa-exchange",
            checked: true,
            tooltip: "toggle physics",
            click: (checked: boolean) => { app.togglePhysics(checked); }
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
            icon: "fa fa-terminal",
            checked: true,
            tooltip: "show status bar",
            click: (checked: boolean) => { app.toggleStatusBar(checked); }
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

        frame.on(FrameEventName.RESULTLISTPUT, (args:any) => {
            app._resultListCtrl.emit(FrameEventName.RESULTLISTPUT, args);
        })

        frame.on(FrameEventName.IMAGEBOXOPEN, (args:any) => {
            app._imageBox.emit(FrameEventName.IMAGEBOXOPEN, args);
        })
        //show graph while new graph loaded
        super.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_FRAME) => {
            frame.getGraphService().requestGetNodeCategories((map: object) => {
                app._addCategoriesSelect(toolbar, map);
                app._addCategoriesColorSelect(toolbar, map);
                hilight.clear();
                app._infoBox.hide();
                frame.getGraphService().requestGetCommunityData((data: CommunityData) => {
                    // showCommunitiesCtrl.bind(data);
                    app.showGraph({}, () => {
                    });
                })
            })
        });

        super.on(FrameEventName.GRAPH_CONNECTED, (args: EVENT_ARGS_GRAPH_CONNECTED) => {
            app._statusBar.showMessage("nodes: " + args.nodesNum + ", edges: " + args.edgesNum);
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

    private toggleStatusBar(checked: boolean) {
        if (checked) {
            this._statusBar.show();
        }
        else {
            this._statusBar.hide();
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
                    app.showNodesOfCategory($(this).attr("key"),
                        $(this).prop('checked'));
                });

            $(label)
                .appendTo($(span))
                .attr("for", "checkbox_" + key).text(map[key]);
        }

        toolbar.addTool(span);
    }

    private _addCategoriesColorSelect(toolbar: ToolbarCtrl, map: object){
        var app = this;
        var span = document.getElementById("categories-color-select");
        if (span != null)
            span.remove();

        span = document.createElement("span");
        $(span).attr("id", "categories-color-select");
        for (var key in map) {
            var select = document.createElement("input");
            var label = document.createElement("label");
            $(label)
                .appendTo($(span))
                .attr("for", "colorselect_" + key).text(map[key]);
            $(select).attr("id", "colorselect_" + key)
                .appendTo($(span))
                .attr("key", key)
                .attr("type", "color")
                .attr("value", "#ffffff")
                .change(function () {
                    let k = $(this).attr("key");
                    let c = $(this).prop('value');
                    console.log(k+"'s color changed to"+c);
                    app.updateNetworkOptions((o: NETWORK_OPTIONS)=>{
                        o.groups[k] = {color:c};
                        return o;
                    });
                });
        }
        toolbar.addTool(span);
    }

    private _addThemeSelect(toolbar: ToolbarCtrl) {
        var select = document.createElement("select");

        $("<option></option>").val('DEFAULT').text("THEME_DEFAULT").appendTo($(select));
        $("<option></option>").val('BLACK').text("THEME_BLACK").appendTo($(select));
        $("<option></option>").val('LIGHT').text("THEME_LIGHT").appendTo($(select));
        var app = this;
        $(select).change(function () {
            var value = <string>$(select).val();
            var func = Themes[value];
            app.updateTheme(func());
        });

        toolbar.addTool(select);
    }
}