Meteor.publish('AnswerOptions.instructor', function(pprivateKey, phashtag) {
    new SimpleSchema({
        phashtag: {type: String},
        pprivateKey: {type: String}
    }).validate({pprivateKey, phashtag});
    var doc = Hashtags.find({
        hashtag: phashtag,
        privateKey: pprivateKey
    });
    if (!doc) return;
    return AnswerOptions.find({hashtag: phashtag});
});

Meteor.publish('AnswerOptions.options', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return AnswerOptions.find({hashtag: phashtag});
});