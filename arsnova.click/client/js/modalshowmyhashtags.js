Template.modalShowMyHashtags.helpers({
    hashtags: function () {
        return localData.getAllHashtags();
    }
});

Template.modalShowMyHashtags.events({
    "click .js-my-hash": function (event) {
        var hashtag = event.target.innerHTML;
        localData.reenterSession(hashtag);
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);

        closeAndRedirectTo('/question');
    }
});