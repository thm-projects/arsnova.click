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
    "Sessions.updateIsReadConfirmationRequired": function ({privateKey, hashtag, isReadingConfirmationRequired}) {
        new SimpleSchema({
            isReadingConfirmationRequired: {
                type: Number,
                min: 0,
                max: 1
            }
        }).validate({isReadingConfirmationRequired: isReadingConfirmationRequired});

        var hashtagDoc = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashtagDoc) {
            var session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired: no access to session');
                return;
            } else {
                Sessions.update(session._id, {$set: {isReadingConfirmationRequired: isReadingConfirmationRequired}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.setTimer": function ({privateKey, hashtag, timer}) {
        new SimpleSchema({
            timer: {
                type: Number,
                min: 0
            }
        }).validate({timer: timer});
        const hashItem = Hashtags.findOne({
            hashtag: hashtag,
            privateKey: privateKey
        });
        if (hashItem) {
            const session = Sessions.findOne({hashtag: hashtag});
            if (!session) {
                throw new Meteor.Error('Sessions.setTimer: no access to session');
                return;
            } else {
                Sessions.update(session._id, {$set: {timer: timer}}, function (error) {
                    if (error) {
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    },
    "Sessions.startTimer": function ({privateKey, hashtag}) {
        if (Meteor.isServer) {
            var startTime = new Date();
            var hashtagDoc = Hashtags.findOne({hashtag: hashtag, privateKey: privateKey});
            if (!hashtagDoc) {
                new Meteor.Error('Sessions.startTimer', 'There is no hashtag with this key');
                return;
            }
            var sessionDoc = Sessions.findOne({hashtag: hashtag});
            if (sessionDoc) {
                Sessions.update(sessionDoc._id, {
                    $set: {startTime: startTime.getTime()}
                }, function (error) {
                    if (error){
                        throw new Meteor.Error('Sessions.updateIsReadConfirmationRequired', error);
                        return;
                    }
                });
            }
        }
    }
});