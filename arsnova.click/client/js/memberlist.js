Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
        if(Session.get("isOwner")) {
            this.subscribe('MemberList.percentRead', Session.get("hashtag"), window.localStorage.getItem("privateKey"));
        }
        this.subscribe('Sessions.isReadingConfirmationRequired', Session.get("hashtag"));
    });

});

Template.memberlist.onCreated(function () {
    $(window).resize(function () {
        var viewPortHeight = $(document).height() - 200;
        var viewPortWidth = $(document).width();

        // btnLearnerHeight muss hart hinterlegt werden / ggf anpassung an neue css klassen
        var btnLearnerHeight = 54;

        var queryLimiter = Math.floor(viewPortHeight / btnLearnerHeight);
        if (viewPortWidth > 768 && viewPortWidth < 1200) {
            queryLimiter *= 3;
        } else if (viewPortWidth >= 1200) {
            queryLimiter *= 4;
        }

        Session.set("showMoreButton", queryLimiter);
        console.log("Show Buttons: " + queryLimiter);
    })
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
        var returnMemberList = MemberList.find({}, {limit: (Session.get("showMoreButton") - 1)});
        return returnMemberList;
    },

    showMoreButton: function () {
        return Session.get("showMoreButton") <= MemberList.find().count();
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