Template.readconfirmationrequired.onCreated(function () {
    this.autorun(() => {
        localStorage.setItem("privateKey", "thisismypriv");
        Session.set("hashtag", "wpw");
        this.subscribe('Sessions.instructor', localStorage.getItem("privateKey"), Session.get("hashtag"));
    });
});

Template.readconfirmationrequired.helpers({
    isReadConfirmationRequired:function () {
        var thisSession = Sessions.findOne({hashtag:Session.get("hashtag")});
        console.log(thisSession);
        return thisSession.isReadingConfirmationRequired;
    }
});

Template.readconfirmationrequired.events({
    "click #forwardButton": function () {
        Router.go("/memberlist");
    },
    "click #backButton": function () {
        Router.go("/nick");
    },
    'click #isReadConfirmationRequiredButton': function (event) {
        event.preventDefault();

        var newVal = Sessions.findOne({hashtag:Session.get("hashtag")}).isReadingConfirmationRequired ? 0 : 1;
        Meteor.call("Sessions.updateIsReadConfirmationRequired", {privateKey:localStorage.getItem("privateKey"), hashtag:Session.get("hashtag"), isReadConfirmationRequired:newVal});

        $('#isReadConfirmationRequiredButton').toggleClass("down");
    }
});