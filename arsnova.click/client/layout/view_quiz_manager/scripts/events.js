
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import * as localData from '/lib/local_storage.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';

Template.quizManager.events({
	"click #available_questions_wrapper .draggable": function (event) {
		const questionGroup = Session.get("questionGroup");
		const targetId = event.target.id.replace("_draggable", "");
		questionGroup.addDefaultQuestion(-1, targetId);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(Session.get("questionGroup"));
	},
	"click #added_questions_wrapper .draggable, mouseover #added_questions_wrapper .draggable": function (event) {
		$('#added_questions_wrapper').find(".draggable").removeClass("displayContextMenu");
		$(event.currentTarget).addClass("displayContextMenu");
	},
	"mouseleave #added_questions_wrapper .draggable": function () {
		$('#added_questions_wrapper').find(".draggable").removeClass("displayContextMenu");
	},
	"click .moveQuestionUp": function (event) {
		event.stopPropagation();
		event.preventDefault();
		const questionGroup = Session.get("questionGroup");
		const indexFrom = parseInt($(event.currentTarget).parents(".draggable").attr("id").replace("_added_question", ""));
		if (indexFrom > 0) {
			const question = questionGroup.getQuestionList()[indexFrom];
			questionGroup.removeQuestion(indexFrom);
			questionGroup.addQuestion(question, indexFrom - 1);
			Session.set("questionGroup", questionGroup);
			localData.addHashtag(Session.get("questionGroup"));
		}
	},
	"click .moveQuestionDown": function (event) {
		event.stopPropagation();
		event.preventDefault();
		const questionGroup = Session.get("questionGroup");
		const indexFrom = parseInt($(event.currentTarget).parents(".draggable").attr("id").replace("_added_question", ""));
		if (indexFrom < questionGroup.getQuestionList().length - 1) {
			const question = questionGroup.getQuestionList()[indexFrom];
			questionGroup.removeQuestion(indexFrom);
			questionGroup.addQuestion(question, indexFrom + 1);
			Session.set("questionGroup", questionGroup);
			localData.addHashtag(Session.get("questionGroup"));
		}
	},
	"click .editQuestion": function (event) {
		Router.go("/" + Router.current().params.quizName + "/quizManager/" + $(event.currentTarget).parents(".draggable").attr("id").replace("_added_question", ""));
	},
	"click .removeQuestion": function (event) {
		event.stopPropagation();
		event.preventDefault();
		new Splashscreen({
			autostart: true,
			templateName: "removeQuestionConfirmationSplashscreen",
			closeOnButton: '#closeDialogButton, #removeQuestion, .splashscreen-container-close>.glyphicon-remove',
			onRendered: function (template) {
				template.templateSelector.find("#removeQuestion").on("click", function () {
					const questionGroup = Session.get("questionGroup");
					const targetId = parseInt($(event.currentTarget).parents(".draggable").attr("id").replace("_added_question", ""));
					questionGroup.removeQuestion(targetId);
					Session.set("questionGroup", questionGroup);
					localData.addHashtag(Session.get("questionGroup"));
				});
			}
		});
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
