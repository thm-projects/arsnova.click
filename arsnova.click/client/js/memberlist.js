Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.memberlist.helpers({
    learners:function () {
        var memberCount = MemberList.length;
        return MemberList.find();
    },
    isOwnerAndReadConfirmationNeeded:function () {
        // TODO isReadConfirmation needed?
        return Session.get("isOwner");
    },
    hashtag: function () {
        return Session.get("hashtag");
    },
    loops: function () {
        // list for test purpose
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