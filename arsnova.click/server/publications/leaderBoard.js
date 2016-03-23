Meteor.publish('LeaderBoard.session', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return LeaderBoard.find({
        hashtag: phashtag});
});