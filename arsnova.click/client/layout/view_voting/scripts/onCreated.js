import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { EventManager } from '/lib/eventmanager.js';
import { AnswerOptions } from '/lib/answeroptions.js';
import {startCountdown, deleteCountdown} from './lib.js';

Template.votingview.onCreated(function () {
    Session.set("sessionClosed", undefined);
    deleteCountdown();

    this.subscribe("EventManager.join", Session.get("hashtag"));
    this.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
        Session.set("questionGroupSubscriptionReady", true);
        if (!Session.get("sessionClosed")) {
            startCountdown(EventManager.findOne().questionIndex);
        }
    });

    this.subscribe('AnswerOptions.public', Session.get("hashtag"), function () {
        var answerOptionCount = AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}).count();
        var responseArr = [];
        for (var i = 0; i < answerOptionCount; i++) {
            responseArr[i] = false;
        }
        Session.set("responses", JSON.stringify(responseArr));
    });
});