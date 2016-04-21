Template.createAnswerOptions.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}});
    },
    answerOptionLetter: function (Nr) {
        return String.fromCharCode(Nr + 65);
    },
    showDeleteButtonOnStart: function () {
        return (AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}).count() === 1) ? "hide" : "";
    }
});