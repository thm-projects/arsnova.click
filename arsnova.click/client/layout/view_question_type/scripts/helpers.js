
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';

Template.questionTypeView.helpers({
	currentQuestionType: function () {
		if (!Session.get("questionGroup")) {
			return;
		}
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].translationReferrer();
	},
	questionTypes: function () {
		return questionLib.getQuestionTypes();
	}
});
