export var subscriptionHandler = null;

export function parseAnswerOptionInput(index) {
    var hasError = false;

    var meteorAnswerOptionsUpdateCall = function (err) {
        hasError = err;
    };

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
        Meteor.call('AnswerOptions.updateAnswerTextAndIsCorrect', answer, meteorAnswerOptionsUpdateCall);
    }
    return hasError;
}