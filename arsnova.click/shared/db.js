Meteor.methods({
    setSessionQuestion:function(privateKey, hashtag, questionText){
        const hashItem = Hashtags.findOne({hashtag:hashtag});
        if(hashItem && privateKey === hashItem.privateKey) {
            const session = Sessions.findOne({hashtag:hashtag});
            if(!session) {
                return;
            }
            Sessions.update(session._id, {$set: {questionText: questionText}}, function(error) {
                if (error) {
                    console.log(error);
                }
            });

        }
    }
});