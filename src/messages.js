/**
 * Created by bluejoe on 2018/2/7.
 */

exports.setLanguage = setLanguage;
exports.getMessage = getMessage;

function setLanguage(language) {
	global.RESOURCE_BUNDLE = MESSAGES.hasOwnProperty(language) ?
		MESSAGES[language] : MESSAGES["default"];
}

function getMessage(msgCode) {
	var bundle = global.RESOURCE_BUNDLE === undefined ?
		MESSAGES["default"] : global.RESOURCE_BUNDLE;

	return bundle[msgCode];
}

//////////////////////////////////////////////////
var MESSAGES = {
	"default": MESSAGES_EN,
	"en": MESSAGES_EN,
}

var MESSAGES_EN = {
	"INITIALING": "initializing...",
}
