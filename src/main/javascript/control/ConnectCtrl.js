"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Control_1 = require("./Control");
const local_1 = require("../service/local");
class ConnectCtrl extends Control_1.UIControl {
    onCreateUI(htmlContainer, args) {
        this._frame = args.mainFrame;
        this._dlgLoadGsonString = $('<div title="load GSON"><p>input a GSON<a href="https://github.com/bluejoe2008/InteractiveGraph#GSON"><span style="color:firebrick" class="fa fa-question-circle"></span></a> text:<br><textarea class="connect-gson-string"></textarea></p></div>').appendTo($(htmlContainer));
        this._dlgLoadGsonUrl = $('<div title="load GSON"><p>input remote GSON url:<br><input class="connect-gson-url"></p></div>').appendTo($(htmlContainer));
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
    }
    loadGsonString() {
        var frame = this._frame;
        this._dlgLoadGsonString.dialog({
            modal: true,
            resizable: false,
            height: "auto",
            width: 400,
            buttons: {
                "load": function () {
                    var dlg = $(this);
                    frame.connect(local_1.LocalGraph.fromGsonString("" + $("textarea", this).val()), () => {
                        dlg.dialog("close");
                    });
                }
            }
        });
    }
    loadGsonUrl() {
        var frame = this._frame;
        this._dlgLoadGsonUrl.dialog({
            modal: true,
            resizable: false,
            height: "auto",
            width: 400,
            buttons: {
                "load": function () {
                    var dlg = $(this);
                    frame.connect(local_1.LocalGraph.fromGsonFile($("input", this).val()), () => {
                        dlg.dialog("close");
                    });
                }
            }
        });
    }
    onResize(args) {
    }
}
exports.ConnectCtrl = ConnectCtrl;
