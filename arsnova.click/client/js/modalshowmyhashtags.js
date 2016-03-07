Template.modalShowMyHashtags.helpers({
    hashtags: function () {
        /*var hashtags = localStorage.getItem("hashtags").split(",");
        var dataArray = [];
        hashtags.forEach(function (name) {
            dataArray.push({hashtag: name});
        });
        return dataArray;*/
        return getAllHashtags();
    }
});

Template.modalShowMyHashtags.events({
    "click .js-my-hash": function (event) {
        var hashtag = event.target.innerHTML;
        reenterSession(hashtag);
        /*var question = localStorage.getItem(hashtag);
        console.log(question);*/
        Session.set("isOwner", true);
        Session.set("hashtag", hashtag);

        closeAndRedirectTo('/question');
    }
});