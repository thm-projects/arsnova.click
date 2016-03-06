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
    },
    // TODO call and set inactive!
    'Hashtags.setIsActive'(privateKey, hashtag, isActive){
        console.log("set to isActive");
        new SimpleSchema({
            hashtag: {type: String},
            privateKey: {type: String},
            isActive: {
                type: Number,
                min: 0,
                max: 1}
        }).validate({
            privateKey,
            hashtag,
            isActive
        });
        var doc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (doc){
            console.log("set active!");
            Hashtags.update({_id:doc._id}, {$set: {isActive: isActive}});
        }else{
            // TODO error message: user is not owner or inputs are wrong!
            return false;
        }
    },
    'Hashtags.addHashtag'(doc) {
        for (var i = 0; i < 4; i++) {
            var emptyAnswerDoc = {
                privateKey: doc.privateKey,
                hashtag: doc.hashtag,
                answerText: "",
                answerOptionNumber: i,
                isCorrect: 0
            };
            AnswerOptions.insert(emptyAnswerDoc);
        }
        Hashtags.insert(doc);
    },
});