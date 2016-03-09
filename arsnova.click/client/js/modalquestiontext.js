Template.questionContentSplash.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Sessions.question', Session.get("hashtag"));
    });
});

Template.questionContentSplash.helpers({
    questionText: function () {
        var sessionDoc = Sessions.findOne();
        if (sessionDoc) {
            return Sessions.findOne().questionText;
        }
        else {
            return "";
        }
    }
});