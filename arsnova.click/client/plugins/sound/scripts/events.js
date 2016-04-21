import {buzzsound1, setBuzzsound1} from './lib.js';

Template.soundConfig.events({
    "change #soundSelect": function (evt) {
        switch ($(evt.target).val()) {
            case "Song1":
                buzzsound1.stop();
                setBuzzsound1("waity.mp3");
                break;
            case "Song2":
                buzzsound1.stop();
                setBuzzsound1("jazzy.mp3");
                break;
            case "Song3":
                buzzsound1.stop();
                setBuzzsound1("mariowaity.mp3");
                break;
        }
    },
    "click #js-btn-playMusic": function () {
        if (Session.get("togglemusic")) {
            buzzsound1.play();
        }
    },
    "click #js-btn-stopMusic": function () {
        buzzsound1.stop();
    },
    'shown.bs.modal .modal': function () {
        buzzsound1.stop();
    },
    "click #js-btn-hideSoundModal": function () {
        $('#soundModal').modal("hide");
        buzzsound1.stop();
    },
    'click #isSoundOnButton': function () {
        buzzsound1.stop();
        var btn = $('#isSoundOnButton');
        btn.toggleClass("down");
        if (btn.hasClass("down")) {
            Session.set("togglemusic", true);
            btn.html("Sound ist aktiv!");
        } else {
            Session.set("togglemusic", false);
            btn.html("Sound ist inaktiv!");
        }
    }
});