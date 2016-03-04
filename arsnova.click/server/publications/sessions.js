Meteor.publish('Sessions.question', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return Sessions.find({hashtag: phashtag});
});

Meteor.publish('Sessions.isReadingConfirmationRequired', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    const exists = Sessions.find({hashtag: phashtag});
    if (exists) {
        return exists;
    }
});