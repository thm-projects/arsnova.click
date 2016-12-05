
import {Template} from 'meteor/templating';

Template.quizManager.events({
	"click #added_questions_wrapper .draggable": function (event) {
		Router.go("/" + Router.current().params.quizName + "/quizManager/" + event.currentTarget.id.replace("_added_question", ""));
	}
});

Template.quizManagerDetails.events({
	"click #gotoQuestionText": function () {
		Router.go("/" + Router.current().params.quizName + "/question/" + Router.current().params.questionIndex);
	},
	"click #gotoAnswerOptionText": function () {
		Router.go("/" + Router.current().params.quizName + "/answeroptions/" + Router.current().params.questionIndex);
	},
	"click #gotoTimer": function () {
		Router.go("/" + Router.current().params.quizName + "/settimer/" + Router.current().params.questionIndex);
	},
	"click #gotoNicknames": function () {
		Router.go("/" + Router.current().params.quizName + "/nicknameCategories");
	},
});
