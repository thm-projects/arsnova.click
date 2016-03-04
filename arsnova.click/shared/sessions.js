Meteor.methods({
    "Sessions.setQuestion": function (privateKey, hashtag, questionText) {
        //TODO: validate questionText with SimpleSchema
        new SimpleSchema({
            questionText: {
                type: String,
                min: 5,
                max: 1000
            }
        }).validate({questionText: questionText});

        const hashItem = Hashtags.findOne({hashtag: hashtag});
        if (hashItem && privateKey === hashItem.privateKey) {
            const session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                Sessions.insert({
                    hashtag: hashtag,
                    questionText: questionText,
                    timer: 20,
                    isReadingConfirmationRequired: 1
                });
            } else {
                Sessions.update(session._id, {$set: {questionText: questionText}}, function (error) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    }
});