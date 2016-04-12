Meteor.publish('EventManager.join', (hashtag)=> {
    if (Meteor.isServer()) {
        new SimpleSchema({
            hashtag: {
                type: String,
                min: 1,
                max: 25
            }
        }).validate(hashtag);

        return doc ? EventManager.findOne({hashtag: hashtag}) : false;
    }
});
