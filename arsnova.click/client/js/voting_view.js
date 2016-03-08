Template.votingview.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
    });
});

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find();
    },
    showForwardButton: function () {
        return true;
        return Session.get("showForwardButton");
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    }
});

Template.votingview.events({
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