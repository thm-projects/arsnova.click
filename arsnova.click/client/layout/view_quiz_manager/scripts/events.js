
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';

Template.quizManager.events({
	"click #added_questions_wrapper .draggable": function (event) {
		Router.go("/" + Router.current().params.quizName + "/quizManager/" + event.currentTarget.id.replace("_added_question", ""));
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
