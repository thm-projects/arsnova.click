Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
        if(Session.get("isOwner")) {
            this.subscribe('MemberList.percentRead', Session.get("hashtag"), window.localStorage.getItem("privateKey"));
        }
        this.subscribe('Sessions.isReadingConfirmationRequired', Session.get("hashtag"));
    });

});

Template.memberlist.helpers({
    isOwner: function () {
        return Session.get("isOwner");
    },

    isReadConfirmationNeeded: function () {
        const readNeeded = Sessions.findOne({hashtag: Session.get("hashtag")});
        if (!readNeeded) {
            return;
        }
        return readNeeded.isReadingConfirmationRequired;
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
        var returnMemberList = MemberList.find();
        var memberCount = returnMemberList.length;

        var viewPortHeigth = $(".contentPosition").height();
        var viewPortWidth = $(".contentPosition").width();

        // btnLearnerHeight muss hart hinterlegt werden / ggf anpassung an neue css klassen
        var btnLearnerHeight = 54;

        // breakpoint width: <= 945 --> one collumn
        // breakpoint width: > 945 --> three collumns

        var breakFactor = viewPortWidth < 945 ? 1 : 3;

        console.log(" - - - - - - - - - - - - - - - - - ");
        console.log("     viewPortHeigth : " + viewPortHeigth);
        console.log("     viewPortWidth : " + viewPortWidth);
        console.log("     btnLearnerHeight : " + btnLearnerHeight);
        console.log("     memberCount : " + memberCount);
        console.log("     breakFactor : " + breakFactor);
        console.log(" - - - - - - - - - - - - - - - - - ");
        console.log("");
        console.log("");
        console.log("");
        return returnMemberList;
    },

    isOwnerAndReadConfirmationNeeded: function () {
        // TODO isReadConfirmation needed?
        return true;
        return Session.get("isOwner") && (Sessions.findOne({hashtag: Sessions.get("hashtag")}).isReadingConfirmationRequired == 1);
    },
    hashtag: function () {
        return Session.get("hashtag");
    }
});