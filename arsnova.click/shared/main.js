Meteor.methods({
    'Main.killAll': function (privateKey, hashtag) {
        if (Meteor.isServer){
            new SimpleSchema({
                hashtag: {type: String},
                privateKey: {type: String}
            }).validate({
                privateKey,
                hashtag
            });
            var doc = Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            });
            if (doc) {
                Hashtags.update(doc._id, {$set:{sessionStatus : 0}});
                AnswerOptions.remove({hashtag: doc.hashtag});
                MemberList.remove({hashtag: doc.hashtag});
                Responses.remove({hashtag: doc.hashtag});
                Sessions.remove({hashtag: doc.hashtag});
            }
        }
    },
});