Meteor.methods({
    'LeaderBoard.addResponseSet': function ({phashtag, nick, responseTimeMillis}) {
        if (Meteor.isServer){
            new SimpleSchema({
                hashtag: {type: String},
                nick: {type: String},
                responseTimeMillis: {type: Number}
            }).validate({
                phashtag,
                nick,
                responseTimeMillis
            });
            var memberEntry = LeaderBoard.findOne({
                hashtag: hashtag,
                nick: nick
            });

            const correctAnswers = [];

            AnswerOptions.find({
                hashtag: Session.get("hashtag"),
                isCorrect: 1
            }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
                correctAnswers.push(answer.answerOptionNumber);
            });

            var responseAmount = 0;
            var falseResponseAmount = 0;

            Responses.find({hashtag: Session.get("hashtag"), userNick: Session.get("nick")}).forEach(function (response) {
                if (!($.inArray(response.answerOptionNumber, correctAnswers) !== -1)) {
                    falseResponseAmount++;
                }
                responseAmount++;
            });

            var rightResponseAmount = responseAmount-falseResponseAmount;

            if (!member) {
                LeaderBoard.insert({
                    hashtag: hashtag,
                    userNick: nick,
                    responseTimeMillis: responseTimeMillis,
                    givenAnswers: responseAmount,
                    rightAnswers: rightResponseAmount,
                    wrongAnswers: falseResponseAmount
                });
            } else {
                LeaderBoard.update(memberEntry._id, {$set: {givenAnswers: responseAmount, rightAnswers: rightResponseAmount, wrongAnswers: falseResponseAmount}});
            }
        }
    }
});