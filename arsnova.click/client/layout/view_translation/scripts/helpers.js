import {Template} from 'meteor/templating';

Template.translate.helpers({
	isBeta: function (languageTag) {
		return $.inArray(languageTag, [
			"fr",
			"es"
		]) > -1;
	}
});
