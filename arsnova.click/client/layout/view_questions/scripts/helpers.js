import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { QuestionGroup } from '/lib/questions.js';

Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    questionText: function () {
        if(!EventManager.findOne()) {
            return;
        }
        var questionDoc = QuestionGroup.findOne();
        if(questionDoc && questionDoc.questionList[EventManager.findOne().questionIndex]) {
            return questionDoc.questionList[EventManager.findOne().questionIndex].questionText;
        }
    },
    isFormattingEnabled: function () {
        return $('#markdownBarDiv').hasClass('hide');
    }
});