Meteor.methods({
    'Responses.addResponse'(responseDoc) {
        var timestamp = new Date().getTime();
        var hashtag = responseDoc.hashtag;
        if (Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                isActive: 1
            });
            if (!doc) {
                throw new Meteor.Error('Responses.addResponse', 'There is no such hashtag active in the db')
                return;
            } else {
                var sessionDoc = Sessions.findOne({hashtag: responseDoc.hashtag});
                if (!sessionDoc) {
                    throw new Meteor.Error('Responses.addResponse', 'No session doc for this hashtag');
                    return;
                }
                var responseTime = timestamp - hashtagDoc.startTime;
                if (responseTime <= sessionDoc.timer) {
                    responseDoc.responseTime = responseTime;
                    var answerOptionDoc = AnswerOptions.findOne({
                        hashtag: hashtag,
                        answerOptionNumber: parseInt(responseDoc.answerOptionNumber)
                    });
                    if (!answerOptionDoc) {
                        throw new Meteor.Error('Responses.addResponse', 'There is no answer option with the given answerOptionNumber');
                        return;
                    }
                    Responses.insert(responseDoc);
                    var questionType = "polling";
                    var correctAnswerCount = AnswerOptions.find({
                        hashtag: hashtag,
                        isCorrect: 1
                    }).count();
                    if (correctAnswerCount === 1) {
                        questionType = "sc";
                    } else if (correctAnswerCount >= 2) {
                        questionType = "mc";
                    }
                    var retDoc = {
                        isCorrect: answerOptionDoc.isCorrect,
                        questionType: questionType
                    }
                    return retDoc;
                }
                else {
                    throw new Meteor.Error('Responses.addResponse', 'Response was given out of time range');
                    return;
                }
            }
        }
    },
});