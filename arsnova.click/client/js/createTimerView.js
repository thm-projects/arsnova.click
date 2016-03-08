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
        Session.set('slider', Math.round(val));
    }).on('change', function (ev, val) {
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
        const timer = Session.get("slider");
        Meteor.call("Sessions.setTimer", {
            privateKey:localData.getPrivateKey(),
            hashtag:Session.get("hashtag"),
            timer:timer
        }, (err, res) => {
            if (err) {
                alert(err);
            } else {
                localData.addTimer(Session.get("hashtag"), timer);
                Router.go("/readconfirmationrequired");
            }
        });
    },
    "click #backButton":function(){
        const timer = Session.get("slider");
        if(!isNaN(timer) && timer > 0) {
            Meteor.call("Sessions.setTimer", {
                privateKey:localData.getPrivateKey(),
                hashtag:Session.get("hashtag"),
                timer:timer
            }, (err, res) => {
                if (err) {
                    alert(err);
                } else {
                    localData.addTimer(Session.get("hashtag"), timer);
            Router.go("/answeroptions");
        }
        });
        }

    }
});