import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { MemberList } from '/lib/memberlist.js';
import { splashscreen_error } from '/client/plugins/splashscreen/scripts/lib.js';
import * as lib from './lib.js';

Template.nick.events({
    "click #forwardButton": function (event) {
        event.stopPropagation();
        var nickname = $("#nickname-input-field").val();
        var bgColor = lib.rgbToHex(lib.getRandomInt(0, 255), lib.getRandomInt(0, 255), lib.getRandomInt(0, 255));
        Meteor.call('MemberList.addLearner', {
            hashtag: Session.get("hashtag"),
            nick: nickname,
            backgroundColor: bgColor,
            foregroundColor: lib.transformForegroundColor(lib.hexToRgb(bgColor))
        }, (err) => {
            if (err) {
                $("#forwardButton").attr("disabled", "disabled");
                splashscreen_error.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                splashscreen_error.open();
            } else {
                Session.set("nick", nickname);
                Router.go("/memberlist");
            }
        });
    },
    "click #backButton": function () {
        Router.go("/");
    },
    'input #nickname-input-field': function (event) {
        var currentNickName = event.currentTarget.value;
        var member = MemberList.findOne({nick: currentNickName});

        if (currentNickName.length > 2 && !member && lib.isNickAllowed(currentNickName)) {
            $("#forwardButton").removeAttr("disabled");
        } else {
            $("#forwardButton").attr("disabled", "disabled");
        }
    },
    "keydown #nickname-input-field": function (event) {
        if (event.keyCode == 13) {
            var currentNickName = event.currentTarget.value;
            var member = MemberList.findOne({nick: currentNickName});

            if (currentNickName.length > 2 && !member) {
                $("#forwardButton").click();
            }
        }
    }
});

