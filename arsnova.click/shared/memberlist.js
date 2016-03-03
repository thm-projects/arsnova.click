Meteor.methods({
    'MemberList.addNick'( hashtag, nickName ) {
        new SimpleSchema({
            hashtag: { type: String },
            nick: { type: String },
            readConfirmed: { type: Number },
        }).validate({ hashtag, nickName, isReadConfirmed });
        var member = MemberList.findOne({hashtag: hashtag, nick: nickName});
        if (!member){
            MemberList.insert({
                hashtag: hashtag,
                nick: nickName,
                readConfirmed: 0
            });
        }else{
            throw new Meteor.Error('MemberList.addNick', 'Nick already exists!');
            return;
        }
    },
    'MemberList.setReadConfirmed'( hashtag, nickName ) {
        new SimpleSchema({
            hashtag: { type: String },
            nick: { type: String },
            readConfirmed: { type: Number },
        }).validate({ hashtag, nickName, isReadConfirmed });
        var member = MemberList.findOne({hashtag: hashtag, nick: nickName});
        if (!member) {
            throw new Meteor.Error('MemberList.setReadConfirmed', 'Member not found!');
            return;
        }else{
            member.readConfirmed = 1;
            MemberList.update({_hashtag: hashtag, nick: nickName}, member);
        }
    }
});