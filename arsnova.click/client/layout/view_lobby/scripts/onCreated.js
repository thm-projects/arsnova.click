import {calculateButtonCount} from './lib.js';
import * as localData from '../../../lib/local_storage.js';

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

        MemberList.find().observeChanges({
            removed: function (id) {
                let idButton = $('#' + id);
                if (idButton.hasClass("color-changing-own-nick")) {
                    $('.errorMessageSplash').parents('.modal').modal('show');
                    $("#errorMessage-text").html("Du wurdest aus dem Quiz geworfen!");
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