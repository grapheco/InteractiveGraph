"use strict";
/**
 * Created by bluejoe on 2018/2/7.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class i18n {
    static setLanguage(language) {
        i18n.RESOURCE_BUNDLE = i18n.MESSAGES.hasOwnProperty(language) ?
            i18n.MESSAGES[language] : i18n.MESSAGES["default"];
    }
    static getMessage(msgCode) {
        var bundle = i18n.RESOURCE_BUNDLE === undefined ?
            i18n.MESSAGES["default"] : i18n.RESOURCE_BUNDLE;
        return bundle[msgCode];
    }
}
i18n.MESSAGES_EN = {
    "INITIALING": "initializing...",
    "LOADING_GRAPH": "loading graph...",
};
i18n.MESSAGES = {
    "default": i18n.MESSAGES_EN,
    "en": i18n.MESSAGES_EN,
};
exports.i18n = i18n;
//////////////////////////////////////////////////
