
Session.setDefault("slider2", 80);


Template.soundConfig.rendered = function () {
    $('.soundConfig').parents('.modal').modal({backdrop: 'static', keyboard: false});


    buzzsound1= new buzz.sound('/sounds/Waity.mp3');
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
    buzzsound1= new buzz.sound('/sounds/Waity.mp3');
    break;

case "Song2":
    buzzsound1.stop();
    buzzsound1 = new buzz.sound('/sounds/Jazzy.mp3');
    break;
case "Song3":
    buzzsound1.stop();
    buzzsound1 = new buzz.sound('/sounds/MarioWaity.mp3');
    break;


    }
    },
    "click #js-btn-playMusic": function(event){
        buzzsound1.play();
    },
    "click #js-btn-stopMusic": function(event){
        buzzsound1.stop();
    },
    'shown.bs.modal .modal': function(e){
        buzzsound1.stop();
    },
    "click #js-btn-hideSoundModal": function(event){
        $('.js-splashscreen-noLazyClose').modal("hide");
        buzzsound1.stop();
    }


});