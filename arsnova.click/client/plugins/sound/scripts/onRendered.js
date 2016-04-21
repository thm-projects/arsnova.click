import {buzzsound1, setBuzzsound1} from './lib.js';

Template.soundConfig.onRendered(function () {
    setBuzzsound1('waity.mp3');
    Session.set("globalVolume", 80);

    this.$("#slider2").noUiSlider({
        start: Session.get("slider2"),
        range: {
            'min': 0,
            'max': 100
        }
    }).on('slide', function (ev, val) {
        Session.set('slider2', Math.round(val));
        Session.set("globalVolume", Math.round(val));
        buzzsound1.setVolume(Session.get("globalVolume"));


    }).on('change', function (ev, val) {
        Session.set('slider2', Math.round(val));
        Session.set("globalVolume", Math.round(val));
        buzzsound1.setVolume(Session.get("globalVolume"));
    });
});