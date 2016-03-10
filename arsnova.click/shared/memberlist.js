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
            MemberList.insert({
                hashtag: hashtag,
                nick: nick,
                backgroundColor: backgroundColor,
                foregroundColor: foregroundColor,
                readConfirmed: 0
            });
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