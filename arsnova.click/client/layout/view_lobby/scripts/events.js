import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { MemberList } from '/lib/memberlist.js';
import * as localData from '/client/lib/local_storage.js';
import {calculateButtonCount} from './lib.js';

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
        Session.set("nickToBeKicked", {
            nick_name: $(event.currentTarget).text().replace(/(?:\r\n|\r| |\n)/g, ''),
            nick_id: $(event.currentTarget).attr("id")
        });
        $('.js-splashscreen-noLazyClose').modal("show");
    },
    'click #kickMemberButton': function () {
        Meteor.call('MemberList.removeLearner', localData.getPrivateKey(), Session.get("hashtag"), Session.get("nickToBeKicked").nick_id, function (err) {
            $('.js-splashscreen-noLazyClose').modal("hide");
            if (err) {
                $('.errorMessageSplash').parents('.modal').modal('show');
                $("#errorMessage-text").html(err.reason);
            }
        });
    },
    'click #closeDialogButton': function () {
        closeSplashscreen();
    },
    'click #startPolling': function () {
        $('.sound-button').hide();
        Session.set("sessionClosed", false);
        Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), -1);
        Meteor.call('EventManager.setSessionStatus', localData.getPrivateKey(), Session.get("hashtag"), 3);
    }
});