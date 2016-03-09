Meteor.publish('Sessions.instructor', function(pprivateKey, phashtag) {
    new SimpleSchema({
        phashtag: {type: String},
        pprivateKey: {type: String}
    }).validate({
            pprivateKey,
            phashtag
        });
    var doc = Hashtags.find({
        hashtag: phashtag,
        privateKey: pprivateKey
    });
    if (!doc) return;
    return Sessions.find({hashtag: phashtag});
});

Meteor.publish('Sessions.question', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return Sessions.find({hashtag: phashtag}, {
        fields: {
            questionText: 1,
            starTime: 1,
            timer: 1
        }
    });
});

Meteor.publish('Sessions.memberlist', function (phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return Sessions.find({hashtag: phashtag},{
        fields: {
            _id: 1,
            isReadingConfirmationRequired: 1,
        startTime: 1
        }
    });
});