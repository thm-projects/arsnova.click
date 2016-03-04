Template.memberlist.onCreated(function () {
    this.autorun(() => {
        this.subscribe('MemberList.members', Session.get("hashtag"));
    });
});

Template.memberlist.helpers({
    learners:function () {
        return MemberList.find();
    },
    isOwnerAndReadConfirmationNeeded:function () {
        // TODO isReadConfirmation needed?
        return Session.get("isOwner");
    }
});