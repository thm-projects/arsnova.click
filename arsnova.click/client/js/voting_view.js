var countdown = null;
Template.votingview.onCreated(function () {
    this.autorun(() => {
        this.subscribe('AnswerOptions.public', Session.get("hashtag"));
        this.subscribe('Sessions.question', Session.get("hashtag"), function () {
            countdown = new ReactiveCountdown(Sessions.findOne().timer / 1000);
            countdown.start(function () {
                // show feedback splashscreen?
                $("#end-of-polling-text").html("Abstimmung gelaufen!");
                $('.js-splashscreen-end-of-polling').modal('show');
            });
            Session.set("countdownInitialized", true);
        });
    });

    $(window).resize(function () {
        formatAnswerButtons();
    });
});

Template.votingview.rendered = function () {
    formatAnswerButtons();
};

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
        $('.questionContentSplash').parents('.modal').modal();
    },
    "click #js-showAnswerTexts": function () {
        $('.answerTextSplash').parents('.modal').modal();
    },
    "click #forwardButton": function () {
        Session.set("showForwardButton", undefined);
        Session.set("countdownInitialized", undefined);
        Session.set("hasGivenResponse", undefined);
        $('.js-splashscreen-end-of-polling').modal('show');
    },
    "click .sendResponse": function (event) {
        Meteor.call('Responses.addResponse', {
            hashtag: Session.get("hashtag"),
            answerOptionNumber: Number(event.target.id),
            userNick: Session.get("nick")
        }, (err, res) => {
            if (err) {
            alert(err);
        } else {
            if (res) {
                $(event.target).attr("disabled", "disabled");
                $(event.target).addClass("answer-selected");
                if (res.instantRouting) {
                    // singlechoice
                        $('.js-splashscreen-end-of-polling').modal('show');
                        Session.set("hasGivenResponse", undefined);
                        Session.set("countdownInitialized", undefined);
                    } else {
                        Session.set("hasGivenResponse", true);
                    }
                }
            }

        });

    }
    // submit button onclick -> feedback splashscreen + redirect
});

function calculateAnswerRowHeight () {
    return $(window).height() - $('.header-title').height() - $('#appTitle').height() - $('.voting-helper-buttons').height() - $('.navbar-fixed-bottom').height() - 15;
}

function formatAnswerButtons () {
    var answerRow = $('.answer-row');
    var answerButtonContainerHeight = calculateAnswerRowHeight();
    answerRow.css('height', answerButtonContainerHeight + 'px');

    var answerOptionsCount = answerRow.children().length;
    if (answerOptionsCount == 0) {
        setTimeout(function () {
            formatAnswerButtons();
        }, 100);
        return;
    }

    var buttonHeight = 0;
    answerRow.children().removeClass('col-xs-12').removeClass('col-xs-6').removeClass('col-xs-4');

    if (answerOptionsCount <= 3) {
        answerButtonContainerHeight -= answerOptionsCount * 30;
        answerRow.children().addClass('col-xs-12');
        buttonHeight = answerButtonContainerHeight / answerOptionsCount;
    } else if (answerOptionsCount <= 6) {
        answerButtonContainerHeight -= Math.ceil((answerOptionsCount / 2)) * 30;
        answerRow.children().addClass('col-xs-6');
        buttonHeight = answerButtonContainerHeight / (Math.ceil(answerOptionsCount / 2));
    } else {
        answerButtonContainerHeight -= Math.ceil((answerOptionsCount / 3)) * 30;
        answerRow.children().addClass('col-xs-4');
        buttonHeight = answerButtonContainerHeight / (Math.ceil(answerOptionsCount / 3));
    }

    answerRow.find('button').css('height', buttonHeight + 'px');
}