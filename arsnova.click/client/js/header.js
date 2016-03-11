Template.hashtag_view.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Hashtags.public');

        Tracker.autorun(function() {
            var initializing = true;
            Hashtags.find({hashtags: Session.get("hashtag")}).observeChanges({
                changed: function (id, attr) {
                    if (!initializing) {
                        var hashDoc = Hashtags.findOne({_id:id});
                        if ((hashDoc.sessionStatus == 0) || ((hashDoc.sessionStatus == 1) && (!Session.get("isOwner")))) {
                            Router.go("/resetToHome");
                        }
                    }
                }
            });
            initializing = false;
        });
    });
});

Template.header.helpers({
    isInHomePathOrIsStudent: function () {
        switch (Router.current().route.path()) {
            case '/':
            case '/ueber':
            case '/agb':
            case '/datenschutz':
            case '/impressum':
                return true;
        }
        return !Session.get("isOwner");
    },
    currentHashtag: function () {
        return Session.get("hashtag");
    }
});

Template.header.events({
    'click .kill-session-switch': function () {
        if (Session.get("isOwner")){
            Meteor.call("Main.killAll", localData.getPrivateKey(), Session.get("hashtag"));
            Router.go("/");
        }
    }
});