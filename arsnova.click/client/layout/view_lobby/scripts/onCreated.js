import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { EventManager } from '/lib/eventmanager.js';
import { QuestionGroup } from '/lib/questions.js';
import * as localData from '/client/lib/local_storage.js';
import { splashscreenError } from '/client/plugins/splashscreen/scripts/lib.js';
import { calculateButtonCount, setMemberlistObserver } from './lib.js';

Template.memberlist.onCreated(function () {
    var oldStartTimeValues = {};

    var eventManagerHandle = this.subscribe('EventManager.join', Session.get("hashtag"));
    this.autorun(function () {
        if (eventManagerHandle.ready()) {
            var sessionStatus = EventManager.findOne().sessionStatus;
            if (sessionStatus < 2) {
                if (Session.get("isOwner")) {
                    Router.go("/settimer");
                } else {
                    Router.go("/resetToHome");
                }
            } else if (sessionStatus === 3) {
                Router.go("/results");
            }
        }
    });
    this.subscribe('MemberList.members', Session.get("hashtag"), function () {
        $(window).resize(function () {
            var final_height = $(window).height() - $(".navbar-fixed-top").outerHeight() - $(".navbar-fixed-bottom").outerHeight() - $(".fixed-bottom").outerHeight();
            $(".container").css("height", final_height + "px");
            Session.set("LearnerCountOverride", false);
            calculateButtonCount();
        });

        setMemberlistObserver({
            removed: function (id) {
                let idButton = $('#' + id);
                if (idButton.hasClass("color-changing-own-nick")) {
                    splashscreenError.setErrorText(TAPi18n.__("plugins.splashscreen.error.error_messages.kicked_from_quiz"));
                    splashscreenError.open();
                    Router.go("/resetToHome");
                } else {
                    idButton.remove();
                }
            },
            added: function () {
                calculateButtonCount();
            }
        });
    });
    this.subscribe('QuestionGroup.memberlist', Session.get("hashtag"), function () {
        var doc = QuestionGroup.findOne();
        for (var i = 0; i < doc.questionList.length; i++) {
            oldStartTimeValues[i] = doc.questionList[i].startTime;
        }
    });
    this.subscribe('Responses.session', Session.get("hashtag"), function () {
        if (Session.get("isOwner")) {
            Meteor.call('Responses.clearAll', localData.getPrivateKey(), Session.get("hashtag"));
        }
    });

    if (Session.get("isOwner")) {
        Meteor.call("EventManager.setActiveQuestion", localData.getPrivateKey(), Session.get("hashtag"), 0);
        Meteor.call("EventManager.showReadConfirmedForIndex", localData.getPrivateKey(), Session.get("hashtag"), -1);
    }
});