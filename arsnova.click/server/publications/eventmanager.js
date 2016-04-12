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

        if(privateKey) {
            /*
            The user claims to be the owner of the session
             */
            if( !Hashtags.findOne({ hashtag: hashtag, privateKey: privateKey })) {
                throw new Meteor.Error('EventManager.join', 'Either there is no quiz or you don\'t have write access');
            }
        }

        /*
         Check if the document exists in the event manager
         Create it if it does not exist
         */
        if( !EventManager.findOne({hashtag: hashtag})) {
            EventManager.insert({
                hashtag: hashtag,
                sessionStatus: 0,
                readingConfirmationIndex: 0,
                questionIndex: 0
            });
        }
        return EventManager.find({hashtag: hashtag});
    }
});
