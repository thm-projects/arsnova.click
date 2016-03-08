// slider starts at 20 and 80
Session.setDefault("slider", 20);


Template.createTimerView.rendered = function () {
    this.$("#slider").noUiSlider({
        start: Session.get("slider"),
        range: {
            'min': 5,
            'max': 180
        }
    }).on('slide', function (ev, val) {
        // set real values on 'slide' event
        Session.set('slider', val);
    }).on('change', function (ev, val) {
        // round off values on 'change' event
        Session.set('slider', Math.round(val));
    });
};

Template.createTimerView.helpers({
  /*  timer:function(){
        //For testing purposes
        //Session.set("hashtag","wpw");
        //window.localStorage.setItem("privateKey", "thisismypriv");

        const currentSession = Sessions.findOne({hashtag:Session.get("hashtag")});

        if(!currentSession || !currentSession.timer) {
            return "";
        }
        return currentSession.timer;
    },*/
    slider: function () {
        return Session.get("slider");
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