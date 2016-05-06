import {Template} from 'meteor/templating';

Template.translate.helpers({
	isBeta: function (language) {
		return $.inArray(language, [
			"fr",
			"es"
		]) > -1;
	}
});
