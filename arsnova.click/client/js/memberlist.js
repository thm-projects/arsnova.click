Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
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
                    if (!oldDoc.startTime || (oldDoc.startTime != newDoc.startTime)) {
                        Router.go("onpolling");
                    }
                }
            }
        });
        MemberList.find().observeChanges({
            added: function (id, newDoc) {
                if (!initializing) {
                    calculateProgressBarTextWidth();
                }
            }
        });
        initializing = false;
    });
});

Template.memberlist.onRendered(function () {
    $(window).resize(function () {
        var final_height = $(window).height() - $(".navbar").height();
        $(".titel").css("margin-top", $(".navbar").height());
        $(".container").css("height", final_height);
        calculateButtonCount();
        calculateProgressBarTextWidth();
    });
});

Template.memberlist.rendered = function () {
    var final_height = $(window).height() - $(".navbar").height();
    $(".titel").css("margin-top", $(".navbar").height());
    $(".container").css("height", final_height);
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
    isNotOwner: function () {
        return !Session.get('isOwner');
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
        return MemberList.find({}, {
            limit: (Session.get("LearnerCount")),
            sort: sortParamObj
        });
    },

    showMoreButton: function () {
        return Session.get("LearnerCount") < MemberList.find().count();
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

    if (Session.get("LearnerCountOverride")) {
        return;
    }

    var contentPosition = $(".contentPosition");
    var viewport = $(".contentFrame");

    var viewPortHeight = viewport.height() - $('.learner-title').height();
    var readConfirm = $('.confirmationCounter').first();

    if (readConfirm.length > 0) {
        viewPortHeight -= readConfirm.height();
    }
    // + 30 because contentPosition has 15px padding left and right
    var viewPortWidth = viewport.width() + 30;

    /* The height of the learner button must be set manually because the html elements are not yet generated */
    var btnLearnerHeight = 54;

    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);

    /* Multiply the displayed elements by 3 if on widescreen and
     reduce the max output of buttons by 1 for the display more button */
    if (contentPosition.width() >= 768) {
        queryLimiter *= 3;
        queryLimiter -= 3;
    } else {
        queryLimiter -= 1;
    }

    Session.set("LearnerCount", queryLimiter);
}

function calculateProgressBarTextWidth () {
    //$('.progress-fill').css('width', getPercentRead() + '%');
    $('.progress-fill').width((getPercentRead() - 20) + "%");
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
    console.log(count);
    return count ? Math.floor(sumRead / count * 100) : 0;
}