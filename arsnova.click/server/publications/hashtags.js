Meteor.publish('Hashtags.public', function () {
    return Hashtags.find({},{
        fields: {
            privateKey: 0
        }
    });
});