Meteor.publish('Responses.instructor', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    var doc = Hashtags.find({
        hashtag: phashtag
    });
    if (!doc) return;
    return Responses.find({hashtag: phashtag});
});