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

    $(window).resize(function () {
        calculateButtonCount();
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
        initializing = false;
    });
});

Template.memberlist.onRendered(function () {
    $(window).resize(function () {
        var final_height = $(window).height() - $(".navbar").height();
        $(".titel").css("margin-top", $(".navbar").height());
        $(".container").css("height", final_height);
    });
});

Template.memberlist.rendered = function () {
    var final_height = $(window).height() - $(".navbar").height();
    $(".titel").css("margin-top", $(".navbar").height());
    $(".container").css("height", final_height);
    calculateButtonCount();
};

Template.memberlist.events({
    "click .btn-more-learners": function (event) {
        Session.set("LearnerCount", MemberList.find() + 1);
        Session.set("LearnerCountOverride", true);
    },
    'click #setReadConfirmed': function () {
        closeSplashscreen();
    },
    'click .btn-less-learners': function () {
        Session.set("LearnerCountOverride", false);
        calculateButtonCount();
    },    
    'click #startPolling': function (event) {
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
    percentRead: function () {
        var sumRead = 0;
        var count = 0;
        MemberList.find({hashtag: Session.get("hashtag")}).map(function (member) {
            count++;
            sumRead += member.readConfirmed;
        });

        return count ? Math.floor(sumRead / count * 100) : 0;
    },

    learners: function () {
        return MemberList.find({}, {
            limit: (Session.get("LearnerCount") - 1),
            sort: {nick: 1}
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
    isOwnerAndReadConfirmationNeeded: function () {
        const doc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if(!doc){
            return;
        }
        return Session.get("isOwner") && (doc.isReadingConfirmationRequired == 1);
    },
    isNotOwnerAndReadConfirmationNeeded: function () {
        const doc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if(!doc){
            return;
        }
        return !Session.get("isOwner") && (doc.isReadingConfirmationRequired == 1);
    }


});

function calculateButtonCount () {

    if (Session.get("LearnerCountOverride")) {
        return;
    }

    var contentPosition = $(".contentPosition");

    var viewPortHeight = contentPosition.height() - $('.learner-title').height();
    var readConfirm = $('.confirmationCounter:first');

    if (readConfirm.length > 0) {
        viewPortHeight -= readConfirm.height();
    }
    // + 30 because contentPosition has 15px padding left and right
    var viewPortWidth = contentPosition.width() + 30;

    // btnLearnerHeight muss hart hinterlegt werden / ggf anpassung an neue css klassen
    var btnLearnerHeight = 54;

    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);
    if (viewPortWidth >= 768 && viewPortWidth < 1200) {
        queryLimiter *= 3;
    } else if (viewPortWidth >= 1200) {
        queryLimiter *= 4;
    }

    Session.set("LearnerCount", queryLimiter);
}
