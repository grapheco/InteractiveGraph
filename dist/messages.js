/**
 * Created by bluejoe on 2018/2/7.
 */
class i18n {
    static setLanguage(language) {
        i18n.RESOURCE_BUNDLE = MESSAGES.hasOwnProperty(language) ?
            MESSAGES[language] : MESSAGES["default"];
    }
    static getMessage(msgCode) {
        var bundle = i18n.RESOURCE_BUNDLE === undefined ?
            MESSAGES["default"] : i18n.RESOURCE_BUNDLE;
        return bundle[msgCode];
    }
}
exports.i18n = i18n;
//////////////////////////////////////////////////
var MESSAGES = {
    "default": MESSAGES_EN,
    "en": MESSAGES_EN,
};
var MESSAGES_EN = {
    "INITIALING": "initializing...",
};
