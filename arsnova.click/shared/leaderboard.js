Meteor.methods({
    'LeaderBoard.addResponseSet': function ({phashtag, nick, responseTimeMillis}) {
        if (Meteor.isServer){
            new SimpleSchema({
                phashtag: {type: String},
                nick: {type: String},
                responseTimeMillis: {type: Number}
            }).validate({
                phashtag,
                nick,
                responseTimeMillis
            });
            var memberEntry = LeaderBoard.findOne({
                phashtag: phashtag,
                nick: nick
            });

            const correctAnswers = [];

            AnswerOptions.find({
                hashtag: phashtag,
                isCorrect: 1
            }, {fields: {"answerOptionNumber": 1}}).forEach(function (answer) {
                correctAnswers.push(answer.answerOptionNumber);
            });

            var responseAmount = 0;
            var falseResponseAmount = 0;

            Responses.find({hashtag: phashtag, userNick: nick}).forEach(function (response) {
                if (correctAnswers.indexOf(response.answerOptionNumber) == -1){
                    falseResponseAmount++;
                }
                responseAmount++;
            });

            var rightResponseAmount = responseAmount-falseResponseAmount;

            memberEntry = LeaderBoard.findOne({
                hashtag: phashtag,
                nick: nick
            });

            if (!memberEntry) {
                LeaderBoard.insert({
                    hashtag: phashtag,
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