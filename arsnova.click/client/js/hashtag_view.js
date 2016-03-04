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
                $(".btn-join-session").attr("disabled", "disabled");
                $(".btn-create-session").removeAttr("disabled");
            } else {
                if (hashtagDoc.isActive) {
                    $(".btn-join-session").removeAttr("disabled");
                    $(".btn-create-session").attr("disabled", "disabled");
                } else {
                    $(".btn-create-session").attr("disabled", "disabled");
                    $(".btn-join-session").attr("disabled", "disabled");
                }
            }
        }
        else {
            $(".btn-join-session").removeAttr("disabled");
            $(".btn-create-session").removeAttr("disabled");
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