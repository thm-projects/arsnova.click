Meteor.methods({
    'AnswerOptions.addOption'({privateKey, hashtag, answerText, answerOptionNumber, isCorrect}) {
        new SimpleSchema({
            privateKey: { type: String },
            hashtag: { type: String },
            answerText: { type: String },
            answerOptionNumber: { type: Number },
            isCorrect: { type: Number }
        }).validate({ privateKey, hashtag, answerText, answerOptionNumber, isCorrect });
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Either there is no hashtag or you don\'t have write access');
            return;
        }
        else {
            var answerOptionDoc = AnswerOptions.findOne({
                hashtag: hashtag,
                answerOptionNumber: answerOptionNumber
            });
            if (!answerOptionDoc){
                AnswerOptions.insert({
                    hashtag: hashtag,
                    answerText: answerText,
                    answerOptionNumber: answerOptionNumber,
                    isCorrect: isCorrect
                });
            }else{
                AnswerOptions.update(answerOptionDoc._id, {$set:{
                    answerText: answerText,
                    isCorrect: isCorrect
                }});
            }
        }
    },
    'AnswerOptions.deleteOption'({privateKey, hashtag, answerOptionNumber}) {
        (new SimpleSchema({
            privateKey: { type: String },
            hashtag: { type: String },
            answerOptionNumber: { type: Number }
        }).validate({ privateKey, hashtag, answerOptionNumber }));
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Either there is no hashtag or you don\'t have write access');
            return;
        }
        else {
            AnswerOptions.remove({
                hashtag: hashtag,
                answerOptionNumber: answerOptionNumber
            });
        }
    },
    'AnswerOptions.updateAnswerTextAndIsCorrect'({privateKey, hashtag, answerOptionNumber, answerText, isCorrect}) {
        new SimpleSchema({
            privateKey: { type: String },
            hashtag: { type: String },
            answerOptionNumber: { type: Number },
            answerText: { type: String },
            isCorrect: { type: Number }
        }).validate({ privateKey, hashtag, answerOptionNumber, answerText, isCorrect });
        var doc = true;
        if (Meteor.isServer) {
            doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
        }
        if (!doc) {
            throw new Meteor.Error('AnswerOptions.addOption', 'Either there is no hashtag or you don\'t have write access');
            return;
        }
        else {
            var answerOptionDoc = AnswerOptions.findOne({
                hashtag: hashtag,
                answerOptionNumber: answerOptionNumber
            });
            AnswerOptions.update(answerOptionDoc._id, {
                $set: {answerText: answerText, isCorrect: isCorrect}
            });
        }
    }
});
