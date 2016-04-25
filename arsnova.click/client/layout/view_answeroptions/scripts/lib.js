import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { AnswerOptions } from '/lib/answeroptions.js';
import * as localData from '/client/lib/local_storage.js';

let hasError = false;
const updateAnswerText = function (error, result) {
    hasError = error;
    if (!error) {
        localData.updateAnswerText(result);
    }
};

export var subscriptionHandler = null;

export function parseAnswerOptionInput(index) {
    for (var i = 0; i < AnswerOptions.find({questionIndex: index}).count(); i++) {
        var text = $("#answerOptionText_Number" + i).val();
        var isCorrect = $('div#answerOption-' + i + ' .check-mark-checked').length > 0 ? 1 : 0;
        var answer = {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            questionIndex: index,
            answerOptionNumber: i,
            answerText: text,
            isCorrect: isCorrect
        };
        Meteor.call('AnswerOptions.updateAnswerTextAndIsCorrect', answer, updateAnswerText);
    }
    return hasError;
}