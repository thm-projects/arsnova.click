Template.createTimerView.onCreated(function () {
    this.autorun(() => {
        this.subscription = Meteor.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"), function () {
            var sessionDoc = Sessions.findOne({hashtag: Session.get("hashtag")});
            if (sessionDoc) {
                Session.setDefault("slider", (sessionDoc.timer / 1000));
            }else{
                Session.setDefault("slider", 40);
            }
        });
    });
});

Template.createTimerView.rendered = function () {
    createSlider();
};

function createSlider () {
    if (Session.get("slider") == undefined){
        setTimeout(createSlider, 50);
        return;
    }
    this.$("#slider").noUiSlider({
        start: Session.get("slider") == undefined ? 40 : Session.get("slider"),
        range: {
            'min': 5,
            'max': 180
        }
    }).on('slide', function (ev, val) {
        Session.set('slider', Math.round(val));
    }).on('change', function (ev, val) {
        Session.set('slider', Math.round(val));
    });
}

Template.createTimerView.helpers({
    slider: function () {
        return Session.get("slider");
    }
});

Template.createTimerView.events({
    "click #forwardButton":function(){
        // timer is given in seconds
        const timer = Session.get("slider") * 1000;
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
        const timer = Session.get("slider") * 1000;
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