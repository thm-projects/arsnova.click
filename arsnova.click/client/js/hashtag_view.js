Template.hashtag_view.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Hashtags.public');
    });
});

Template.hashtag_view.events({
    "input #hashtag-input-field": function (event) {
        var inputHashtag = $(event.target).val();
        $("#addNewHashtag").text("Mach neu !");
        if (inputHashtag.length > 0) {
            var hashtagDoc = Hashtags.findOne({hashtag: inputHashtag});
            if (!hashtagDoc) {
                $("#joinSession").attr("disabled", "disabled");
                $("#addNewHashtag").removeAttr("disabled");
            } else {
                var localHashtags = localStorage.getItem("hashtags");
                if ($.inArray(inputHashtag, localHashtags)) {
                    $("#addNewHashtag").text("Wiederherstellen");
                }
                else {
                    if (hashtagDoc.isActive) {
                        $("#joinSession").removeAttr("disabled");
                        $("#addNewHashtag").attr("disabled", "disabled");
                    } else {
                        $("#addNewHashtag").attr("disabled", "disabled");
                        $("#joinSession").attr("disabled", "disabled");
                    }
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
        var reenter = false;
        if (hashtag.length > 0) {
            var localHashtags = localStorage.getItem("hashtags");
            if ($.inArray(hashtag, localHashtags)) {
                var oldHashtagDoc = Hashtags.findOne({hashtag: hashtag});
                if (oldHashtagDoc) {
                    reenter = true;
                    Session.set("hashtag", hashtag);
                    Session.set("isOwner", true);
                    Router.go("/question");
                }
            }
            if (!reenter) {
                var doc = {
                    privateKey: localStorage.getItem("privateKey"),
                    hashtag: hashtag,
                    isActive: 1
                };
                Meteor.call('Hashtags.addHashtag', doc, (err, res) => {
                    if (err) {
                        alert("Hashtag not saved!\n" + err);
                    } else {
                        Session.set("hashtag", hashtag);
                        Session.set("isOwner", true);
                        localStorage.setItem("hashtag", hashtag);
                        // flag the client as owner via localStorage
                        var localHashtags = localStorage.getItem("hashtags");
                        localStorage.setItem("hashtags", (localHashtags + "," + hashtag));
                        Router.go("/question");
                    }
                });
            }
        }
    },
    "click #joinSession": function () {
        var hashtag = $("#hashtag-input-field").val();
        Session.set("hashtag", hashtag);
        localStorage.setItem("hashtag", hashtag);
        Router.go("/nick");
    }
});