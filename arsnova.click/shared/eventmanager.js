Meteor.methods({
    'EventManager.setSessionStatus': (privateKey, hashtag, sessionStatus)=> {
        if (Meteor.isClient) {
            return;
        }

        new SimpleSchema({
            privateKey: {type: String},
            hashtag: {type: String},
            sessionStatus: {type: Number}
        }).validate({
            privateKey,
            hashtag,
            sessionStatus
        });

        if (!Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            })) {
            throw new Meteor.Error('EventManager.setSessionStatus', 'Either there is no quiz or you don\'t have write access');
        }

        return EventManager.update({hashtag: hashtag}, {$set: {sessionStatus: sessionStatus}});
    },
    'EventManager.showReadConfirmedForIndex': (privateKey, hashtag, index)=> {
        if (Meteor.isClient) {
            return;
        }

        new SimpleSchema({
            privateKey: {type: String},
            hashtag: {type: String},
            index: {type: Number}
        }).validate({
            privateKey,
            hashtag,
            index
        });

        if (!Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            })) {
            throw new Meteor.Error('EventManager.setSessionStatus', 'Either there is no quiz or you don\'t have write access');
        }

        return EventManager.update({hashtag: hashtag}, {$set: {readingConfirmationIndex: index}});
    },
    'EventManager.setActiveQuestion': (privateKey, hashtag, index)=> {
        if (Meteor.isClient) {
            return;
        }

        new SimpleSchema({
            privateKey: {type: String},
            hashtag: {type: String},
            index: {type: Number}
        }).validate({
            privateKey,
            hashtag,
            index
        });

        if (!Hashtags.findOne({
                hashtag: hashtag,
                privateKey: privateKey
            })) {
            throw new Meteor.Error('EventManager.setSessionStatus', 'Either there is no quiz or you don\'t have write access');
        }

        return EventManager.update({hashtag: hashtag}, {$set: {questionIndex: index, readingConfirmationIndex: index}});
    }
});