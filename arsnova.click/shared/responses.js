Meteor.methods({
    'Responses.addResponse'(responseDoc) {
        var timestamp = new Date().getTime();
        var hashtag = responseDoc.hashtag;
        if (Meteor.isServer) {
            var dupDoc = Responses.findOne({hashtag: responseDoc.hashtag, answerOptionNumber: responseDoc.answerOptionNumber, userNick: responseDoc.userNick});
            if (dupDoc) {
                throw new Meteor.Error('Responses.addResponse', 'User has already given this response');
                return;
            }
            var hashtagDoc = Hashtags.findOne({
                hashtag: hashtag,
                sessionStatus: 3
            });
            if (!hashtagDoc) {
                throw new Meteor.Error('Responses.addResponse', 'There is no such quiz active in the db');
                return;
            } else {
                var sessionDoc = Sessions.findOne({hashtag: responseDoc.hashtag});
                if (!sessionDoc) {
                    throw new Meteor.Error('Responses.addResponse', 'No session doc for this quiz');
                    return;
                }
                var responseTime = Number(timestamp) - Number(sessionDoc.startTime);

                if (responseTime <= sessionDoc.timer) {
                    responseDoc.responseTime = responseTime;
                    var answerOptionDoc = AnswerOptions.findOne({
                        hashtag: hashtag,
                        answerOptionNumber: responseDoc.answerOptionNumber
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