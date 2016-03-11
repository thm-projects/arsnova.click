Template.header.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Hashtags.public', function(){
            var hashtagDocs = Hashtags.find();

            hashtagDocs.observe({
                changed: function (doc, atIndex) {
                    if ((doc.sessionStatus == 0) || ((doc.sessionStatus == 1) && (!Session.get("isOwner")))) {
                        Router.go("/resetToHome");
                    }
                }
            });
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