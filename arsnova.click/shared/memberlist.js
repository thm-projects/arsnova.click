Meteor.methods({
    'MemberList.addLearner': function ({hashtag, nick}) {
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
            MemberList.insert({
                hashtag: hashtag,
                nick: nick,
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