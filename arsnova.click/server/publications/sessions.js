Meteor.publish('Sessions.question', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return Sessions.find({hashtag:phashtag, isActive:1});
});

Meteor.publish('Sessions.isReadingConfirmationRequired', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    const exists = Sessions.findOne({hashtag:phashtag});
    if(exists) {
        return Sessions.findOne({hashtag:phashtag});
    }
});