
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';

Template.quizManager.events({
	"click #added_questions_wrapper .draggable": function (event) {
		Router.go("/" + Router.current().params.quizName + "/quizManager/" + event.currentTarget.id.replace("_added_question", ""));
	},
	"click #available_questions_wrapper .draggable": function (event) {
		const questionGroup = Session.get("questionGroup");
		const targetId = event.target.id.replace("_draggable", "");
		questionGroup.addDefaultQuestion(-1, targetId);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"click .removeQuestion": function (event) {
		event.stopPropagation();
		event.preventDefault();
		const questionGroup = Session.get("questionGroup");
		const targetId = event.currentTarget.id.replace("removeQuestion_", "");
		questionGroup.removeQuestion(targetId);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(Session.get("questionGroup"));
	}
});

Template.quizManagerDetails.events({
	"click #gotoQuestionType": function () {
		Router.go("/" + Router.current().params.quizName + "/questionType/" + Router.current().params.questionIndex);
	},
	"click #gotoQuestionText": function () {
		Router.go("/" + Router.current().params.quizName + "/question/" + Router.current().params.questionIndex);
	},
	"click #gotoAnswerOptionText": function () {
		Router.go("/" + Router.current().params.quizName + "/answeroptions/" + Router.current().params.questionIndex);
	},
	"click #gotoTimer": function () {
		Router.go("/" + Router.current().params.quizName + "/settimer/" + Router.current().params.questionIndex);
	}
});
