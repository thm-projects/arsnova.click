Template.createQuestionView.helpers({
    //Get question from Sessions-Collection if it already exists
    questionText: function () {
        if(!EventManager.findOne()) {
            return;
        }
        var currentSession = QuestionGroup.findOne();
        return currentSession && currentSession.questionList[EventManager.findOne().questionIndex] ? currentSession.questionList[EventManager.findOne().questionIndex].questionText : "";
    },
    isFormattingEnabled: function () {
        return $('#markdownBarDiv').hasClass('hide');
    }
});