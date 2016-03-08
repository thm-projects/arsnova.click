var countdown = new ReactiveCountdown(30);

countdown.start(function() {

    // do something when this is completed

});

Template.timerView.helpers({

    getCountdown: function() {
        return countdown.get();
    }

});