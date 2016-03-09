Meteor.setInterval(function () {
    if (Session.get("isOwner")){
        Meteor.call('keepalive', localData.getPrivateKey(), Session.get("hashtag"));
    }
}, 5000);