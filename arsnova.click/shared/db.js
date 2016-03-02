Meteor.methods({
    'AnswerOptions.instructor': function (pprivateKey, phashtag) {
        new SimpleSchema({
            phashtag: {type: String}
        }).validate();
        var doc = Hashtags.find({
            hashtag: phashtag,
            privateKey: pprivateKey
        });
        if (!doc) return;
        return AnswerOptions.find({hashtag: phashtag});
    }
});