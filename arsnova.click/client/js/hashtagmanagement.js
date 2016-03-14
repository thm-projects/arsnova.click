Template.hashtagManagement.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Hashtags.public');
    });
});

Template.hashtagManagement.helpers({
    serverHashtags: function () {
        return localData.getAllHashtags();
    }
});

Template.hashtagManagement.events({
    "click .js-reactivate-hashtag": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
    },
    "click .js-export": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
    },
    "click .js-delete": function (event) {
        var hashtag = $(event.currentTarget).parent().parent()[0].id;
    }
});