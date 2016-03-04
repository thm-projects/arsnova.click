Template.hashtag_view.onCreated(function () {
    this.autorun(() => {
        Session.set("privateKey", "thisismypriv");
        Session.set("hashtag", "wpw");
        localStorage.setItem("privateKey", "thisismypriv");
        this.subscribe('Hashtags.public');
    });
});

Template.hashtag_view.events({
    "input #hashtag-input-field": function (event) {
        var inputHashtag = $(event.target).val();
        if (inputHashtag.length > 0) {
            var hashtagDoc = Hashtags.findOne({hashtag: inputHashtag});
            if (!hashtagDoc) {
                $("#joinSession").attr("disabled", "disabled");
                $("#addNewHashtag").removeAttr("disabled");
            } else {
                if (hashtagDoc.isActive) {
                    $("#joinSession").removeAttr("disabled");
                    $("#addNewHashtag").attr("disabled", "disabled");
                } else {
                    $("#addNewHashtag").attr("disabled", "disabled");
                    $("#joinSession").attr("disabled", "disabled");
                }
            }
        }
        else {
            $("#joinSession").attr("disabled", "disabled");
            $("#addNewHashtag").attr("disabled", "disabled");
        }
    },
    "click #addNewHashtag": function (event) {
        event.preventDefault();
        var hashtag = $("#hashtag-input-field").val();
        console.log(hashtag.length);
        if (hashtag.length > 0) {
            var doc = {
                privateKey: localStorage.getItem("privateKey"),
                hashtag: hashtag,
                isActive: 1
            };
            console.log(doc);
            Meteor.call('Hashtags.addHashtag', doc);
            Session.set("hashtag", hashtag);
            Session.set("isOwner", true);
            Router.go("/question");
        }
    },
    "click #joinSession": function () {
        var hashtag = $("#hashtag-input-field").val();
        Session.set("hashtag", hashtag);
        Router.go("/nick");
    }
});