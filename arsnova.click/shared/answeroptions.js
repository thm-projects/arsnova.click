Meteor.methods({
    'AnswerOptions.addOption'( pprivateKey, {hashtag, answerText, answerOptionNumber, isCorrect} ) {
        new SimpleSchema({
            pprivateKey: { type: String },
            hashtag: { type: String },
            answerText: { type: String },
            answerOptionNumber: { type: Number },
            isCorrect: { type: Number }
        }).validate({ pprivateKey, hashtag, answerText, answerOptionNumber, isCorrect });
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: pprivateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Either there is no hashtag or you don\'t have write access');
            return;
        }
        else {
            AnswerOptions.insert({
                hashtag: hashtag,
                answerText: answerText,
                answerOptionNumber: answerOptionNumber,
                isCorrect: isCorrect
            });
        }
    }
});

Meteor.methods({
    'AnswerOptions.deleteOption'( pprivateKey, hashtag, answerOptionNumber ) {
        (new SimpleSchema({
            pprivateKey: { type: String },
            hashtag: { type: String },
            answerOptionNumber: { type: Number }
        }).validate({ pprivateKey, hashtag, answerOptionNumber }));
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: pprivateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Either there is no hashtag or you don\'t have write access');
            return;
        }
        else {
            var answerOptionDoc = AnswerOptions.find({
                hashtag: hashtag,
                answerOptionNumber: answerOptionNumber
            });

            AnswerOptions.remove({
                hashtag: hashtag,
                answerOptionNumber: answerOptionNumber
            });
        }
    }
});
