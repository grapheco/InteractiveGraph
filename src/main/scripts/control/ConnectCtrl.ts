import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../framework";
import { FrameEventName, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_DRAWING, EVENT_ARGS_FRAME_INPUT } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";
import { LocalGraph } from "../service/local";

export class ConnectCtrl extends UIControl {
    private _frame: MainFrame;
    private _dlgLoadGsonString: JQuery;
    private _dlgLoadGsonUrl: JQuery;

    public onCreate(args: EVENT_ARGS_FRAME) {
        this._frame = args.frame;
        this._htmlContainer = document.createElement("div");
        $(this._htmlContainer).appendTo($(args.htmlMainFrame));
        this._dlgLoadGsonString = $('<div title="load GSON"><p>input a GSON text:<br><textarea class="connect-gson-string"></textarea></p></div>').appendTo($(this._htmlContainer));

        this._dlgLoadGsonUrl = $('<div title="load GSON"><p>input remote GSON url:<br><input class="connect-gson-url"></p></div>').appendTo($(this._htmlContainer));

        var gson = {
            data: {
                nodes: [
                    {
                        id: "1", "label": "bluejoe", "image": "https://bluejoe2008.github.io/bluejoe3.png", "categories": [
                            "person"
                        ],
                    },

                    {
                        id: "2", "label": "CNIC", "image": "https://bluejoe2008.github.io/cas.jpg", "categories": [
                            "organization"
                        ],
                    },
                    {
                        id: "3", "label": "beijing", "image": "https://bluejoe2008.github.io/beijing.jpg", "categories": [
                            "location"
                        ],
                    },
                ],
                edges: [
                    { from: "1", to: "2", label: "work for" },
                    { from: "1", to: "3", label: "live in" }
                ]
            }
        };

        $("textarea", this._dlgLoadGsonString).val(JSON.stringify(gson));
        $("input", this._dlgLoadGsonUrl).val(window.location.href);
    }

    public loadGsonString() {
        var frame = this._frame;
        this._dlgLoadGsonString.dialog({
            modal: true,
            resizable: false,
            height: "auto",
            width: 400,
            buttons: {
                "load": function () {
                    var dlg = $(this);
                    frame.connect(LocalGraph.fromGsonString("" + $("textarea", this).val()), () => {
                        dlg.dialog("close");
                    });
                }
            }
        });
    }

    public loadGsonUrl() {
        var frame = this._frame;
        this._dlgLoadGsonUrl.dialog({
            modal: true,
            resizable: false,
            height: "auto",
            width: 400,
            buttons: {
                "load": function () {
                    var dlg = $(this);
                    frame.connect(LocalGraph.fromGsonFile($("input", this).val()), () => {
                        dlg.dialog("close");
                    });
                }
            }
        });
    }

    public onResize(args: EVENT_ARGS_FRAME) {

    }
}