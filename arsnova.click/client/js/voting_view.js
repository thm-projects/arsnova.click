var countdown = null;
Template.votingview.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
        this.subscribe('Sessions.question', Session.get("hashtag"), function () {
            countdown = new ReactiveCountdown(Sessions.findOne().timer / 1000);
            countdown.start(function () {
                // show feedback splashscreen?
                Router.go("/results");
            });
            Session.set("countdownInitialized", true);
        });
    });
});

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find({}, {sort:{answerOptionNumber: 1}});
    },
    showForwardButton: function () {
        return Session.get("hasGivenResponse");
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            return countdown.get() + " Sekunden übrig!";
        }
    }
});

Template.votingview.events({
    "click #js-btn-showQuestionModal": function () {
        showSplashscreen();
    },
    "click #forwardButton": function () {
        Session.set("showForwardButton", undefined);
        Session.set("countdownInitialized", undefined)
        Router.go("/results");
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
                if (res.instantRouting) {
                    // show feedback splashscreen
                    Router.go("/results");
                }
                else {
                    Session.set("hasGivenResponse", true);
                }
            }
        });
    }
});

Template.questionContentSplash.helpers({
    questionContent: function () {
        mySessions = Sessions.find();
        console.log(mySessions.fetch());
        return mySessions;
    }
});

Template.questionContentSplash.events({
    "click #js-btn-hideQuestionModal": function () {
        closeSplashscreen();
    }
});

