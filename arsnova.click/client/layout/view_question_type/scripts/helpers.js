
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';

Template.questionTypeView.helpers({
	currentQuestionType: function () {
		return Session.get("questionGroup").getQuestionList()[Router.current().params.questionIndex].translationReferrer()
	},
	questionTypes: function () {
		return questionLib.getQuestionTypes();
	}
})
