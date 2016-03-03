Template.hashtag_view.events({
    "click #addNewHashtag": function () {
        //TODO:
        Session.set("isOwner", true);
        Router.go("/question");
    }
});