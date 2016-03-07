Template.modalShowMyHashtags.helpers({
    hashtags: function () {
        var localHashtags = [];
        if (localStorage.getItem("hashtags")) {
            localHashtags = JSON.parse(localStorage.getItem("hashtags"));
        }
        return localHashtags;
    }
});

Template.modalShowMyHashtags.events({
    "click .js-my-hash": function (event) {
        var hashtag = event.target.innerHTML;
        var question = localStorage.getItem(hashtag);
        console.log(question);
    }
});