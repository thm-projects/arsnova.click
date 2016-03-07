Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
        if(Session.get("isOwner")) {
            this.subscribe('MemberList.percentRead', Session.get("hashtag"), window.localStorage.getItem("privateKey"));
        }
        this.subscribe('Sessions.isReadingConfirmationRequired', Session.get("hashtag"));
    });

    $(window).resize(function () {
        calculateButtonCount();
    });
});

Template.memberlist.rendered = function () {
    calculateButtonCount();
}

Template.memberlist.events({
    "click .btn-more-learners": function (event) {
        Session.set("LearnerCount", MemberList.find() + 1);
        Session.set("LearnerCountOverride", true);
    }
});

Template.memberlist.helpers({
    isOwner: function () {
        return Session.get("isOwner");
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
        return Session.get("LearnerCount") <= MemberList.find().count();
    },

    isReadingConfirmationRequired: function () {
        return Sessions.findOne({hashtag: Session.get("hashtag")}).isReadingConfirmationRequired == 1;
    },
    isOwnerAndReadConfirmationNeeded: function () {
        return Session.get("isOwner") && (Sessions.findOne({hashtag: Session.get("hashtag")}).isReadingConfirmationRequired == 1);
    },
    isNotOwnerAndReadConfirmationNeeded: function () {
        return !Session.get("isOwner") && (Sessions.findOne({hashtag: Session.get("hashtag")}).isReadingConfirmationRequired == 1);
    },
    hashtag: function () {
        return Session.get("hashtag");
    }
});

function calculateButtonCount () {

    if (Session.get("LearnerCountOverride")) {
        return;
    }

    var viewPortHeight = $(".contentPosition").height() - $('.learner-title').height() + 40;
    var viewPortWidth = $(".contentPosition").width();

    // btnLearnerHeight muss hart hinterlegt werden / ggf anpassung an neue css klassen
    var btnLearnerHeight = 54;

    var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);
    if (queryLimiter < 4) {
        queryLimiter = 4;
    }
    if (viewPortWidth >= 768 && viewPortWidth < 1200) {
        queryLimiter *= 3;
    } else if (viewPortWidth >= 1200) {
        queryLimiter *= 4;
    }

    Session.set("LearnerCount", queryLimiter);
}
