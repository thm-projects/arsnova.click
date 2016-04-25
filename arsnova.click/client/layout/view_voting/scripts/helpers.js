import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import { countdown } from './lib.js';

Template.votingview.helpers({
    answerOptions: function () {
        return AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}});
    },
    showForwardButton: function () {
        return Session.get("hasToggledResponse") && !(Session.get("hasSendResponse"));
    },
    answerOptionLetter: function (number) {
        return String.fromCharCode((number.hash.number + 65));
    },
    getCountdown: function () {
        if (Session.get("countdownInitialized")) {
            return TAPi18n.__("view.voting.seconds_left", {value: countdown.get(), count: countdown.get()});
        }
    }
});