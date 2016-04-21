import {setTimer} from '././lib.js';

Template.createTimerView.events({
    "click #forwardButton, click #backButton": function (event) {
        var err = setTimer(EventManager.findOne().questionIndex);

        if (err) {
            $('.errorMessageSplash').parents('.modal').modal('show');
            $("#errorMessage-text").html(err.reason);
        } else {
            if ($(event.currentTarget).attr("id") === "forwardButton") {
                Meteor.call("MemberList.removeFromSession", localData.getPrivateKey(), Session.get("hashtag"));
                Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), 0);
                Meteor.call("EventManager.setSessionStatus", localData.getPrivateKey(), Session.get("hashtag"), 2);
                Router.go("/memberlist");
            } else {
                Router.go("/answeroptions");
            }
        }
    }
});