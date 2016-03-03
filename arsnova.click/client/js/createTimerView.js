/**
 * Created by Kevin on 03.03.16.
 */
Template.createTimerView.helpers({
    timer:function(){
        //For testing purposes
        //Session.set("hashtag","wpw");
        //window.localStorage.setItem("privateKey", "thisismypriv");

        const currentSession = Sessions.findOne({hashtag:Session.get("hashtag")});

        if(!currentSession || !currentSession.timer) {
            return "";
        }
        return currentSession.timer;
    }
});

Template.createTimerView.events({
    "click #forwardButton":function(){
        const timer = $('#setTimer').val();
        Meteor.call("setSessionTimer", window.localStorage.getItem("privateKey"), Session.get("hashtag"), timer);
    },
    "click #backButton":function(){
        const timer = $('#setTimer').val();
        if(!isNaN(timer) && timer > 0) {
            Meteor.call("setSessionTimer", window.localStorage.getItem("privateKey"), Session.get("hashtag"), timer);
        }

    }
});