Meteor.publish('MemberList.members', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    var learners = MemberList.find({
        hashtag: phashtag
    });
    return learners ? MemberList.find({hashtag: phashtag}) : null;
});