Template.memberlist.helpers({
    learners:function () {
        return MemberList.find();
    },
    isOwnerAndReadConfirmationNeeded:function () {
        // TODO isReadConfirmation needed?
        return Session.get("isOwner");
    }
});