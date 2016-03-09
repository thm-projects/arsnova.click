Template.readconfirmationrequired.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
    });
});

Template.readconfirmationrequired.helpers({
    isReadConfirmationRequired:function () {

        var thisSession = Sessions.findOne({hashtag:Session.get("hashtag")});
        if (!thisSession) {
            return false;
        }
        return thisSession.isReadingConfirmationRequired;
    }
});

Template.readconfirmationrequired.events({
    "click #forwardButton": function () {
        localData.updateIsReadingConfirmationRequired(Session.get("hashtag"), Sessions.findOne({hashtag: Session.get("hashtag")}).isReadingConfirmationRequired);
        Router.go("/memberlist");
    },
    "click #backButton": function () {
        if (Session.get("isOwner")){
            Router.go("/settimer");
        }else{
            Router.go("/nick");
        }
    },
    'click #isReadConfirmationRequiredButton': function (event) {
        event.preventDefault();

        var newVal = 0;
        var sessionDoc = Sessions.findOne({hashtag:Session.get("hashtag")});
        if (sessionDoc) {
            if (!sessionDoc.isReadingConfirmationRequired) {
                newVal = 1;
            }
        }
        Meteor.call("Sessions.updateIsReadConfirmationRequired", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            isReadingConfirmationRequired: newVal
        });

        var btn = $('#isReadConfirmationRequiredButton');
        btn.toggleClass("down");
        if(btn.hasClass("down")){
            btn.html("Lesebestätigung ist aktiv!");
        }else{
            btn.html("Lesebestätigung ist inaktiv!");
        }
    }
});