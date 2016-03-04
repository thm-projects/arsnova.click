Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.memberlist.helpers({
    learners:function () {
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
        return Session.get("isOwner");
    },
    hashtag: function () {
        return Session.get("hashtag");
    },
    loops: function () {
        // list for test purpose //
        // TODO: Delete this list before push
        return [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ]
    }
});