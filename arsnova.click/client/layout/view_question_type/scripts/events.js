
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {questionReflection} from '/lib/questions/question_reflection.js';
import * as localData from '/lib/local_storage.js';

Template.questionTypeView.events({
	"click .questionType": function (event) {
		const questionGroup = Session.get("questionGroup");
		const currentQuestion = questionGroup.getQuestionList()[Router.current().params.questionIndex].serialize();
		delete currentQuestion.type;
		questionGroup.addQuestion(questionReflection[event.currentTarget.id.replace("_questionType", "")](currentQuestion), parseInt(Router.current().params.questionIndex));
		Session.set("questionGroup", questionGroup);
		localData.addHashtag(questionGroup);
	}
});
