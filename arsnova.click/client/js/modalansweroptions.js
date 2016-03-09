Template.answerOptionsSplash.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
    });
});

Template.answerOptionsSplash.helpers({
    answerOptions: function () {
        answerOptions = AnswerOptions.find({hashtag: Session.get("hashtag")});
        return answerOptions;
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number + 65));
    }
});

Template.answerOptionsSplash.events({
    "click #js-btn-hideAnswerModal": function () {
        closeSplashscreen();
    }
});