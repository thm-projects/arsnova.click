Meteor.methods({
    setSessionTimer:function(privateKey, hashtag, timer){
        const hashItem = Hashtags.findOne({hashtag:hashtag});

        if(hashItem && privateKey === hashItem.privateKey) {
            const session = Sessions.findOne({hashtag:hashtag});
            if(!session) {
                console.log("Error: No session found");
            } else {
                Sessions.update(session._id, {$set: {timer: timer}}, function(error) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    }
});