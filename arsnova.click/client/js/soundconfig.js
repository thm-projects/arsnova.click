
Session.setDefault("slider2", 80);

Template.soundConfig.onCreated(function () {
    this.autorun(() => {
        this.subscribe('Sessions.instructor', localData.getPrivateKey(), Session.get("hashtag"));
});
});

Template.soundConfig.helpers({
    isSoundOn:function () {

        var thisSession = Sessions.findOne({hashtag:Session.get("hashtag")});
        if (!thisSession) {
            return false;
        }
        return thisSession.isSoundOn;
    }
});




Template.soundConfig.rendered = function () {


    buzzsound1= new buzz.sound('/sounds/Waity.mp3', {
        loop: true
    });
    globalVolume=80;

    this.$("#slider2").noUiSlider({
        start: Session.get("slider2"),
        range: {
            'min': 0,
            'max': 100
        }
    }).on('slide', function (ev, val) {
        //
        Session.set('slider2', Math.round(val));
        globalVolume=Math.round(val);
        buzzsound1.setVolume(globalVolume);


    }).on('change', function (ev, val) {
        Session.set('slider2', Math.round(val));
        globalVolume=Math.round(val);
        buzzsound1.setVolume(globalVolume);
    });
};

Template.soundConfig.helpers({
    slider2: function () {
        return Session.get("slider2");
    }
});

Template.soundConfig.events({
    "change #soundSelect": function(evt) {

    switch ($(evt.target).val()) {
case "Song1":
    buzzsound1.stop();
    buzzsound1= new buzz.sound('/sounds/Waity.mp3', {
        loop: true
    });
    break;

case "Song2":
    buzzsound1.stop();
    buzzsound1 = new buzz.sound('/sounds/Jazzy.mp3', {
        loop: true
    });
    break;
case "Song3":
    buzzsound1.stop();
    buzzsound1 = new buzz.sound('/sounds/MarioWaity.mp3', {
        loop: true
    });
    break;


    }
    },
    "click #js-btn-playMusic": function(event){
        const doc = Sessions.findOne({hashtag: Session.get("hashtag")});
        if(doc.isSoundOn==1){
            buzzsound1.play();
        }
    },
    "click #js-btn-stopMusic": function(event){
        buzzsound1.stop();
    },
    'shown.bs.modal .modal': function(e){
        buzzsound1.stop();
    },
    "click #js-btn-hideSoundModal": function(event){
        localData.updateIsSoundOn(Session.get("hashtag"), Sessions.findOne({hashtag: Session.get("hashtag")}).isSoundOn);
        $('#soundModal').modal("hide");
        buzzsound1.stop();
    },


    'click #isSoundOnButton': function (event) {
        buzzsound1.stop();
        event.preventDefault();

        var newVal = 0;
        var sessionDoc = Sessions.findOne({hashtag:Session.get("hashtag")});
        if (sessionDoc) {
            if (!sessionDoc.isSoundOn) {
                newVal = 1;
            }
        }
        Meteor.call("Sessions.updateIsSoundOn", {
            privateKey: localData.getPrivateKey(),
            hashtag: Session.get("hashtag"),
            isSoundOn: newVal
        });

        var btn = $('#isSoundOnButton');
        btn.toggleClass("down");
        if(btn.hasClass("down")){
            btn.html("Sound ist aktiv!");
        }else{
            btn.html("Sound ist inaktiv!");
        }
    }

});