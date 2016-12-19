
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Router} from 'meteor/iron:router';
import {questionReflection} from '/lib/questions/question_reflection.js';
import * as localData from '/lib/local_storage.js';

Template.questionTypeView.events({
	"click .questionType": function (event) {
		const questionGroup = Session.get("questionGroup");
		const currentQuestion = questionGroup.getQuestionList()[Router.current().params.questionIndex].serialize();
		const index = parseInt(Router.current().params.questionIndex);
		delete currentQuestion.type;
		questionGroup.removeQuestion(index);
		questionGroup.addQuestion(questionReflection[event.currentTarget.id.replace("_questionType", "")](currentQuestion), index);
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
	}
});
