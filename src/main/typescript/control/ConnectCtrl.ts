import { Utils, Rect, Point } from "../utils";
import { MainFrame } from "../mainframe";
import { FrameEventName, EVENT_ARGS_FRAME, EVENT_ARGS_FRAME_DRAWING, EVENT_ARGS_FRAME_INPUT } from '../types';
import { GraphService } from '../service/service';
import { i18n } from "../messages";
import { Control, UIControl } from "./Control";
import { LocalGraph } from "../service/local";
import { RemoteGraph } from "../service/remote";

export class ConnectCtrl extends UIControl {
    private _frame: MainFrame;
    private _dlgLoadGsonString: JQuery;
    private _dlgLoadGsonUrl: JQuery;
    private _dlgLoadRemoteSever: JQuery;

    public onCreateUI(htmlContainer: HTMLElement, args: EVENT_ARGS_FRAME) {
        this._frame = args.mainFrame;

        this._dlgLoadGsonString = $('<div title="load GSON"><p>input a GSON<a href="https://github.com/bluejoe2008/InteractiveGraph#GSON" target="_blank"><span style="color:firebrick" class="fa fa-question-circle"></span></a> text:<br><textarea class="connect-gson-string"></textarea></p></div>').appendTo($(htmlContainer));

        this._dlgLoadGsonUrl = $('<div title="load GSON"><p>input remote GSON url:<br><input class="connect-gson-url"></p></div>').appendTo($(htmlContainer));

        this._dlgLoadRemoteSever = $('<div title="connect remote server"><p>input remote IGP<a href="https://github.com/bluejoe2008/InteractiveGraph#IGP" target="_blank"><span style="color:firebrick" class="fa fa-question-circle"></span></a> server url:<br><input class="connect-gson-url"></p></div>').appendTo($(htmlContainer));

        super.hide();

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

        var input = $("input", this._dlgLoadGsonUrl);
        $("<a href='#'>WorldCup2014.json</a>").click(() => {
            $(input).val("WorldCup2014.json");
        }).appendTo($(this._dlgLoadGsonUrl));

        var input2 = $("input", this._dlgLoadRemoteSever);
        $("<a href='#'>example server</a>").click(() => {
            $(input2).val("http://localhost:9999/graphserver/connector");
        }).appendTo($(this._dlgLoadRemoteSever));
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

    public loadRemoteServer() {
        var frame = this._frame;
        this._dlgLoadRemoteSever.dialog({
            modal: true,
            resizable: false,
            height: "auto",
            width: 400,
            buttons: {
                "load": function () {
                    var dlg = $(this);
                    frame.connect(new RemoteGraph(<string>$("input", this).val()), () => {
                        dlg.dialog("close");
                    });
                }
            }
        });
    }

    public onResize(args: EVENT_ARGS_FRAME) {

    }
}