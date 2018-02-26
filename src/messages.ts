/**
 * Created by bluejoe on 2018/2/7.
 */

export class i18n {
	static RESOURCE_BUNDLE;

	public static setLanguage(language) {
		i18n.RESOURCE_BUNDLE = MESSAGES.hasOwnProperty(language) ?
			MESSAGES[language] : MESSAGES["default"];
	}

	public static getMessage(msgCode) {
		var bundle = i18n.RESOURCE_BUNDLE === undefined ?
			MESSAGES["default"] : i18n.RESOURCE_BUNDLE;

		return bundle[msgCode];
	}
}

//////////////////////////////////////////////////
var MESSAGES = {
	"default": MESSAGES_EN,
	"en": MESSAGES_EN,
}

var MESSAGES_EN = {
	"INITIALING": "initializing...",
}
