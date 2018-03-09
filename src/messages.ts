/**
 * Created by bluejoe on 2018/2/7.
 */

export class i18n {
	static RESOURCE_BUNDLE;

	static MESSAGES_EN = {
		"INITIALING": "initializing...",
		"LOADING_GRAPH": "loading graph...",
	}

	static MESSAGES = {
		"default": i18n.MESSAGES_EN,
		"en": i18n.MESSAGES_EN,
	}

	public static setLanguage(language) {
		i18n.RESOURCE_BUNDLE = i18n.MESSAGES.hasOwnProperty(language) ?
			i18n.MESSAGES[language] : i18n.MESSAGES["default"];
	}

	public static getMessage(msgCode) {
		var bundle = i18n.RESOURCE_BUNDLE === undefined ?
			i18n.MESSAGES["default"] : i18n.RESOURCE_BUNDLE;

		return bundle[msgCode];
	}
}

//////////////////////////////////////////////////

