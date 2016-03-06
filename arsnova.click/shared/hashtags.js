Meteor.methods({
    'Hashtags.checkPrivateKey'(privateKey, hashtag) {
        new SimpleSchema({
            hashtag: {type: String},
            privateKey: {type: String}
        }).validate({
            privateKey,
            hashtag
        });
        var doc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (doc) {
            return true;
        }
        else {
            return false;
        }
    },
    'Hashtags.addHashtag'(doc) {
        for (var i = 0; i < 4; i++) {
            var emptyAnswerDoc = {
                privateKey: doc.privateKey,
                hashtag: doc.hashtag,
                answerText: "",
                answerOptionNumber: i,
                isCorrect: 0
            };
            AnswerOptions.insert(emptyAnswerDoc);
        }
        Hashtags.insert(doc);
    }
});