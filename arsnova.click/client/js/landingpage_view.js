Template.hashtag_view.events({
    "click #addNewHashtag": function () {
        var hashtag = $("#hashtag-input-field").val();
        Session.set("hashtag", hashtag);
        Session.set("isOwner", true);
        Router.go("/question");
    },
    "click #joinSession": function () {
        var hashtag = $("#hashtag-input-field").val();
        Session.set("hashtag", hashtag);
        Router.go("/nick");
    }
});