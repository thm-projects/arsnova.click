Meteor.methods({
    "Sessions.setQuestion": function ({privateKey, hashtag, questionText}) {
        //TODO: validate questionText with SimpleSchema
        new SimpleSchema({
            questionText: {
                type: String,
                min: 5,
                max: 1000
            }
        }).validate({questionText: questionText});

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashtagDoc) {
            var session = Sessions.findOne({hashtag: hashtag});
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
                        throw new Meteor.Error('Sessions.setQuestion', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.updateIsReadConfirmationRequired": function ({privateKey, hashtag, isReadConfirmationRequired}) {
        new SimpleSchema({
            isReadConfirmationRequired: {
                type: Number,
                min: 0,
                max: 1
            }
        }).validate({isReadConfirmationRequired: isReadConfirmationRequired});

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashtagDoc) {
            var session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired: no access to session');
            } else {
                Sessions.update(session._id, {$set: {isReadingConfirmationRequired: isReadConfirmationRequired}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                    }
                });
            }
        }
    }
});