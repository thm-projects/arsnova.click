Meteor.publish('MemberList.members', function(phashtag) {
    new SimpleSchema({
        phashtag: {type: String}
    }).validate({phashtag});
    return MemberList.find({
        hashtag: phashtag
    });
});

Meteor.publish('MemberList.percentRead', function(phashtag, pprivateKey) {
    new SimpleSchema({
        phashtag: {type: String},
        pprivateKey: {type:String}
    }).validate({phashtag, pprivateKey});
    const exists = Hashtags.findOne({hashtag:phashtag, privateKey:pprivateKey});
    if(exists) {
        return MemberList.find({hashtag:phashtag});
    }
});