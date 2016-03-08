var countdown = null;
Template.votingview.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
        this.subscribe('Sessions.question', Session.get("hashtag"));
    });
    if (Sessions) {
        countdown = new ReactiveCountdown(Sessions.findOne().timer);
        countdown.start(function () {
            Router.go("/results");
        });
    }
});

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find();
    },
    showForwardButton: function () {
        return Session.get("showForwardButton");
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (countdown) {
            return countdown.get() + "seconds left!";
        }
    }

});

Template.votingview.events({
    "click #js-btn-showQuestionModal": function () {
        showSplashscreen();
    },
    "click .sendResponse": function (event) {
        Meteor.call('Responses.addResponse', {
            hashtag: Session.get("hashtag"),
            answerOptionNumber: event.target.id,
            userNick: Session.get("nick")
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                console.log(res);
                if (!res.isCorrect || (res.questionType == "sc")) {
                    console.log("hiergehtsnichtweiter");
                    //TODO Route to responsestatistics
                    //Router.go("/")
                } else {
                    if (Session.get("responseCount") === 1) {
                        Session.set("responseCount", Session.get("responseCount") + 1);
                        Session.set("showForwardButton", 1);
                    } else {
                        Session.set("responseCount", 1);
                    }
                }
            }
        });
    }
});

Template.questionContentSplash.helpers({
    questionContent: function () {
        mySessions = Sessions.find();
        return mySessions;
    }
});

Template.questionContentSplash.events({
    "click #js-btn-hideQuestionModal": function () {
        closeSplashscreen();
    }
});

