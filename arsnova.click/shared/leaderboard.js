Meteor.methods({
    'LeaderBoard.addResponseSet': function ({phashtag, nick, responseTimeMillis, givenAnswers, rightAnswers}) {
        new SimpleSchema({
            hashtag: {type: String},
            nick: {type: String},
            responseTimeMillis: {type: Number},
            givenAnswers: {type: Number},
            rightAnswers: {type: Number}
        }).validate({
            phashtag,
            nick,
            responseTimeMillis,
            givenAnswers,
            rightAnswers
        });
        member = LeaderBoard.findOne({
            hashtag: hashtag,
            nick: nick
        });
        if (!member) {
            LeaderBoard.insert({
                hashtag: hashtag,
                userNick: nick,
                responseTimeMillis: responseTimeMillis,
                givenAnswers: givenAnswers,
                rightAnswers: rightAnswers,
                wrongAnswers: givenAnswers - wrongAnswers
            });
        } else {
            throw new Meteor.Error('LeaderBoard.addResponseSet', 'Nick already exists in leader board for this session!');
            return;
        }
    }
});