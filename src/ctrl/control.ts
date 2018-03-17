import { Utils, Rect, Point } from "../utils";
import { GraphBrowser } from "../browser";
import { BrowserEventName } from '../types';
import { GraphService } from '../srv/service';
import { ShowInfoCtrl } from "./ShowInfoCtrl";
import { SearchCtrl } from "./SearchCtrl";
import { MessageBoxCtrl } from "./MessageBoxCtrl";
import { HighlightCtrl } from "./HighlightCtrl";
import { ExpansionCtrl } from "./ExpansionCtrl";

export interface Control {
    init(browser: GraphBrowser, network: vis.Network, service: GraphService);
}

export class Controls {
    public static ALL = {
        "ctrlShowInfo": new ShowInfoCtrl(),
        "ctrlSearch": new SearchCtrl(),
        "ctrlMessageBox": new MessageBoxCtrl(),
        "ctrlHighlight": new HighlightCtrl(),
        "ctrlExpansion": new ExpansionCtrl()
    };
}