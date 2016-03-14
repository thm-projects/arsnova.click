Meteor.methods({
    'MemberList.addLearner': function ({hashtag, nick, backgroundColor, foregroundColor}) {
        new SimpleSchema({
            hashtag: {type: String},
            nick: {type: String},
            backgroundColor: {type: String},
            foregroundColor: {type: String}
        }).validate({
            hashtag,
            nick,
            backgroundColor,
            foregroundColor
        });
        member = MemberList.findOne({
            hashtag: hashtag,
            nick: nick
        });
        if (!member) {
            if (Hashtags.findOne({hashtag:hashtag}).sessionStatus == 2) {
                MemberList.insert({
                    hashtag: hashtag,
                    nick: nick,
                    lowerCaseNick: nick.toLowerCase(),
                    backgroundColor: backgroundColor,
                    foregroundColor: foregroundColor,
                    readConfirmed: 0,
                    insertDate: new Date().getTime()
                });
            } else {
                throw new Meteor.error('MemberList.addLearner', 'Session is currently not available for joining');
            }
        } else {
            throw new Meteor.Error('MemberList.addLearner', 'Nick already exists!');
            return;
        }
    },
    'MemberList.setReadConfirmed': function (hashtag, nick) {
        // TODO Thought: maybe link this method to a privateKey for learners? otherwise everybody can set "readConfirmed" for each user!
        new SimpleSchema({
            hashtag: {type: String},
            nick: {type: String}
        }).validate({
                hashtag,
                nick
            });
        member = MemberList.findOne({
            hashtag: hashtag,
            nick: nick
        });
        if (!member) {
            throw new Meteor.Error('MemberList.setReadConfirmed', 'Member not found!');
        } else {
            MemberList.update(member._id, {$set: {readConfirmed: 1}}, member);
        }
    }
});