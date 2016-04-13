Meteor.publish('EventManager.join', (hashtag, privateKey)=> {
    if(typeof hashtag === "undefined") {
        return false;
    }
    if (Meteor.isServer) {

        new SimpleSchema({
            hashtag: {
                type: String,
                min: 1,
                max: 25
            }
        }).validate({hashtag: hashtag});
        return EventManager.find({hashtag: hashtag});
    }
    return false;
});
