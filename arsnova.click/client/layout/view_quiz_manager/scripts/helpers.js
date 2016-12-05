
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import * as questionLib from '/client/layout/view_questions/scripts/lib.js';

Template.quizManager.helpers({
	questionTypes: function () {
		return questionLib.getQuestionTypes();
	},
	isMovingQuestion: function () {
		return Session.get("isMovingQuestion");
	}
});

Template.quizManagerDetails.helpers({
	getQuestionIndex: function () {
		return Router.current().params.questionIndex;
	}
});
