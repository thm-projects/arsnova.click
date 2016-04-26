import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { QuestionGroup } from '/lib/questions.js';

Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    questionText: function () {
        if(!EventManager.findOne()) {
            return;
        }
        var currentSession = QuestionGroup.findOne();
        return currentSession && currentSession.questionList[EventManager.findOne().questionIndex] ? currentSession.questionList[EventManager.findOne().questionIndex].questionText : "";
    }
});
