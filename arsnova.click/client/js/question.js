Template.questionT.onCreated(function () {
    this.autorun(() = > {
        this.subscribe('AnswerOptions.options', Session.get("hashtag"));
    this.subscribe('Sessions.question', Session.get("hashtag"));
});
})
;

Template.questionT.helpers({
    answ: function () {
        const answers = AnswerOptions.find({hashtag: Session.get("hashtag")});
        if (!answers) {
            return "";
        }
        return answers;
    },
    quest: function () {
        const question = Sessions.findOne({hashtag: Session.get("hashtag")});
        if (!question) {
            return "";
        }
        return question.questionText;
    }
});
