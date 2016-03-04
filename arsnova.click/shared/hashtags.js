Meteor.methods({
    'Hashtags.checkPrivateKey'(privateKey, hashtag) {
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
            return true;
        }
        else {
            return false;
        }
    }
});