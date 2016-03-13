Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"), function () {
        $(window).resize(function () {
            var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
            $(".container").css("height", final_height + "px");
            Session.set("LearnerCountOverride", false);
            calculateButtonCount();
            calculateProgressBarTextWidth();
        });
        });
        if(Session.get("isOwner")) {
            this.subscribe('MemberList.percentRead', {
                hashtag: Session.get("hashtag"),
                privateKey: localData.getPrivateKey()
            });
        }
        this.subscribe('Sessions.memberlist', Session.get("hashtag"));
    });

    Tracker.autorun(function() {
        var initializing = true;
        Sessions.find().observeChanges({
            changed: function (oldDoc, newDoc) {
                if (!initializing) {
                    if (newDoc.startTime && (oldDoc.startTime != newDoc.startTime)) {
                        Router.go("onpolling");
                    }
                }
            }
        });
        MemberList.find().observeChanges({
            added: function (id, newDoc) {
                calculateButtonCount();
                calculateProgressBarTextWidth();
            }
        });
        initializing = false;
    });
});

Template.memberlist.rendered = function () {
    var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
    $(".container").css("height", final_height + "px");
    Session.set("LearnerCountOverride", false);
    calculateButtonCount();
    calculateProgressBarTextWidth();
};

Template.memberlist.events({
    "click .btn-more-learners": function (event) {
        Session.set("LearnerCount", MemberList.find().count());
        Session.set("LearnerCountOverride", true);
    },
    'click #setReadConfirmed': function () {
        closeSplashscreen();
        calculateProgressBarTextWidth();
    },
    'click .btn-less-learners': function () {
        Session.set("LearnerCountOverride", false);
        calculateButtonCount();
    },    
    'click #startPolling': function (event) {
        Meteor.call('Hashtags.setSessionStatus', localData.getPrivateKey(), Session.get("hashtag"), 3);
        Meteor.call('Sessions.startTimer', {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag")
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                //Router.go("/onpolling");
            }
        });
    },
    'click #backButton':function(event){
        Meteor.call("Hashtags.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 1);
        Router.go("/readconfirmationrequired");
    }
});

Template.memberlist.helpers({
    hashtag: function () {
        return Session.get("hashtag");
    },
    isOwner: function () {
        return Session.get("isOwner");
    },
    isLearnerCountOverride: function () {
        return Session.get('LearnerCountOverride');
    },
    learners: function () {
        var sortParamObj;
        if (Session.get('LearnerCountOverride')) {
            sortParamObj = {lowerCaseNick: 1};
        } else {
            sortParamObj = {insertDate: -1};
        }
        return [
            MemberList.find({nick:Session.get("nick")}, {
                limit: 1
            }),
            MemberList.find({nick: {$ne: Session.get("nick")}}, {
                limit: (Session.get("LearnerCount") - 1),
                sort: sortParamObj
            })
        ];
    },

    showMoreButton: function () {
        return ((MemberList.find().count() - Session.get("LearnerCount")) > 1);
    },

    invisibleLearnerCount: function () {
        return MemberList.find().count() - Session.get("LearnerCount");
    },

    isReadingConfirmationRequired: function () {
        const doc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if(!doc){
            return;
        }
        return doc.isReadingConfirmationRequired == 1;
    },
    isNotOwnerAndReadConfirmationNeeded: function () {
        const doc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if(!doc){
            return;
        }
        return !Session.get("isOwner") && (doc.isReadingConfirmationRequired == 1);
    }
});

Template.learner.onRendered(function () {
    calculateButtonCount();
});

Template.learner.helpers({
    isOwnNick: function (nickname) {
        return nickname === Session.get("nick");
    }
});

Template.readingConfirmation.onRendered(function () {
    calculateProgressBarTextWidth();
});

Template.readingConfirmation.helpers({
    percentRead: function () {
        calculateProgressBarTextWidth();
        return getPercentRead();
    }
});

function calculateButtonCount () {

    /*
    This session variable determines if the user has clicked on the show-more-button. The button count must not
    be calculated then. It is set in the event handler of the button and is reset if the user reenters the page
     */
    if (Session.get("LearnerCountOverride")) return;

    /*
    To calculate the maximum output of attendee button rows we need to:
    - get the contentPosition height (the content wrapper for all elements)
    - subtract the confirmationCounter height (the progress bar)
    - subtract the attendee-in-quiz-wrapper height (the session information for the attendees)
    - subtract the margin to the top (the title or the show more button)
     */
    var viewport = $(".contentPosition"),
        confirmationCounter = $('.confirmationCounter').length > 0 ? $('.confirmationCounter').first().outerHeight() : 0,
        attendeeInQuiz = $('#attendee-in-quiz-wrapper').length > 0 ? $('#attendee-in-quiz-wrapper').outerHeight() : 0,
        learnerListMargin = parseInt($('.learner-list').first().css('margin-top').replace("px", ""));

    var viewPortHeight =
        viewport.outerHeight() -
        confirmationCounter -
        attendeeInQuiz -
        learnerListMargin;

    /* The height of the learner button must be set manually if the html elements are not yet generated */
    var btnLearnerHeight = $('.btn-learner').first().parent().outerHeight() ? $('.btn-learner').first().parent().outerHeight() : 54;

    /* Calculate how much buttons we can place in the viewport until we need to scroll */
    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /*
    Multiply the displayed elements by 3 if on widescreen and reduce the max output of buttons by 1 row for the display
    more button if necessary. Also make sure there is at least one row of buttons shown even if the user has to scroll
    */
    var allMembers = MemberList.find().count();
    var limitModifier = (viewport.outerWidth() >= 992) ? 3 : (viewport.outerWidth() >= 768 && viewport.outerWidth() < 992) ? 2 : 1;

    queryLimiter *= limitModifier;
    if (queryLimiter <= 0) queryLimiter = limitModifier;
    else if(allMembers > queryLimiter) {
        /*
        Use Math.ceil() as a session owner because the member buttons position may conflict with the back/forward buttons position.
        As a session attendee we do not have these buttons, so we can use Math.floor() to display a extra row
         */
        if($(".fixed-bottom").length > 0) {
            queryLimiter -= Math.ceil($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        } else {
            queryLimiter -= Math.floor($('.more-learners-row').first().outerHeight() / btnLearnerHeight) * limitModifier;
        }
    }

    /*
    This session variable holds the amount of shown buttons and is used in the helper function
    Template.memberlist.helpers.learners which gets the attendees from the mongo db
     */
    Session.set("LearnerCount", queryLimiter);
}

function calculateProgressBarTextWidth () {
    /*
     * In chrome the width is always set 20% too high. In all other browsers either this and the original calculation
     * (e.g. $('.progress-fill').width((getPercentRead()) + "%");) works as expected. The function returns the correct
     * percent values so no other manipulation is needed. This could be a chrome bug and is perhaps fixed later.
    */
    $('.progress-fill').width((getPercentRead() - 20) + "%");

    if (getPercentRead() === 100) {
        $('.progress-fill').addClass('round-corners-right');
    } else {
        $('.progress-fill').removeClass('round-corners-right');
    }

    if (getPercentRead() === 0) {
        $('.progress-fill').hide();
    } else {
        $('.progress-fill').show();
    }
}

function getPercentRead () {
    var sumRead = 0;
    var count = 0;
    MemberList.find({hashtag: Session.get("hashtag")}).map(function (member) {
        count++;
        sumRead += member.readConfirmed;
    });
    return count ? Math.floor(sumRead / count * 100) : 0;
}