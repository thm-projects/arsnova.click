import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { MemberList } from '/lib/memberlist.js';
import * as localData from '/client/lib/local_storage.js';
import { splashscreenError, Splashscreen } from '/client/plugins/splashscreen/scripts/lib.js';
import { calculateButtonCount } from './lib.js';

Template.memberlist.events({
    "click .btn-more-learners": function () {
        Session.set("LearnerCount", MemberList.find().count());
        Session.set("LearnerCountOverride", true);
    },
    'click .btn-less-learners': function () {
        Session.set("LearnerCountOverride", false);
        calculateButtonCount();
    },
    'click .btn-learner': function (event) {
        event.preventDefault();
        if (!Session.get("isOwner")) {
            return;
        }
        new Splashscreen({
            autostart: true,
            templateName: "kickMemberSplashscreen",
            closeOnButton: '#closeDialogButton, #kickMemberButton',
            onRendered: function () {
                $('#nickName').text($(event.currentTarget).text().replace(/(?:\r\n|\r| |\n)/g, ''));
                $('#kickMemberButton').on('click',function () {
                    Meteor.call('MemberList.removeLearner', localData.getPrivateKey(), Session.get("hashtag"), $(event.currentTarget).attr("id"), function (err) {
                        if (err) {
                            splashscreenError.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages."+err.reason));
                            splashscreenError.open();
                        }
                    });
                });
            }
        });
    },
    'click #startPolling': function () {
        $('.sound-button').hide();
        Session.set("sessionClosed", false);
        Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), -1);
        Meteor.call('EventManager.setSessionStatus', localData.getPrivateKey(), Session.get("hashtag"), 3);
    }
});