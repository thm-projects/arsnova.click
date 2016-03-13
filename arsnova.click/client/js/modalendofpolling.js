Template.endOfPollingSplashscreen.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Responses.instructor', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('AnswerOptions.options', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('MemberList.members', Session.get("hashtag"));
        this.subscription = Meteor.subscribe('Sessions.question', Session.get("hashtag"));
    });
});

Template.endOfPollingSplashscreen.rendered = function () {
    var splashscreen = $('.js-splashscreen-end-of-polling');
    splashscreen.modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });
};



Template.endOfPollingSplashscreen.events({
    "click #js-btn-hideEndOfPollingModal": function () {
        $('.js-splashscreen-end-of-polling')
            .on('hidden.bs.modal', function() {
                Router.go('/results');
            })
            .modal('hide');
    }
});

Template.endOfPollingSplashscreen.helpers({
    isSurvey: function(){
        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return correctAnswerOptions === 0;
    },

    isSC: function(){
        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return correctAnswerOptions === 1;
    },

    isMC:function(){
        var correctAnswerOptions = AnswerOptions.find({hashtag: Session.get("hashtag"), isCorrect: 1}).count();
        return correctAnswerOptions > 1;
    },

    correct: function() {
        const correctAnswers = [];

        AnswerOptions.find({
            hashtag: Session.get("hashtag"),
            isCorrect: 1
        }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
            correctAnswers.push(answer.answerOptionNumber);
        });
        MemberList.findOne({hashtag: Session.get("hashtag"), nick: Session.get("nick")});

        var responseAmount = 0;
        var everythingRight = true;

        Responses.find({hashtag: Session.get("hashtag"), userNick: Session.get("nick")}).forEach(function (response) {
            if (!($.inArray(response.answerOptionNumber, correctAnswers) !== -1)) {
                everythingRight = false;
            }
            responseAmount++;
        });
        if (responseAmount) {
            if (everythingRight && responseAmount === correctAnswers.length) {
                return true;
            }
        }
        return false;
    }
});