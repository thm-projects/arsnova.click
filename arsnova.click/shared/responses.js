Meteor.methods({
    'Responses.addResponse'(responseDoc) {
        var timestamp = new Date().getTime();
        var hashtag = responseDoc.hashtag;
        var dupDoc = Responses.find({hashtag: responseDoc.hashtag, answerOptionNumber: responseDoc.answerOptionNumber});
        if (!dupDoc) {
            return null;
        }
        if (Meteor.isServer) {
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                sessionStatus: 3
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('Responses.addResponse', 'There is no such hashtag active in the db')
                return;
            } else {
                var sessionDoc = Sessions.findOne({hashtag: responseDoc.hashtag});
                if (!sessionDoc) {
                    throw new Meteor.Error('Responses.addResponse', 'No session doc for this hashtag');
                    return;
                }
                var responseTime = Number(timestamp) - Number(sessionDoc.startTime);
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
                    var nickResponsesCount = Responses.find({
                        hashtag: hashtag,
                        userNick: responseDoc.userNick
                    }).count();
                    var showForwardButton = false;
                    if (nickResponsesCount > 1) {
                        showForwardButton = true;
                    }
                    var instantRouting = false;
                    var correctAnswerOptionsCount = AnswerOptions.find({hashtag: responseDoc.hashtag, isCorrect: 1}).count();
                    if (correctAnswerOptionsCount === 1) {
                        instantRouting = true;
                    }
                    var retDoc = {
                        isCorrect: answerOptionDoc.isCorrect,
                        instantRouting: instantRouting,
                        showForwardButton: showForwardButton
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