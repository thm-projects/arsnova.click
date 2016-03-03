Meteor.publish('MemberList.members', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    var learners = MemberList.find({
        hashtag: phashtag
    });
    if (!learners) return;
    return MemberList.find({hashtag: phashtag});
});